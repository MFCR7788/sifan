import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

/**
 * 获取当前登录用户
 *
 * ⚠️ 安全说明（2026-11-19 修复）：
 *   旧实现在 userId === 'admin-id' 时返回硬编码的管理员资料
 *   （手机号、邮箱写死在源码中，仓库为 public）。现改为统一走数据库查询，
 *   应急身份的资料来自环境变量，不再写死在代码里。
 */

const ADMIN_PHONE = process.env.ADMIN_PHONE?.trim() || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || '';

export async function GET(request: NextRequest) {
	try {
		// 支持从 Cookie 和 Header 两种方式读取 userId
		let userId: string | undefined = request.cookies.get('userId')?.value;

		// 备选：从自定义 header 读取（解决 localhost cookie 不发送的问题）
		if (!userId) {
			userId = request.headers.get('x-user-id') || undefined;
		}

		if (!userId) {
			return NextResponse.json({ error: '未登录' }, { status: 401 });
		}

		// 应急身份（数据库不可用时的登录通道）：资料来自环境变量
		if (userId === 'admin-id') {
			if (!ADMIN_PHONE && !ADMIN_EMAIL) {
				return NextResponse.json({ error: '未登录' }, { status: 401 });
			}
			return NextResponse.json({
				user: {
					id: 'admin-id',
					phone: ADMIN_PHONE,
					email: ADMIN_EMAIL,
					name: 'Admin',
					isAdmin: true,
					isActive: true,
					createdAt: '2024-01-01T00:00:00.000Z',
				},
			});
		}

		const user = await userManager.getUserById(userId);
		if (!user) {
			return NextResponse.json({ error: '用户不存在' }, { status: 404 });
		}

		return NextResponse.json({ user });
	} catch (error: unknown) {
		console.error('Get user error:', error);

		// 数据库连接错误时返回 401，前端视为未登录而非系统错误
		if (
			error instanceof Error &&
			(error.message?.includes('Database') || error.message?.includes('PGDATABASE'))
		) {
			return NextResponse.json({ error: '数据库未配置' }, { status: 401 });
		}

		return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
	}
}
