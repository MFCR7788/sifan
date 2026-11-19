import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
	try {
		const guard = await requireAdmin(request);
		if (!guard.ok) return guard.response;
		const db = await getDb();

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
	} catch (error: unknown) {
		console.error('Failed to fetch users:', error);
		const errorMessage = error instanceof Error ? error.message : '获取用户列表失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
