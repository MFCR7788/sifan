import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/storage/database/orderManager';

/**
 * 将数据库字段名（下划线）转换为前端字段名（驼峰）
 */
function convertToCamelCase(dbOrder: any): any {
  if (!dbOrder) return null;

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number,
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    customerEmail: dbOrder.customer_email,
    platform: dbOrder.platform,
    serviceLevel: dbOrder.service_level,
    selectedFeatures: dbOrder.selected_features,
    valueServices: dbOrder.value_services,
    totalPrice: dbOrder.total_price,
    monthlyFee: dbOrder.monthly_fee,
    status: dbOrder.status,
    paymentMethod: dbOrder.payment_method,
    paymentTime: dbOrder.payment_time,
    notes: dbOrder.notes,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
  };
}

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

    const dbOrder = await orderManager.getOrderByOrderNumber(orderNumber);

    if (!dbOrder) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    // 转换为驼峰命名格式
    const order = convertToCamelCase(dbOrder);

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
