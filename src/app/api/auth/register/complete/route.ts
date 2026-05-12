import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, nickname } = body;

    const tempUserId = request.cookies.get('tempUserId')?.value;

    if (!tempUserId) {
      return NextResponse.json({ error: '请先完成手机验证注册' }, { status: 400 });
    }

    if (!password || !nickname) {
      return NextResponse.json({ error: '密码和昵称不能为空' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少需要6位' }, { status: 400 });
    }

    const user = await userManager.getUserById(tempUserId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    await userManager.setPassword(tempUserId, password);
    const updatedUser = await userManager.updateUser(tempUserId, { name: nickname });

    const response = NextResponse.json({ message: '信息补全成功', user: updatedUser });

    response.cookies.set('userId', tempUserId, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    response.cookies.delete('tempUserId');

    return response;
  } catch (error: unknown) {
    console.error('Register complete error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '补全信息失败，请稍后重试' }, { status: 500 });
  }
}