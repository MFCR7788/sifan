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
function buildPrompt(platform: string, style: string, text: string, ratio: string): string {
  const platformDescriptions: Record<string, string> = {
    '抖音': '适合抖音短视频的封面图风格，具有强烈视觉冲击力，色彩鲜明，吸引眼球',
    '小红书': '适合小红书的封面图风格，精致优雅，时尚清新，文艺气息，适合展示生活美学',
    '公众号': '适合微信公众号的封面图风格，专业正式，商务大气，高端质感，适合文章头图',
  };

  const styleDescriptions: Record<string, string> = {
    '简约': '极简主义设计风格，大量留白，构图简洁干净利落，去除多余装饰，突出核心元素',
    '清新': '清新自然风格，使用明亮柔和的色调（浅蓝、浅绿、粉色等），给人轻松愉悦舒适的感觉，自然光线',
    '商务': '商务专业风格，使用深色稳重色调（深蓝、深灰、藏青等），专业大气得体，适合商业场景和企业形象',
    '科技': '未来科技风格，现代感强烈，使用冷色调（蓝紫、青色、银色），富有未来感，几何元素，光影效果',
    '艺术': '艺术创意风格，富有想象力和创意，设计感强，独特的色彩搭配，艺术构图，视觉冲击力强',
    '复古': '怀旧复古风格，经典耐看有年代感，使用温暖复古色调（棕黄、橙红、米色），怀旧情调',
  };

  const ratioDescriptions: Record<string, string> = {
    '16:9': '16:9横屏比例（1920x1080像素），适合横版封面，宽屏展示',
    '9:16': '9:16竖屏比例（1080x1920像素），适合竖版封面，手机竖屏展示',
    '1:1': '1:1正方形比例（1080x1080像素），适合正方形封面，平衡展示',
    '4:3': '4:3标准比例（1600x1200像素），适合标准横版封面，经典展示',
  };

  return `[核心任务]生成一张高质量的封面图片，图片尺寸比例：${ratioDescriptions[ratio]}，风格：${styleDescriptions[style]}，用途：${platformDescriptions[platform]}。

[主题内容]${text}

[详细设计要求]
1. 【质量要求】高质量高清图片，细节丰富，专业摄影级别画质
2. 【尺寸要求】**严格按照${ratio}比例生成**，${ratioDescriptions[ratio]}，必须符合此尺寸比例要求
3. 【构图要求】构图均衡，视觉焦点突出，主体鲜明，符合${style}风格的构图特点，同时适配${ratio}比例
4. 【色彩要求】色彩搭配和谐，严格按照${style}风格的色调要求执行，避免色彩冲突
5. 【平台适配】适合作为${platform}的封面图使用，比例协调，符合平台规范
6. 【风格强化】整体视觉效果必须体现${style}风格的特征，不能偏离
7. 【禁止事项】**绝对不要在图片中添加任何文字、标题、水印、字母或符号，仅使用纯视觉元素**
8. 【背景处理】背景简洁不喧宾夺主，与主体形成良好对比，突出主题
9. 【视觉吸引力】具有强烈的视觉吸引力和冲击力，能够在${platform}上脱颖而出
10. 【元素表达】仅使用图像、图形、色彩、光影、纹理等纯视觉元素来表达主题

[关键提示]
- **强制要求**：严格按照${ratio}比例生成图片
- 优先级：尺寸比例 > ${style}风格 > 平台适配 > 主题表达
- 确保${style}的风格特征明显，一眼就能识别
- 色彩方案严格遵循${style}风格的要求
- 构图要简洁有力，避免过于杂乱`;
}

// 调用生图大模型生成封面图
async function generateCover(text: string, platform: string, style: string, ratio: string) {
  try {
    // 初始化生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);

    // 构建生图 prompt
    const prompt = buildPrompt(platform, style, text, ratio);

    // 确定图片尺寸（优先使用用户选择的比例）
    const imageSize = RATIO_SIZE_MAP[ratio] || '1920x1080';

    console.log('========== 开始生成封面图 ==========');
    console.log('接收到的参数:', { platform, style, ratio });
    console.log('使用的图片尺寸:', imageSize);
    console.log('生成的完整 prompt:', prompt);
    console.log('===================================');

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
