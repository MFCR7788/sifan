import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { resources } from '@/storage/database/shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const db = await getDb();

    // 获取资源详情
    const resource = await db
      .select({
        id: resources.id,
        title: resources.title,
        slug: resources.slug,
        content: resources.content,
        contentType: resources.contentType,
        videoUrl: resources.videoUrl,
        thumbnail: resources.thumbnail,
        summary: resources.summary,
        tags: resources.tags,
        viewCount: resources.viewCount,
        publishedAt: resources.publishedAt,
        categoryId: resources.categoryId,
        createdAt: resources.createdAt,
        updatedAt: resources.updatedAt,
      })
      .from(resources)
      .where(eq(resources.slug, slug))
      .limit(1);

    if (resource.length === 0) {
      return NextResponse.json(
        { error: '资源不存在' },
        { status: 404 }
      );
    }

    // 增加查看次数
    await db
      .update(resources)
      .set({
        viewCount: sql`${resources.viewCount} + 1`,
      })
      .where(eq(resources.id, resource[0].id));

    return NextResponse.json({ resource: resource[0] });
  } catch (error) {
    console.error('Failed to fetch resource details:', error);
    return NextResponse.json(
      { error: '获取资源详情失败' },
      { status: 500 }
    );
  }
}
