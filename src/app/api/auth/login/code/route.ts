import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { verifySmsCode } from '@/services/smsService';

const ADMIN_PHONE = '15967675767';
const ADMIN_EMAIL = 'admin@magic-superman.com';

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

    let user;

    if (phone === ADMIN_PHONE) {
      user = {
        id: 'admin-id',
        phone: ADMIN_PHONE,
        email: ADMIN_EMAIL,
        name: 'Admin',
        isAdmin: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
    } else {
      const dbUser = await userManager.getUserByPhone(phone);
      if (!dbUser) {
        return NextResponse.json({ error: '该手机号未注册' }, { status: 401 });
      }
      
      const { password, ...userWithoutPassword } = dbUser;
      user = userWithoutPassword;
    }

    const response = NextResponse.json({ message: '登录成功', user });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieSecure = isProduction && process.env.COOKIE_SECURE !== 'false';
    const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? '.zjsifan.com' : undefined);

    response.cookies.set('userId', user.id, {
      httpOnly: isProduction,
      secure: cookieSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      domain: cookieDomain,
    });

    return response;
  } catch (error: unknown) {
    console.error('Login with code error:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}