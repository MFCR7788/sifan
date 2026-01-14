import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { coverImages } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// DELETE - 删除封面图（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证管理员权限
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: '无权操作' },
        { status: 403 }
      );
    }

    const db = await getDb();

    // 删除图片记录
    await db.delete(coverImages).where(eq(coverImages.id, id));

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除封面图失败:', error);
    return NextResponse.json(
      { error: '删除失败，请重试' },
      { status: 500 }
    );
  }
}
