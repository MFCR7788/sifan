import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config } from 'coze-coding-dev-sdk';

// 比例到尺寸的映射
const RATIO_SIZE_MAP: Record<string, string> = {
  '16:9': '1920x1080',
  '9:16': '1080x1920',
  '1:1': '1080x1080',
  '4:3': '1600x1200',
};

// 风格描述
const STYLE_DESCRIPTIONS: Record<string, string> = {
  '写实摄影': '写实摄影风格，真实感强烈，细节丰富，自然真实，专业摄影级别',
  '动漫风格': '日系动漫风格，色彩鲜明，线条清晰，角色可爱，二次元风格',
  '艺术风格': '艺术创意风格，富有想象力和创意，设计感强，独特的色彩搭配和艺术构图',
  '科技风格': '未来科技风格，现代感强烈，使用冷色调（蓝紫、青色、银色），富有未来感，几何元素，光影效果',
  '商业设计': '商业设计风格，极简主义或扁平化设计，简洁大方，适合商业用途，专业大气',
  '复古风格': '怀旧复古风格，经典耐看有年代感，使用温暖复古色调（棕黄、橙红、米色），怀旧情调',
  '抽象艺术': '抽象几何艺术风格，几何图形，流体艺术，概念性强，富有创意和艺术性',
  '建筑室内': '现代建筑和室内设计风格，建筑设计，室内空间，现代简约，光线与空间感强',
};

// 质量描述
const QUALITY_DESCRIPTIONS: Record<string, string> = {
  '2K': '2K高清图片（1920x1080或等效分辨率），高清细节，适合大多数用途',
  '4K': '4K超高清图片（3840x2160或等效分辨率），超高画质，细节极其丰富，适合专业用途',
};

// 光照效果描述
const LIGHTING_DESCRIPTIONS: Record<string, string> = {
  '自然光线': '自然光线，自然阳光，柔和自然，真实感强，舒适自然',
  '柔和光线': '柔和光线，柔光照明，光线柔和均匀，给人温馨柔和的感觉',
  '强烈光线': '强烈光线，强光照明，对比鲜明，光影效果强烈，戏剧性强',
  '霓虹灯光': '霓虹灯光，霓虹灯效，色彩鲜艳，科技感，夜间氛围，赛博朋克风格',
  '金色夕阳': '金色夕阳，黄金时刻，温暖的金黄色调，浪漫温馨，氛围感强',
  '蓝色晨曦': '蓝色晨曦，黎明时分，冷蓝色调，清新宁静，宁静美好',
};

// 构建生图 prompt
function buildPrompt(
  themeContent: string,
  style: string,
  detailRequirement: string,
  quality: string,
  lighting: string,
  ratio: string
): string {
  const ratioDescriptions: Record<string, string> = {
    '16:9': '16:9横屏比例（1920x1080像素），适合横版展示，宽屏效果',
    '9:16': '9:16竖屏比例（1080x1920像素），适合竖版展示，手机竖屏',
    '1:1': '1:1正方形比例（1080x1080像素），适合正方形展示，平衡构图',
    '4:3': '4:3标准比例（1600x1200像素），适合标准展示，经典比例',
  };

  let prompt = `[核心任务]生成一张高质量的AI图像，图片尺寸比例：${ratioDescriptions[ratio]}，风格：${STYLE_DESCRIPTIONS[style]}，质量：${QUALITY_DESCRIPTIONS[quality]}，光照：${LIGHTING_DESCRIPTIONS[lighting]}。

[主题内容]${themeContent}`;

  // 添加细节要求（如果有）
  if (detailRequirement && detailRequirement.trim()) {
    prompt += `

[细节要求]${detailRequirement}`;
  }

  prompt += `

[详细设计要求]
1. 【尺寸要求】**严格按照${ratio}比例生成**，${ratioDescriptions[ratio]}，必须符合此尺寸比例要求
2. 【风格强化】整体视觉效果必须体现${style}风格的明显特征，一眼就能识别
3. 【质量要求】${QUALITY_DESCRIPTIONS[quality]}，细节丰富，专业级别画质
4. 【光照效果】${LIGHTING_DESCRIPTIONS[lighting]}，营造相应的氛围和情绪
5. 【构图要求】构图均衡，视觉焦点突出，主体鲜明，符合${style}风格的构图特点，同时适配${ratio}比例
6. 【色彩要求】色彩搭配和谐，严格按照${style}风格的色调要求执行，避免色彩冲突
7. 【禁止事项】**绝对不要在图片中添加任何文字、标题、水印、字母或符号，仅使用纯视觉元素**
8. 【视觉吸引力】具有强烈的视觉吸引力和冲击力，艺术性强
9. 【元素表达】仅使用图像、图形、色彩、光影、纹理、构图等纯视觉元素来表达主题

[关键提示]
- **强制要求**：严格按照${ratio}比例生成图片
- 优先级：尺寸比例 > ${style}风格 > ${lighting}光照 > ${quality}质量 > 主题表达 > 细节要求
- 确保${style}的风格特征明显，一眼就能识别
- 光照效果要符合${lighting}的描述，营造相应的氛围
- 色彩方案严格遵循${style}风格的要求
- 构图要简洁有力，避免过于杂乱`;

  return prompt;
}

// 调用生图大模型生成图片
async function generateImage(
  themeContent: string,
  style: string,
  detailRequirement: string,
  quality: string,
  lighting: string,
  ratio: string
) {
  try {
    // 初始化生图客户端
    const config = new Config();
    const client = new ImageGenerationClient(config);

    // 构建生图 prompt
    const prompt = buildPrompt(
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio
    );

    // 确定图片尺寸
    let imageSize = RATIO_SIZE_MAP[ratio] || '1920x1080';

    console.log('========== 开始生成AI图像 ==========');
    console.log('接收到的参数:', {
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio
    });
    console.log('使用的图片尺寸:', imageSize);
    console.log('生成的完整 prompt:', prompt);
    console.log('===================================');

    // 调用生图 API
    const response = await client.generate({
      prompt: prompt,
      size: imageSize,
      watermark: false,
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

    console.log('AI图像生成成功:', helper.imageUrls[0]);

    return {
      success: true,
      imageUrl: helper.imageUrls[0],
      prompt,
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio,
      size: imageSize,
    };
  } catch (error) {
    console.error('生成AI图像失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message, error.stack);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio
    } = body;

    console.log('API 收到请求参数:', {
      themeContent,
      style,
      detailRequirement,
      quality,
      lighting,
      ratio
    });

    if (!themeContent || !themeContent.trim()) {
      return NextResponse.json(
        { error: '请输入主题内容' },
        { status: 400 }
      );
    }

    if (themeContent.length > 500) {
      return NextResponse.json(
        { error: '主题内容长度不能超过500字' },
        { status: 400 }
      );
    }

    if (detailRequirement && detailRequirement.length > 500) {
      return NextResponse.json(
        { error: '细节要求长度不能超过500字' },
        { status: 400 }
      );
    }

    // 调用图像生成函数
    const result = await generateImage(
      themeContent,
      style || '写实摄影',
      detailRequirement || '',
      quality || '2K',
      lighting || '柔和光线',
      ratio || '16:9'
    );

    console.log('API 返回结果:', result);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI图像生成API错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败，请重试' },
      { status: 500 }
    );
  }
}
