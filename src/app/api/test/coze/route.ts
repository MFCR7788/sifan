import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY } = await request.json();

    console.log('测试 Coze API Key:', apiKey?.substring(0, 7) + '...');

    const config = new Config({
      apiKey: apiKey,
      baseUrl: 'https://api.coze.cn', // SDK 端点
      modelBaseUrl: 'https://api.coze.cn/v3', // 模型 API 端点
      timeout: 30000,
    });

    const client = new LLMClient(config);

    console.log('开始简单测试调用...');

    // 简单测试：生成一句话
    const stream = client.stream([
      {
        role: 'system',
        content: '你是一个测试助手。',
      },
      {
        role: 'user',
        content: '请回复：测试成功',
      },
    ], {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7,
    });

    let result = '';
    for await (const chunk of stream) {
      if (chunk.content) {
        result += chunk.content.toString();
      }
    }

    console.log('测试结果:', result);

    return NextResponse.json({
      success: true,
      result: result,
      apiKeyPrefix: apiKey?.substring(0, 7),
    });
  } catch (error) {
    console.error('Coze API 测试失败:', error);
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
