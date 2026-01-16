import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 调用大语言模型生成标题
async function generateTitles(text: string, platform: string) {
  const prompt = `请根据以下内容，为${platform}平台生成5个吸引人的标题。每个标题要符合该平台的风格特点，能够吸引目标用户点击。

原文内容：${text}

要求：
1. 生成5个不同的标题
2. 每个标题都要符合${platform}平台的风格特点
3. 标题要有吸引力，能够引起用户兴趣
4. 标题要简洁明了，易于理解
5. 使用该平台的热词和流行语
6. 只返回标题列表，每个标题独占一行，不要任何解释或额外说明
7. 格式：每行一个标题

生成的5个标题：`;

  try {
    // 初始化LLM客户端
    const config = new Config({
      baseUrl: 'https://api.coze.cn', // 指定使用国内 API 端点
      modelBaseUrl: 'https://api.coze.cn/v3', // 模型 API 端点
    });
    const client = new LLMClient(config);

    // 使用非流式调用获取结果
    const response = await client.invoke([
      {
        role: 'system',
        content: `你是一位专业的新媒体运营专家，擅长为不同平台创作吸引人的标题。你能够准确理解内容的核心价值，并根据目标平台的特点生成多个风格的标题，每个标题都能引起用户的兴趣和点击欲望。`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.8,
    });

    // 提取返回的内容
    const result = response.content?.toString() || '';

    if (!result) {
      throw new Error('未获取到生成结果');
    }

    // 解析标题列表
    const titles = result
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 5); // 确保只取前5个

    // 如果标题不足5个，补充
    if (titles.length < 5) {
      console.warn(`生成的标题数量不足5个，实际生成：${titles.length}个`);
    }

    return titles;
  } catch (error) {
    console.error('生成标题失败:', error);
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
        { error: '内容长度不能超过2000字' },
        { status: 400 }
      );
    }

    // 调用大模型生成标题
    const titles = await generateTitles(text, platform);

    return NextResponse.json({
      success: true,
      titles,
    });
  } catch (error) {
    console.error('标题生成API错误:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}
