import { NextRequest, NextResponse } from 'next/server';
import { getDb, getPool } from 'coze-coding-dev-sdk';
import { coverImages, users } from '@/storage/database/shared/schema';

// GET - 获取封面图列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');

    console.log('获取封面图列表参数:', { platform, userId, isPublic });

    const pool = await getPool();

    // 构建查询条件
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // 如果指定了 userId，查询该用户的所有图片（不管是否公开）
    // 否则只查询公开的图片
    if (userId) {
      conditions.push(`user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    } else if (isPublic === 'true') {
      conditions.push(`is_public = true`);
    }

    if (platform) {
      conditions.push(`platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }

    // 构建完整 SQL
    let sql = 'SELECT * FROM cover_images';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC LIMIT 50';

    console.log('执行 SQL:', sql);
    console.log('参数:', params);

    const result = await pool.query(sql, params);
    const images = result.rows;

    console.log('查询结果:', images.length, '条记录');

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
        { error: '缺少用户ID参数，请重新登录' },
        { status: 400 }
      );
    }

    if (!userName) {
      console.error('缺少userName参数');
      return NextResponse.json(
        { error: '缺少用户名参数，请重新登录' },
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

    const pool = await getPool();
    console.log('数据库连接成功');

    // 检查用户是否存在
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [finalUserId]);
    if (userResult.rows.length === 0) {
      console.error('用户不存在于数据库:', finalUserId);
      return NextResponse.json(
        {
          error: '用户信息已过期，请重新登录',
          details: { userId: finalUserId, message: '用户不存在于数据库' }
        },
        { status: 404 }
      );
    }

    console.log('用户验证通过:', userResult.rows[0].name);

    // 使用 pool.query 插入数据
    const insertSql = `
      INSERT INTO cover_images (user_id, user_name, platform, style, ratio, size, prompt, input_text, image_url, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      finalUserId,
      userName,
      platform,
      style || null,
      ratio || null,
      size || null,
      prompt || null,
      inputText,
      imageUrl,
      isPublic || false,
    ];

    console.log('执行 SQL:', insertSql);
    console.log('参数:', params);

    const result = await pool.query(insertSql, params);
    console.log('SQL 执行结果:', result);

    const image = result.rows[0];
    console.log('保存成功:', image);

    return NextResponse.json({
      success: true,
      data: image,
    });
  } catch (error) {
    console.error('保存封面图失败 - 完整错误对象:', error);

    let errorMessage = '保存失败，请重试';
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // 只显示前3行
      };
      console.error('错误详情:', errorDetails);
    } else {
      errorDetails = { error };
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
