import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY } = await request.json();

    console.log('直接测试 Coze API，API Key:', apiKey?.substring(0, 7) + '...');

    // 测试正确的 API 端点
    const response = await fetch('https://api.coze.cn/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-251015',
        messages: [
          {
            role: 'system',
            content: '你是一个测试助手。',
          },
          {
            role: 'user',
            content: '请回复：测试成功',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log('Coze API 响应状态:', response.status);
    console.log('Coze API 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coze API 错误响应:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Coze API 错误: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Coze API 响应:', result);

    return NextResponse.json({
      success: true,
      result: result,
      apiKeyPrefix: apiKey?.substring(0, 7),
    });
  } catch (error) {
    console.error('直接调用 Coze API 失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}
