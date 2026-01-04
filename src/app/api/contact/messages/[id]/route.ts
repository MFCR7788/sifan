import { NextRequest, NextResponse } from 'next/server';
import { contactManager } from '@/storage/database/contactManager';

/**
 * DELETE /api/contact/messages/[id]
 * 删除指定留言
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const success = await contactManager.deleteMessage(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '留言删除成功',
      });
    } else {
      return NextResponse.json(
        { success: false, error: '留言不存在或已被删除' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { success: false, error: '删除留言失败' },
      { status: 500 }
    );
  }
}
