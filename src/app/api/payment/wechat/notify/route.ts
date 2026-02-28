import { NextRequest, NextResponse } from 'next/server';
import { getPaymentOrderByOrderNo, markOrderAsPaid, markOrderAsFailed } from '@/storage/database/paymentOrderManager';
import crypto from 'crypto';
import { retryWithTimeout } from '@/utils/retry';
import { logger } from '@/utils/logger';
import { sendPaymentCallbackAlert, recordPaymentProcessingTime, recordPaymentStatus, AlertLevel } from '@/utils/monitor';

/**
 * 验证微信支付回调签名
 */
function verifyWechatSignature(body: string, signature: string, timestamp: string, nonce: string, serial: string) {
  try {
    const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY;
    if (!apiV3Key) {
      throw new Error('WECHAT_PAY_API_V3_KEY 未配置');
    }

    // 构造验签字符串
    const message = `${timestamp}\n${nonce}\n${body}\n`;
    
    // 使用 API V3 Key 进行 HMAC-SHA256 签名
    const hmac = crypto.createHmac('sha256', apiV3Key);
    hmac.update(message);
    const expectedSignature = 'WECHATPAY2-SHA256-RSA2048 ' + hmac.digest('base64');
    
    // 验证签名
    return signature === expectedSignature;
  } catch (error) {
    console.error('验证签名失败:', error);
    return false;
  }
}

/**
 * 解密微信支付回调数据
 */
function decryptWechatData(encryptedData: string, associatedData: string, nonce: string) {
  try {
    const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY;
    if (!apiV3Key) {
      throw new Error('WECHAT_PAY_API_V3_KEY 未配置');
    }

    // 解密逻辑（简化版，实际需要使用官方SDK或正确的解密算法）
    // 这里使用简化处理，实际项目中应该使用微信支付官方SDK
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('解密数据失败:', error);
    throw error;
  }
}

/**
 * 微信支付回调通知
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.text();
    const signature = request.headers.get('wechatpay-signature');
    const timestamp = request.headers.get('wechatpay-timestamp');
    const nonce = request.headers.get('wechatpay-nonce');
    const serial = request.headers.get('wechatpay-serial');
    const requestId = request.headers.get('x-request-id');

    const webhookLogger = logger.withContext('wechat-pay-webhook').withCorrelationId(requestId || '');
    webhookLogger.webhook('微信支付回调通知开始', {
      signature,
      timestamp,
      nonce,
      serial,
      requestId,
    });

    // 记录支付处理时间开始
    const processStart = Date.now();

    // 验证必要参数
    if (!signature || !timestamp || !nonce || !serial) {
      webhookLogger.error('回调参数缺失');
      return NextResponse.json({ code: 'FAIL', message: '参数缺失' }, { status: 400 });
    }

    // 验证签名
    if (!verifyWechatSignature(body, signature, timestamp, nonce, serial)) {
      webhookLogger.error('签名验证失败');
      return NextResponse.json({ code: 'FAIL', message: '签名验证失败' }, { status: 401 });
    }

    // 解析回调数据
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      webhookLogger.error('解析回调数据失败', error as Error);
      return NextResponse.json({ code: 'FAIL', message: '解析数据失败' }, { status: 400 });
    }

    // 获取订单信息
    let outTradeNo: string | undefined;
    let tradeState: string | undefined;
    let tradeNo: string | undefined;

    if (data?.resource?.ciphertext) {
      try {
        // 解密数据
        const decryptedData = decryptWechatData(
          data.resource.ciphertext,
          data.resource.associated_data || '',
          data.resource.nonce
        );
        outTradeNo = decryptedData.out_trade_no;
        tradeState = decryptedData.trade_state;
        tradeNo = decryptedData.transaction_id;
      } catch (error) {
        webhookLogger.error('解密数据失败', error as Error);
        return NextResponse.json({ code: 'FAIL', message: '解密数据失败' }, { status: 400 });
      }
    } else {
      // 兼容旧版格式
      outTradeNo = data?.out_trade_no;
      tradeState = data?.trade_state;
      tradeNo = data?.transaction_id;
    }

    webhookLogger.webhook('解析后的订单信息', {
      outTradeNo,
      tradeState,
      tradeNo,
    });

    if (!outTradeNo) {
      webhookLogger.error('订单号缺失');
      return NextResponse.json({ code: 'FAIL', message: '订单号缺失' }, { status: 400 });
    }

    // 从数据库获取订单
    const order = await getPaymentOrderByOrderNo(outTradeNo);

    if (!order) {
      webhookLogger.error('订单不存在', { outTradeNo });
      return NextResponse.json({ code: 'FAIL', message: '订单不存在' }, { status: 404 });
    }

    // 处理交易状态
    if (tradeState === 'SUCCESS') {
      webhookLogger.webhook('交易成功，更新订单状态', { outTradeNo });
      // 使用重试机制更新订单状态为已支付
      await retryWithTimeout(async () => {
        await markOrderAsPaid(outTradeNo, tradeNo || '', tradeNo || '');
      }, 30000, 3, 1000);
      webhookLogger.webhook('订单已更新为已支付', { outTradeNo });
    } else if (tradeState && ['CLOSED', 'REFUND', 'PAYMENT_REFUSED'].includes(tradeState)) {
      webhookLogger.webhook('交易失败，更新订单状态', { outTradeNo, tradeState });
      // 使用重试机制更新订单状态为失败
      await retryWithTimeout(async () => {
        await markOrderAsFailed(outTradeNo);
      }, 30000, 3, 1000);
      webhookLogger.webhook('订单已更新为失败', { outTradeNo });
    }

    const processingTime = Date.now() - startTime;
    const processDuration = Date.now() - processStart;
    
    // 记录支付处理时间
    await recordPaymentProcessingTime('wechat_callback', processDuration, 'wechat', tradeState);
    
    // 记录支付状态
    await recordPaymentStatus(tradeState || 'unknown', 'wechat');
    
    webhookLogger.webhook('微信支付回调处理完成', {
      outTradeNo,
      tradeState,
      processingTime: `${processingTime}ms`,
      processDuration: `${processDuration}ms`,
    });

    // 返回成功响应
    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id');
    const webhookLogger = logger.withContext('wechat-pay-webhook').withCorrelationId(requestId || '');
    webhookLogger.error('微信支付回调处理错误', error as Error);
    
    // 发送告警
    await sendPaymentCallbackAlert(
      AlertLevel.ERROR,
      '微信支付回调处理错误',
      { error: (error as Error).message, stack: (error as Error).stack },
      requestId
    );
    
    // 即使发生错误，也返回成功响应，避免微信支付重复回调
    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  }
}
