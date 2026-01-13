import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { resources } from '@/storage/database/shared/schema';
import { eq, or, and, sql } from 'drizzle-orm';
import { integration_detail } from '@/coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: '请提供搜索关键词' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 降级方案：直接使用关键词搜索
    const keywordResults = await db
      .select({
        id: resources.id,
        title: resources.title,
        slug: resources.slug,
        content: resources.content,
        summary: resources.summary,
        contentType: resources.contentType,
        tags: resources.tags,
        categoryId: resources.categoryId,
        viewCount: resources.viewCount,
      })
      .from(resources)
      .where(
        and(
          eq(resources.isPublished, true),
          or(
            sql`${resources.title} ILIKE ${'%' + query + '%'}`,
            sql`${resources.summary} ILIKE ${'%' + query + '%'}`,
            sql`${resources.content} ILIKE ${'%' + query + '%'}`,
            sql`${resources.tags} ILIKE ${'%' + query + '%'}`
          )
        )
      );

    return NextResponse.json({
      results: keywordResults,
      message: `找到 ${keywordResults.length} 个相关资源`
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}
