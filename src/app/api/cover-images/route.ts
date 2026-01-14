import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { coverImages } from '@/storage/database/shared/schema';
import { desc, eq, and } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

// GET - 获取封面图列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const isPublic = searchParams.get('public');

    const db = await getDb();

    // 构建查询条件
    const conditions = [];

    if (platform) {
      conditions.push(eq(coverImages.platform, platform));
    }

    if (isPublic === 'true') {
      conditions.push(eq(coverImages.isPublic, true));
    }

    // 执行查询
    const images = await db
      .select()
      .from(coverImages)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(coverImages.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('获取封面图列表失败:', error);
    return NextResponse.json(
      { error: '获取失败，请重试' },
      { status: 500 }
    );
  }
}

// POST - 保存封面图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, platform, style, ratio, size, prompt, inputText, imageUrl, isPublic } = body;

    if (!userId || !userName || !platform || !inputText || !imageUrl) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const [image] = await db.insert(coverImages).values({
      userId,
      userName,
      platform,
      style,
      ratio,
      size,
      prompt,
      inputText,
      imageUrl,
      isPublic: isPublic || false,
      viewCount: 0,
      downloadCount: 0,
    }).returning();

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('保存封面图失败:', error);
    return NextResponse.json(
      { error: '保存失败，请重试' },
      { status: 500 }
    );
  }
}
