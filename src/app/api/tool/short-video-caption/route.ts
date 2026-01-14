import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const file = formData.get('file') as File | null;

    if (!url && !file) {
      return NextResponse.json(
        { error: '请输入短视频链接或上传视频文件' },
        { status: 400 }
      );
    }

    // TODO: 集成真实的视频文案提取服务
    // 这里可以集成：
    // 1. 视频下载/解析服务
    // 2. 语音识别服务（如阿里云语音识别、腾讯云语音识别等）
    // 3. 文案提取和优化服务

    // 模拟文案提取结果
    const mockTitle = '✨ 超级好用的AI文案生成工具！';
    const mockContent = `家人们，今天给你们推荐一个超级好用的AI文案生成工具！

只需输入产品介绍，一键就能生成适合抖音、小红书等平台的爆款文案，支持电商、大健康、教育等多种行业类型。

关键是生成的文案非常专业，完全符合平台调性，还能自定义字数和生成数量。

想提高效率的宝子们一定要试试！#AI工具 #文案生成 #短视频运营`;

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      title: mockTitle,
      content: mockContent,
    });

  } catch (error) {
    console.error('视频文案提取失败:', error);
    return NextResponse.json(
      { error: '提取失败，请稍后重试' },
      { status: 500 }
    );
  }
}
