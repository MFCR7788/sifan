import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/storage/database/orderManager';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const params = await context.params;
    const { orderNumber } = params;

    if (!orderNumber) {
      return NextResponse.json(
        { error: '订单号不能为空' },
        { status: 400 }
      );
    }

    const order = await orderManager.getOrderByOrderNumber(orderNumber);

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    console.error('Get order by number error:', error);
    return NextResponse.json(
      { error: '获取订单失败' },
      { status: 500 }
    );
  }
}
