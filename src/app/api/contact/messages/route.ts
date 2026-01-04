import { NextRequest, NextResponse } from 'next/server';
import { contactManager } from '@/storage/database/contactManager';

/**
 * GET /api/contact/messages
 * 获取所有留言
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const messages = await contactManager.getAllMessages(limit, offset);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { success: false, error: '获取留言失败' },
      { status: 500 }
    );
  }
}
