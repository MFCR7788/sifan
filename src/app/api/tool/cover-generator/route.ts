import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

// 平台到尺寸的映射
const PLATFORM_SIZE_MAP: Record<string, string> = {
  '抖音': '1080x1920',  // 9:16 竖屏
  '小红书': '1080x1920', // 9:16 竖屏
  '公众号': '900x383',   // 2.35:1 横屏
};

// 比例到尺寸的映射
const RATIO_SIZE_MAP: Record<string, string> = {
  '16:9': '1920x1080',
  '9:16': '1080x1920',
  '1:1': '1080x1080',
  '4:3': '1600x1200',
};

// 构建生图 prompt
function buildPrompt(platform: string, style: string, text: string): string {
  const platformDescriptions: Record<string, string> = {
    '抖音': '适合抖音短视频的封面图风格，具有强烈视觉冲击力，吸引眼球',
    '小红书': '适合小红书的封面图风格，精致优雅，时尚清新，适合展示生活美学',
    '公众号': '适合微信公众号的封面图风格，专业正式，商务大气，有质感',
  };

  const styleDescriptions: Record<string, string> = {
    '简约': '简约风格，留白充足，构图简洁，干净利落',
    '清新': '清新风格，色彩明亮，自然舒适，给人轻松愉悦的感觉',
    '商务': '商务风格，专业稳重，大气得体，适合商业场景',
    '科技': '科技风格，现代感强，富有未来感，使用冷色调和几何元素',
    '艺术': '艺术风格，富有创意，设计感强，色彩搭配独特',
    '复古': '复古风格，怀旧情调，经典耐看，有年代感',
  };

  return `生成一张高质量的封面图片，${platformDescriptions[platform]}，${styleDescriptions[style]}。

主题内容：${text}

设计要求：
1. 高质量高清图片，细节丰富，专业摄影级别
2. 构图均衡，视觉焦点突出，主体鲜明
3. 色彩搭配和谐，符合${style}风格
4. **重要：不要在图片中添加任何文字、标题或水印**
5. 背景简洁，不喧宾夺主，突出主题
6. 适合作为社交媒体封面使用，具有视觉吸引力
7. 仅使用图像、图形、色彩、光影等视觉元素表达主题`;
}

// 调用生图大模型生成封面图
async function generateCover(text: string, platform: string, style: string, ratio: string) {
  try {
    // 初始化生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);

    // 构建生图 prompt
    const prompt = buildPrompt(platform, style, text);

    // 确定图片尺寸（优先使用用户选择的比例）
    let imageSize = RATIO_SIZE_MAP[ratio] || '1920x1080';

    console.log('开始生成封面图...', { platform, style, ratio, imageSize, prompt: prompt.substring(0, 100) });

    // 调用生图 API
    const response = await client.generate({
      prompt: prompt,
      size: imageSize,
      watermark: false, // 不加水印
      responseFormat: 'url',
    });

    console.log('生图 API 响应:', JSON.stringify(response, null, 2).substring(0, 500));

    // 解析响应
    const helper = client.getResponseHelper(response);

    if (!helper.success) {
      console.error('生图失败:', helper.errorMessages);
      throw new Error(helper.errorMessages.join(', '));
    }

    if (!helper.imageUrls || helper.imageUrls.length === 0) {
      throw new Error('未获取到图片 URL');
    }

    console.log('封面图生成成功:', helper.imageUrls[0]);

    return {
      success: true,
      imageUrl: helper.imageUrls[0],
      prompt,
      platform,
      style,
      ratio,
      size: imageSize,
    };
  } catch (error) {
    console.error('生成封面图失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message, error.stack);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, platform, style, ratio } = body;

    console.log('API 收到请求参数:', { text, platform, style, ratio });

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
    const result = await generateCover(
      text,
      platform,
      style || '简约',
      ratio || '16:9'
    );

    console.log('API 返回结果:', result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('封面图生成API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请重试' },
      { status: 500 }
    );
  }
}
