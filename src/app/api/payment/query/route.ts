import { NextRequest, NextResponse } from 'next/server';
import { queryWechatOrder } from '@/services/wechatPay';
import { queryAlipayOrder } from '@/services/alipay';
import { getPaymentOrderByOrderNo } from '@/storage/database/paymentOrderManager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');

    if (!orderNo) {
      return NextResponse.json(
        { success: false, error: '订单号不能为空' },
        { status: 400 }
      );
    }

    // 从数据库获取订单信息
    const order = await getPaymentOrderByOrderNo(orderNo);

    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    // 如果订单已支付，直接返回
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        status: 'paid',
        order: {
          orderNo: order.orderNo,
          amount: order.amount,
          paidAt: order.paidAt,
        },
      });
    }

    // 如果订单已取消或失败，返回对应状态
    if (order.status === 'failed' || order.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        isPaid: false,
        status: order.status,
        order: {
          orderNo: order.orderNo,
          amount: order.amount,
        },
      });
    }

    // 查询第三方支付状态
    let result;

    if (order.paymentMethod === 'wechat') {
      result = await queryWechatOrder(order.orderNo);
    } else if (order.paymentMethod === 'alipay') {
      result = await queryAlipayOrder(order.orderNo);
    } else {
      return NextResponse.json(
        { success: false, error: '不支持的支付方式' },
        { status: 400 }
      );
    }

    // 判断支付状态
    const resultAny = result as any;
    const isPaid =
      resultAny?.trade_state === 'SUCCESS' ||
      resultAny?.tradeStatus === 'TRADE_SUCCESS';

    return NextResponse.json({
      success: true,
      isPaid,
      status: isPaid ? 'paid' : 'pending',
      paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
      order: {
        orderNo: order.orderNo,
        amount: order.amount,
      },
    });
  } catch (error: any) {
    console.error('Query Payment Status Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '查询支付状态失败' },
      { status: 500 }
    );
  }
}
