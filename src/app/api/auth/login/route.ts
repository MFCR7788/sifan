import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import bcrypt from 'bcrypt';

// 硬编码的admin账户
const ADMIN_PHONE = 'admin';
const ADMIN_EMAIL = 'admin@magic-superman.com';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, password } = body;

		if (!phone || !password) {
			return NextResponse.json(
				{ error: '手机号和密码不能为空' },
				{ status: 400 }
			);
		}

		let user;

		// 检查是否是admin账户（支持手机号或邮箱登录）
		if (phone === ADMIN_PHONE || phone === ADMIN_EMAIL) {
			// 验证admin密码
			const isValidAdmin = password === 'Qf229888777';

			if (isValidAdmin) {
				// 创建临时的admin用户对象
				user = {
					id: 'admin-id',
					phone: ADMIN_PHONE,
					email: ADMIN_EMAIL,
					name: 'Admin',
					isAdmin: true,
					isActive: true,
					createdAt: new Date().toISOString(),
				};
			}
		} else {
			// 验证普通用户登录（通过手机号）
			user = await userManager.login(phone, password);
		}

		if (!user) {
			return NextResponse.json(
				{ error: '手机号或密码错误' },
				{ status: 401 }
			);
		}

		// 创建响应并设置 Cookie
		const response = NextResponse.json({
			message: '登录成功',
			user,
		});

		// 设置用户 ID 到 Cookie（简单实现，生产环境应使用 JWT）
		response.cookies.set('userId', user.id, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 天
		});

		return response;
	} catch (error: any) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: '登录失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
