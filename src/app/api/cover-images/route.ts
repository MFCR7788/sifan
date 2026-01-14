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

    // 从 header 中获取备选 userId（用于嵌入式页面）
    const headerUserId = request.headers.get('x-user-id');
    const finalUserId = userId || headerUserId;

    console.log('保存封面图请求参数:', {
      bodyUserId: userId,
      headerUserId,
      finalUserId,
      userName,
      platform,
      style,
      ratio,
      size,
      inputText: inputText?.substring(0, 50),
      imageUrl: imageUrl?.substring(0, 100),
      isPublic,
    });

    if (!finalUserId) {
      console.error('缺少userId参数');
      return NextResponse.json(
        { error: '缺少用户ID参数' },
        { status: 400 }
      );
    }

    if (!userName) {
      console.error('缺少userName参数');
      return NextResponse.json(
        { error: '缺少用户名参数' },
        { status: 400 }
      );
    }

    if (!platform) {
      console.error('缺少platform参数');
      return NextResponse.json(
        { error: '缺少平台参数' },
        { status: 400 }
      );
    }

    if (!inputText) {
      console.error('缺少inputText参数');
      return NextResponse.json(
        { error: '缺少文案内容参数' },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      console.error('缺少imageUrl参数');
      return NextResponse.json(
        { error: '缺少图片URL参数' },
        { status: 400 }
      );
    }

    const db = await getDb();
    console.log('数据库连接成功');

    const insertData = {
      userId: finalUserId,
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
    };

    console.log('准备插入数据:', insertData);

    const [image] = await db.insert(coverImages).values(insertData).returning();

    console.log('保存成功:', image);

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('保存封面图失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: '保存失败，请重试' },
      { status: 500 }
    );
  }
}
