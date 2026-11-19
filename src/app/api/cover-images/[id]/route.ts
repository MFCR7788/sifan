import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { coverImages } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

// DELETE - 删除封面图（管理员）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 验证管理员权限
    const guard = await requireAdmin(request);
    if (!guard.ok) return guard.response;

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
