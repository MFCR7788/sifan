import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database';
import { verifySmsCode } from '@/services/smsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: '手机号和验证码不能为空' }, { status: 400 });
    }

    const verifyResult = verifySmsCode(phone, code);
    if (!verifyResult.success) {
      return NextResponse.json({ error: verifyResult.message }, { status: 400 });
    }

    const existingUser = await userManager.getUserByPhone(phone);
    if (existingUser) {
      return NextResponse.json({ error: '该手机号已被注册' }, { status: 400 });
    }

    const user = await userManager.createUserWithPhone(phone);

    try {
      await memberManager.createMember({
        userId: user.id,
        memberLevel: 'basic',
        balance: 0,
        points: 0,
        totalRecharge: 0,
        totalConsumption: 0,
        memberStatus: 'active',
      });
    } catch (memberError) {
      console.error('Register: 会员创建失败:', memberError);
    }

    const response = NextResponse.json({ message: '注册成功，请补全信息', userId: user.id });

    response.cookies.set('tempUserId', user.id, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '注册失败，请稍后重试' }, { status: 500 });
  }
}