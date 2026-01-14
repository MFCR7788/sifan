import { NextRequest, NextResponse } from 'next/server';
import { LLMClient } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform, type, model, wordCount, count = 1 } = body;

    if (!text) {
      return NextResponse.json(
        { error: '请输入产品介绍或创作主题' },
        { status: 400 }
      );
    }

    if (!platform) {
      return NextResponse.json(
        { error: '请选择目标平台' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: '请选择内容类型' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: '请选择AI模型' },
        { status: 400 }
      );
    }

    if (!wordCount) {
      return NextResponse.json(
        { error: '请选择字数要求' },
        { status: 400 }
      );
    }

    // 调用大语言模型生成文案
    const llmClient = new LLMClient();
    
    const prompt = `请根据以下信息生成${platform}平台的${type}类型文案：
${text}

要求：
1. 平台：${platform}
2. 类型：${type}
3. 字数范围：${wordCount}
4. 生成数量：${count}篇

请直接输出${count}篇文案，每篇之间用"=== 第N篇 ==="分隔。`;

    const response = await llmClient.chat({
      model: 'doubao-seed-1-6-251015',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI文案创作助手，擅长根据用户需求生成各类平台的专业文案，包括电商、大健康、工具软件、金融、教育、汽车等内容领域的文案创作。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false
    });

    // 提取生成的内容
    let content = '';
    if (response && response.content) {
      content = response.content;
    } else if (typeof response === 'string') {
      content = response;
    } else {
      content = JSON.stringify(response);
    }

    return NextResponse.json({
      success: true,
      content: content
    });

  } catch (error) {
    console.error('AI文案生成失败:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
