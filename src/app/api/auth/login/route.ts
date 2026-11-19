import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import bcrypt from 'bcrypt';

/**
 * 账号密码登录
 *
 * ⚠️ 安全说明（2026-11-19 修复）：
 *   旧实现硬编码了 admin 手机号、邮箱与**明文密码**，且仓库为 public，
 *   任何拿到仓库的人都能获得管理员权限。已改为：
 *   - 管理员身份标识来自环境变量（ADMIN_PHONE / ADMIN_EMAIL），不写死在代码里
 *   - 密码一律走数据库 bcrypt 校验，代码中不保留任何明文口令
 *   - 保留「数据库不可用时仍可登录」的应急能力，但口令来自环境变量而非源码
 */

/** 管理员身份标识（来自环境变量，未配置则不启用应急登录） */
const ADMIN_PHONE = process.env.ADMIN_PHONE?.trim() || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || '';

/** 应急登录口令（来自环境变量；生产环境应留空，强制走数据库） */
const ADMIN_FALLBACK_PASSWORD = process.env.ADMIN_FALLBACK_PASSWORD || '';

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

		const identifier = phone.trim();
		let user: Record<string, unknown> | null = null;

		// 1) 优先走数据库（bcrypt 校验）
		try {
			const dbUser =
				(await userManager.getUserByPhone(identifier)) ||
				(await userManager.getUserByEmail(identifier));

			if (dbUser) {
				const isValid = await bcrypt.compare(password, dbUser.password);
				if (isValid) {
					const { password: _pw, ...userWithoutPassword } = dbUser;
					user = userWithoutPassword as unknown as Record<string, unknown>;
				}
			}
		} catch (dbError) {
			console.error('[auth/login] 数据库查询失败:', dbError);
		}

		// 2) 应急通道：数据库不可用时，用环境变量中的管理员口令
		if (!user && ADMIN_FALLBACK_PASSWORD) {
			const isAdminIdentifier =
				(ADMIN_PHONE && identifier === ADMIN_PHONE) ||
				(ADMIN_EMAIL && identifier === ADMIN_EMAIL);

			if (isAdminIdentifier && password === ADMIN_FALLBACK_PASSWORD) {
				user = {
					id: 'admin-id',
					phone: ADMIN_PHONE || identifier,
					email: ADMIN_EMAIL,
					name: 'Admin',
					isAdmin: true,
					isActive: true,
					createdAt: new Date().toISOString(),
				};
				console.warn('[auth/login] 管理员走应急通道登录（数据库不可用）');
			}
		}

		if (!user) {
			return NextResponse.json(
				{ error: '手机号或密码错误，请联系管理员！' },
				{ status: 401 }
			);
		}

		// 3) 设置会话 Cookie
		const response = NextResponse.json({
			message: '登录成功',
			user,
		});

		const isProduction = process.env.NODE_ENV === 'production';
		const cookieSecure = isProduction && process.env.COOKIE_SECURE !== 'false';
		const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? '.zjsifan.com' : undefined);

		response.cookies.set('userId', String(user.id), {
			httpOnly: isProduction,
			secure: cookieSecure,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 天
			domain: cookieDomain,
		});

		return response;
	} catch (error: unknown) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: '登录失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
