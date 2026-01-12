import { NextRequest, NextResponse } from 'next/server';
import { getPaymentOrderByOrderNo, markOrderAsPaid } from '@/storage/database/paymentOrderManager';

/**
 * 支付宝回调通知
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const outTradeNo = formData.get('out_trade_no') as string;
    const tradeStatus = formData.get('trade_status') as string;
    const tradeNo = formData.get('trade_no') as string;

    console.log('支付宝回调通知:', {
      outTradeNo,
      tradeStatus,
      tradeNo,
    });

    if (!outTradeNo) {
      return new Response('success', { status: 200 });
    }

    // 从数据库获取订单
    const order = await getPaymentOrderByOrderNo(outTradeNo);

    if (!order) {
      console.error('订单不存在:', outTradeNo);
      return new Response('success', { status: 200 });
    }

    // 如果交易成功，更新订单状态
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      // 更新订单状态为已支付
      await markOrderAsPaid(outTradeNo, tradeNo || '', tradeNo || '');

      console.log('订单已更新为已支付:', outTradeNo);
    }

    // 返回成功响应
    return new Response('success', { status: 200 });
  } catch (error: any) {
    console.error('支付宝回调处理错误:', error);
    return new Response('success', { status: 200 });
  }
}
