import { NextRequest, NextResponse } from 'next/server';
import { markOrderAsPaid } from '@/storage/database/paymentOrderManager';

/**
 * 开发环境：模拟支付完成接口
 *
 * 用于测试支付流程，手动将订单标记为已支付
 */
export async function POST(request: NextRequest) {
  try {
    // 仅在开发环境允许使用
    if (process.env.NODE_ENV !== 'development' && !process.env.ALLOW_MOCK_PAYMENT) {
      return NextResponse.json(
        { success: false, error: '此接口仅在开发环境可用' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderNo } = body;

    if (!orderNo) {
      return NextResponse.json(
        { success: false, error: '订单号不能为空' },
        { status: 400 }
      );
    }

    console.log('=== 模拟支付完成 ===');
    console.log('订单号:', orderNo);
    console.log('=====================');

    // 标记订单为已支付
    await markOrderAsPaid(
      orderNo,
      `mock_trade_${Date.now()}`,
      `mock_transaction_${Date.now()}`
    );

    return NextResponse.json({
      success: true,
      message: '模拟支付成功',
      orderNo,
    });
  } catch (error: unknown) {
    console.error('模拟支付完成错误:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '模拟支付失败' },
      { status: 500 }
    );
  }
}
