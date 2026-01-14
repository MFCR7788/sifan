import { NextRequest, NextResponse } from 'next/server';
import { getPool } from 'coze-coding-dev-sdk';

// GET - 获取AI图像列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const style = searchParams.get('style');
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public');

    console.log('获取AI图像列表参数:', { style, userId, isPublic });

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

    if (style) {
      conditions.push(`style = $${paramIndex}`);
      params.push(style);
      paramIndex++;
    }

    // 构建完整 SQL
    let sql = 'SELECT * FROM ai_images';
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
    console.error('获取AI图像列表失败:', error);
    return NextResponse.json(
      { error: '获取失败，请重试' },
      { status: 500 }
    );
  }
}

// POST - 保存AI图像
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userName,
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio,
      size,
      prompt,
      imageUrl,
      isPublic
    } = body;

    // 从 header 中获取备选 userId（用于嵌入式页面）
    const headerUserId = request.headers.get('x-user-id');
    const finalUserId = userId || headerUserId;

    console.log('保存AI图像请求参数:', {
      bodyUserId: userId,
      headerUserId,
      finalUserId,
      userName,
      themeContent: themeContent?.substring(0, 50),
      style,
      quality,
      lighting,
      ratio,
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

    if (!themeContent) {
      console.error('缺少themeContent参数');
      return NextResponse.json(
        { error: '缺少主题内容参数' },
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
      INSERT INTO ai_images (user_id, user_name, theme_content, style, detail_requirement, quality, lighting, ratio, size, prompt, image_url, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const params = [
      finalUserId,
      userName,
      themeContent,
      style || null,
      detailRequirement || null,
      quality || null,
      lighting || null,
      ratio || null,
      size || null,
      prompt || null,
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
    console.error('保存AI图像失败 - 完整错误对象:', error);

    let errorMessage = '保存失败，请重试';
    let errorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
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
