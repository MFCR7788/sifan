import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { resourceCategories } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();

    const categories = await db
      .select()
      .from(resourceCategories)
      .where(eq(resourceCategories.isActive, true))
      .orderBy(resourceCategories.sortOrder);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: '获取分类失败' },
      { status: 500 }
    );
  }
}
