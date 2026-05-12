import { NextRequest, NextResponse } from 'next/server';
import { sendSms } from '@/services/smsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: '手机号不能为空' }, { status: 400 });
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: '请输入有效的手机号' }, { status: 400 });
    }

    const result = await sendSms(phone);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '验证码发送成功，5分钟内有效'
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Send SMS API error:', error);
    return NextResponse.json({ error: '发送验证码失败，请稍后重试' }, { status: 500 });
  }
}