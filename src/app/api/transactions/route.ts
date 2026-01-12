import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';

/**
 * 获取用户交易记录
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await memberManager.getUserTransactions(
      userId,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      transactions,
      total: transactions.length,
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取交易记录失败' },
      { status: 500 }
    );
  }
}
