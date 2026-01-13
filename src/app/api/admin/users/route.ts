import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { users } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const result = await db
			.select({
				id: users.id,
				name: users.name,
				phone: users.phone,
				email: users.email,
				isAdmin: users.isAdmin,
				isActive: users.isActive,
				createdAt: users.createdAt,
			})
			.from(users)
			.orderBy(desc(users.createdAt));

		return NextResponse.json({
			success: true,
			users: result,
		});
	} catch (error: any) {
		console.error('Failed to fetch users:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取用户列表失败' },
			{ status: 500 }
		);
	}
}
