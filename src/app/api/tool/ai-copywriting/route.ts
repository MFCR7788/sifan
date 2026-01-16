import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// 调用大语言模型生成文案
async function generateCopywriting(text: string, platform: string, type: string, wordCount: string, count: number, model: string) {
  const prompt = `请根据以下信息生成${platform}平台的${type}类型文案：

${text}

要求：
1. 平台：${platform}
2. 类型：${type}
3. 字数范围：${wordCount}
4. 生成数量：${count}篇

请直接输出${count}篇文案，每篇之间用"=== 第N篇 ==="分隔。`;

  try {
    // 初始化LLM客户端，传入 API Key
    const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
    if (!apiKey) {
      console.error('COZE_WORKLOAD_IDENTITY_API_KEY 环境变量未配置');
      throw new Error('生图功能需要配置 API Key，请联系管理员');
    }

    const config = new Config({
      apiKey: apiKey,
    });
    const client = new LLMClient(config);

    console.log('========== 开始生成AI文案 ==========');
    console.log('接收到的参数:', { platform, type, wordCount, count, model });
    console.log('使用的模型:', model);
    console.log('生成的完整 prompt:', prompt);
    console.log('===================================');

    // 使用非流式调用获取结果
    const response = await client.invoke([
      {
        role: 'system',
        content: '你是一个专业的AI文案创作助手，擅长根据用户需求生成各类平台的专业文案，包括电商、大健康、工具软件、金融、教育、汽车等内容领域的文案创作。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ], {
      model: model,
      temperature: 0.8,
    });

    console.log('LLM API 响应:', JSON.stringify(response, null, 2).substring(0, 1000));

    // 提取返回的内容
    const result = response.content?.toString() || '';

    if (!result) {
      console.error('未获取到生成结果');
      throw new Error('未获取到生成结果');
    }

    console.log('AI文案生成成功，内容长度:', result.length);
    console.log('===================================');

    return result;
  } catch (error) {
    console.error('生成文案失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message, error.stack);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform, type, model, wordCount, count = 1 } = body;

    console.log('API 收到请求参数:', { text: text?.substring(0, 100), platform, type, model, wordCount, count });

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

    if (!wordCount) {
      return NextResponse.json(
        { error: '请选择字数要求' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: '请选择AI模型' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: '内容长度不能超过5000字' },
        { status: 400 }
      );
    }

    // 调用大模型生成文案
    const content = await generateCopywriting(text, platform, type, wordCount, count, model);

    console.log('API 返回结果:', { success: true, contentLength: content.length });

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('AI文案生成API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请重试' },
      { status: 500 }
    );
  }
}
