import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 调用大语言模型进行文案改写
async function rewriteText(text: string, platform: string) {
  const prompt = `请将以下文案改写为适合${platform}平台的风格，保持原意不变，但使用该平台的典型表达方式：

原文案：${text}

要求：
1. 保持核心信息和原意
2. 使用${platform}平台的典型语言风格和表达方式
3. 适当使用该平台的热词和流行语
4. 保持文案的可读性和吸引力
5. 只返回改写后的文案，不要任何解释或额外说明

改写后的文案：`;

  try {
    // 初始化LLM客户端
    const config = new Config({
      baseUrl: 'https://api.coze.cn', // 指定使用国内 API 端点
    });
    const client = new LLMClient(config);

    // 使用非流式调用获取结果
    const response = await client.invoke([
      {
        role: 'system',
        content: `你是一位专业的文案编辑，擅长将文案改写为不同新媒体平台的风格。你能够准确理解原文的核心信息，并根据目标平台的特点进行风格转换，使文案更符合平台用户的阅读习惯。`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7,
    });

    // 提取返回的内容
    const result = response.content?.toString() || '';

    if (!result) {
      throw new Error('未获取到改写结果');
    }

    return result;
  } catch (error) {
    console.error('改写文案失败:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform } = body;

    if (!text || !platform) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (text.length > 2000) {
      return NextResponse.json(
        { error: '文案长度不能超过2000字' },
        { status: 400 }
      );
    }

    // 调用大模型改写文案
    const result = await rewriteText(text, platform);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('文案改写API错误:', error);
    return NextResponse.json(
      { error: '改写失败，请重试' },
      { status: 500 }
    );
  }
}
