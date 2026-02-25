import { NextRequest, NextResponse } from 'next/server';
import { queryWechatOrder } from '@/services/wechatPay';
import { queryAlipayOrder } from '@/services/alipay';
import { getPaymentOrderByOrderNo, markOrderAsPaid } from '@/storage/database/paymentOrderManager';

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

    // 如果支付成功，调用 markOrderAsPaid 更新订单状态并执行业务逻辑
    if (isPaid) {
      try {
        // 获取交易号
        const tradeNo = resultAny?.transaction_id || '';
        const transactionId = resultAny?.transaction_id || '';

        // 标记订单为已支付（这会触发余额增加等业务逻辑）
        await markOrderAsPaid(order.orderNo, tradeNo, transactionId);

        console.log('✅ 支付订单已标记为已支付，业务逻辑已执行:', order.orderNo);

        // 重新获取更新后的订单信息
        const updatedOrder = await getPaymentOrderByOrderNo(order.orderNo);

        return NextResponse.json({
          success: true,
          isPaid: true,
          status: 'paid',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: updatedOrder?.orderNo || order.orderNo,
            amount: updatedOrder?.amount || order.amount,
            paidAt: updatedOrder?.paidAt || new Date().toISOString(),
          },
        });
      } catch (markError: any) {
        console.error('❌ 标记订单为已支付失败:', markError);
        // 即使标记失败，也返回支付成功状态，让前端显示成功
        return NextResponse.json({
          success: true,
          isPaid: true,
          status: 'paid',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: order.orderNo,
            amount: order.amount,
          },
          warning: '订单状态更新失败，但支付已完成',
        });
      }
    }

    // 支付未完成，返回待支付状态
    return NextResponse.json({
      success: true,
      isPaid: false,
      status: 'pending',
      paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
      order: {
        orderNo: order.orderNo,
        amount: order.amount,
      },
    });
  } catch (error: unknown) {
    console.error('Query Payment Status Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '查询支付状态失败' },
      { status: 500 }
    );
  }
}
