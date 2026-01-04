import { NextRequest, NextResponse } from 'next/server';
import { contactManager } from '@/storage/database/contactManager';

/**
 * POST /api/contact
 * 提交留言
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.phone || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证手机号格式（中国大陆手机号）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { success: false, error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 创建留言
    const message = await contactManager.createMessage({
      name: body.name,
      phone: body.phone,
      email: body.email,
      message: body.message,
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: '留言提交成功',
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    return NextResponse.json(
      { success: false, error: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
