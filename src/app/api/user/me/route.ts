import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
	try {
		// 支持从 Cookie 和 Header 两种方式读取 userId
		let userId: string | undefined = request.cookies.get('userId')?.value;

		// 备选方案：从自定义 header 中读取（解决 localhost cookie 不发送的问题）
		if (!userId) {
			userId = request.headers.get('x-user-id') || undefined;
			console.log('/api/user/me: Cookie 中无 userId，尝试从 Header 读取:', userId);
		}

		console.log('/api/user/me: 最终userId:', userId);

		if (!userId) {
			console.log('/api/user/me: userId不存在，返回401');
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		// 对于管理员账户，返回硬编码的用户信息
		if (userId === 'admin-id') {
			console.log('/api/user/me: 检测到管理员账户');
			const adminUser = {
				id: 'admin-id',
				phone: '15967675767',
				email: 'admin@magic-superman.com',
				name: 'Admin',
				isAdmin: true,
				isActive: true,
				createdAt: new Date().toISOString(),
			};
			return NextResponse.json({ user: adminUser });
		}

		const user = await userManager.getUserById(userId);
		if (!user) {
			console.log('/api/user/me: 用户不存在，userId:', userId);
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		console.log('/api/user/me: 返回用户信息:', user);
		return NextResponse.json({ user });
	} catch (error: unknown) {
		console.error('Get user error:', error);

		// 如果是数据库连接错误，返回 401 而不是 500
		// 这样前端会将其视为未登录状态，而不是系统错误
		if (error.message?.includes('Database') || error.message?.includes('PGDATABASE')) {
			return NextResponse.json(
				{ error: '数据库未配置' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: '获取用户信息失败' },
			{ status: 500 }
		);
	}
}
