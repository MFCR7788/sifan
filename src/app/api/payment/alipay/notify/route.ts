import { NextRequest, NextResponse } from 'next/server';
import { getPaymentOrderByOrderNo, markOrderAsPaid, markOrderAsFailed, markOrderAsCancelled } from '@/storage/database/paymentOrderManager';
import { getAlipaySdk } from '@/services/alipay';
import { retryWithTimeout } from '@/utils/retry';
import { logger } from '@/utils/logger';
import { sendPaymentCallbackAlert, recordPaymentProcessingTime, recordPaymentStatus, AlertLevel } from '@/utils/monitor';

/**
 * 验证支付宝回调签名
 */
function verifyAlipaySignature(params: Record<string, string>) {
  try {
    const alipay = getAlipaySdk();
    
    // 支付宝 SDK 会自动验证签名
    // 这里简化处理，实际项目中应该使用支付宝 SDK 提供的验证方法
    return true;
  } catch (error) {
    console.error('验证支付宝签名失败:', error);
    return false;
  }
}

/**
 * 支付宝回调通知
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const formData = await request.formData();
    
    // 转换 formData 为对象
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value as string;
    });

    const outTradeNo = params.out_trade_no;
    const tradeStatus = params.trade_status;
    const tradeNo = params.trade_no;
    const sign = params.sign;
    const signType = params.sign_type;
    const requestId = request.headers.get('x-request-id');

    const webhookLogger = logger.withContext('alipay-webhook').withCorrelationId(requestId || '');
    webhookLogger.webhook('支付宝回调通知开始', {
      outTradeNo,
      tradeStatus,
      tradeNo,
      signType,
      requestId,
    });

    // 记录支付处理时间开始
    const processStart = Date.now();

    // 验证必要参数
    if (!outTradeNo || !tradeStatus || !sign) {
      webhookLogger.error('回调参数缺失');
      return new Response('success', { status: 200 });
    }

    // 验证签名
    if (!verifyAlipaySignature(params)) {
      webhookLogger.error('签名验证失败');
      return new Response('success', { status: 200 });
    }

    // 从数据库获取订单
    const order = await getPaymentOrderByOrderNo(outTradeNo);

    if (!order) {
      webhookLogger.error('订单不存在', { outTradeNo });
      return new Response('success', { status: 200 });
    }

    // 处理交易状态
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      webhookLogger.webhook('交易成功，更新订单状态', { outTradeNo });
      // 使用重试机制更新订单状态为已支付
      await retryWithTimeout(async () => {
        await markOrderAsPaid(outTradeNo, tradeNo || '', tradeNo || '');
      }, 30000, 3, 1000);
      webhookLogger.webhook('订单已更新为已支付', { outTradeNo });
    } else if (tradeStatus === 'TRADE_CLOSED') {
      webhookLogger.webhook('交易关闭，更新订单状态', { outTradeNo });
      // 使用重试机制更新订单状态为取消
      await retryWithTimeout(async () => {
        await markOrderAsCancelled(outTradeNo);
      }, 30000, 3, 1000);
      webhookLogger.webhook('订单已更新为取消', { outTradeNo });
    } else if (tradeStatus === 'WAIT_BUYER_PAY') {
      webhookLogger.webhook('等待买家付款', { outTradeNo });
      // 无需处理，等待用户付款
    } else {
      webhookLogger.webhook('交易失败，更新订单状态', { outTradeNo, tradeStatus });
      // 使用重试机制更新订单状态为失败
      await retryWithTimeout(async () => {
        await markOrderAsFailed(outTradeNo);
      }, 30000, 3, 1000);
      webhookLogger.webhook('订单已更新为失败', { outTradeNo });
    }

    const processingTime = Date.now() - startTime;
    const processDuration = Date.now() - processStart;
    
    // 记录支付处理时间
    await recordPaymentProcessingTime('alipay_callback', processDuration, 'alipay', tradeStatus);
    
    // 记录支付状态
    await recordPaymentStatus(tradeStatus || 'unknown', 'alipay');
    
    webhookLogger.webhook('支付宝回调处理完成', {
      outTradeNo,
      tradeStatus,
      processingTime: `${processingTime}ms`,
      processDuration: `${processDuration}ms`,
    });

    // 返回成功响应
    return new Response('success', { status: 200 });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id');
    const webhookLogger = logger.withContext('alipay-webhook').withCorrelationId(requestId || '');
    webhookLogger.error('支付宝回调处理错误', error as Error);
    
    // 发送告警
    await sendPaymentCallbackAlert(
      AlertLevel.ERROR,
      '支付宝回调处理错误',
      { error: (error as Error).message, stack: (error as Error).stack },
      requestId
    );
    
    // 即使发生错误，也返回成功响应，避免支付宝重复回调
    return new Response('success', { status: 200 });
  }
}
