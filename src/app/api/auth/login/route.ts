import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import bcrypt from 'bcrypt';

// 硬编码的admin账户
const ADMIN_PHONE = '15967675767';
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
			// 先尝试从数据库中查找用户
			const dbUser = await userManager.getUserByPhone(ADMIN_PHONE);

			if (dbUser) {
				// 验证密码
				let isValidPassword;
				if (password === 'Qf229888777') {
					// 硬编码密码验证（临时）
					isValidPassword = true;

					// 如果数据库中的密码不是这个哈希值，更新它
					const expectedHash = await bcrypt.hash('Qf229888777', 10);
					if (dbUser.password !== expectedHash) {
						await userManager.updateUser(dbUser.id, { password: await bcrypt.hash('Qf229888777', 10) } as any);
					}
				} else {
					// 使用数据库密码验证
					isValidPassword = await bcrypt.compare(password, dbUser.password);
				}

				if (isValidPassword && dbUser.isAdmin) {
					// 返回数据库中的真实用户
					const { password: _, ...userWithoutPassword } = dbUser;
					user = userWithoutPassword;
				}
			} else {
				// 兜底：验证硬编码的admin密码（临时方案）
				if (password === 'Qf229888777') {
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
			}
		} else {
			// 先尝试从数据库中查找用户（可能包括管理员账号）
			const dbUser = await userManager.getUserByPhone(phone);

			if (dbUser) {
				// 验证密码
				const isValidPassword = await bcrypt.compare(password, dbUser.password);

				if (isValidPassword) {
					// 返回用户信息（不包含密码）
					const { password: _, ...userWithoutPassword } = dbUser;
					user = userWithoutPassword;
				}
			}
		}

		if (!user) {
			return NextResponse.json(
				{ error: '手机号或密码错误，请联系管理员！' },
				{ status: 401 }
			);
		}

		// 创建响应并设置 Cookie
		const response = NextResponse.json({
			message: '登录成功',
			user,
		});

		console.log('=== 登录接口日志 ===');
		console.log('登录用户信息:', user);
		console.log('用户ID:', user.id);
		console.log('NODE_ENV:', process.env.NODE_ENV);

		// 根据环境动态设置 Cookie 配置
		const isProduction = process.env.NODE_ENV === 'production';
		const cookieSecure = isProduction && process.env.COOKIE_SECURE !== 'false';
		const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? '.zjsifan.com' : undefined);

		console.log('Cookie配置:', {
			httpOnly: isProduction, // 生产环境 true，开发环境 false
			secure: cookieSecure,
			sameSite: 'lax',
			domain: cookieDomain,
		});

		// 设置用户 ID 到 Cookie（简单实现，生产环境应使用 JWT）
		response.cookies.set('userId', user.id, {
			httpOnly: isProduction, // 生产环境设为 true，开发环境设为 false 方便调试
			secure: cookieSecure, // 生产环境使用 secure，开发环境不使用
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 天
			domain: cookieDomain,
		});

		console.log('✅ Cookie已设置，userId:', user.id);
		console.log('Cookie配置:', {
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		});
		console.log('==================');

		return response;
	} catch (error: unknown) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: '登录失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
