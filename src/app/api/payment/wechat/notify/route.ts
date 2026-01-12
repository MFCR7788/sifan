import { NextRequest, NextResponse } from 'next/server';
import { getPaymentOrderByOrderNo, markOrderAsPaid } from '@/storage/database/paymentOrderManager';

/**
 * 微信支付回调通知
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('wechatpay-signature');
    const timestamp = request.headers.get('wechatpay-timestamp');
    const nonce = request.headers.get('wechatpay-nonce');
    const serial = request.headers.get('wechatpay-serial');
    const requestId = request.headers.get('wechatpay-serial');

    console.log('微信支付回调通知:', {
      signature,
      timestamp,
      nonce,
      serial,
      requestId,
    });

    // 解析回调数据
    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      console.error('解析回调数据失败:', error);
      return NextResponse.json({ code: 'FAIL', message: '解析数据失败' }, { status: 400 });
    }

    // 获取订单号
    const outTradeNo = data?.resource?.ciphertext
      ? JSON.parse(
          Buffer.from(
            data.resource.ciphertext,
            'base64'
          ).toString('utf-8')
        ).out_trade_no
      : data?.out_trade_no;

    console.log('订单号:', outTradeNo);

    if (!outTradeNo) {
      return NextResponse.json({ code: 'FAIL', message: '订单号缺失' }, { status: 400 });
    }

    // 从数据库获取订单
    const order = await getPaymentOrderByOrderNo(outTradeNo);

    if (!order) {
      console.error('订单不存在:', outTradeNo);
      return NextResponse.json({ code: 'FAIL', message: '订单不存在' }, { status: 404 });
    }

    // 获取交易状态
    let tradeState = data?.resource?.ciphertext
      ? JSON.parse(
          Buffer.from(
            data.resource.ciphertext,
            'base64'
          ).toString('utf-8')
        ).trade_state
      : data?.trade_state;

    console.log('交易状态:', tradeState);

    // 如果交易成功，更新订单状态
    if (tradeState === 'SUCCESS') {
      const tradeNo = data?.resource?.ciphertext
        ? JSON.parse(
            Buffer.from(
              data.resource.ciphertext,
              'base64'
            ).toString('utf-8')
          ).transaction_id
        : data?.transaction_id;

      console.log('交易号:', tradeNo);

      // 更新订单状态为已支付
      await markOrderAsPaid(outTradeNo, tradeNo || '', tradeNo || '');

      console.log('订单已更新为已支付:', outTradeNo);
    }

    // 返回成功响应
    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  } catch (error: any) {
    console.error('微信支付回调处理错误:', error);
    return NextResponse.json({ code: 'FAIL', message: error.message || '处理失败' }, { status: 500 });
  }
}
