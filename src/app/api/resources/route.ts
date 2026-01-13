import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { resources } from '@/storage/database/shared/schema';
import { eq, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    const db = await getDb();

    let query = db
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
      })
      .from(resources)
      .where(eq(resources.isPublished, true));

    if (categoryId) {
      query = query.where(eq(resources.categoryId, categoryId));
    }

    const resourcesList = await query.orderBy(asc(resources.sortOrder));

    return NextResponse.json({ resources: resourcesList });
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return NextResponse.json(
      { error: '获取资源失败' },
      { status: 500 }
    );
  }
}
