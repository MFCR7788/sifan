import { NextRequest, NextResponse } from 'next/server';

// 模拟封面图生成（实际应调用生图API）
async function generateCover(text: string, platform: string, style: string, ratio: string) {
  const prompt = `生成一张${platform}平台风格的${style}封面图，比例为${ratio}。主题：${text}

要求：
1. 突出主题内容，视觉冲击力强
2. 符合${platform}平台的设计风格和审美标准
3. 采用${style}风格的设计元素
4. 图片比例为${ratio}
5. 色彩搭配协调，符合品牌调性
6. 适合用作社交媒体封面`;

  try {
    // TODO: 集成生图大模型 (integration-doubao-seedream)
    // 这里先返回一个模拟的图片URL
    // 实际使用时应该调用生图API并返回生成的图片URL

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 返回示例图片URL（实际应替换为生成的图片）
    const sampleImages = {
      '16:9': 'https://via.placeholder.com/800x450/4A90E2/ffffff?text=Cover+Image',
      '9:16': 'https://via.placeholder.com/450x800/4A90E2/ffffff?text=Cover+Image',
      '1:1': 'https://via.placeholder.com/800x800/4A90E2/ffffff?text=Cover+Image',
      '4:3': 'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Cover+Image',
    };

    return {
      success: true,
      imageUrl: sampleImages[ratio as keyof typeof sampleImages] || sampleImages['16:9'],
      prompt,
      platform,
      style,
      ratio,
    };
  } catch (error) {
    console.error('生成封面图失败:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform, style, ratio } = body;

    if (!text || !platform) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: '文案长度不能超过500字' },
        { status: 400 }
      );
    }

    // 调用封面图生成函数
    const result = await generateCover(text, platform, style || '简约', ratio || '16:9');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('封面图生成API错误:', error);
    return NextResponse.json(
      { error: '生成失败，请重试' },
      { status: 500 }
    );
  }
}
