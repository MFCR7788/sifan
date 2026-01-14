import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'coze-coding-dev-sdk';
import { verifyAdmin } from '@/lib/admin-auth';

// DELETE - 删除AI图像（管理员）
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

    const pool = await getPool();

    // 删除图片记录
    const result = await pool.query('DELETE FROM ai_images WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '图片不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    console.error('删除AI图像失败:', error);
    return NextResponse.json(
      { error: '删除失败，请重试' },
      { status: 500 }
    );
  }
}
