import { NextRequest } from 'next/server';
import { db } from '@/storage/database';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from './auth';

export async function verifyAdmin(request: NextRequest) {
	try {
		// 获取用户ID（从Cookie或Header）
		const sessionUserId = request.headers.get('x-user-id');
		let userId: string | null = sessionUserId;

		// 从Cookie中获取token或userId
		const cookies = request.cookies;
		const token = cookies.get('token')?.value;
		const userIdFromCookie = cookies.get('userId')?.value;

		if (!userId && token) {
			const decoded = verifyToken(token);
			userId = decoded?.userId || null;
		}

		// 如果还是没有userId，尝试从userId cookie获取
		if (!userId && userIdFromCookie) {
			userId = userIdFromCookie;
		}

		if (!userId) {
			console.log('[verifyAdmin] No userId found');
			console.log('[verifyAdmin] Headers:', sessionUserId);
			console.log('[verifyAdmin] Cookies:', {
				token: !!token,
				userId: !!userIdFromCookie
			});
			return null;
		}

		// 查询用户信息
		const userResult = await db
			.select({
				id: users.id,
				name: users.name,
				isAdmin: users.isAdmin,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (userResult.length === 0) {
			return null;
		}

		const user = userResult[0];

		// 检查是否是管理员
		if (!user.isAdmin) {
			return null;
		}

		return user;
	} catch (error) {
		console.error('Verify admin error:', error);
		return null;
	}
}
