import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { members, users } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';
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

		const db = await getDb();

		const result = await db
			.select({
				id: members.id,
				userId: members.userId,
				memberLevel: members.memberLevel,
				balance: members.balance,
				points: members.points,
				totalRecharge: members.totalRecharge,
				totalConsumption: members.totalConsumption,
				memberStatus: members.memberStatus,
				expiresAt: members.expiresAt,
				createdAt: members.createdAt,
				updatedAt: members.updatedAt,
				userName: users.name,
				userPhone: users.phone,
			})
			.from(members)
			.leftJoin(users, eq(members.userId, users.id))
			.orderBy(desc(members.createdAt));

		return NextResponse.json({
			success: true,
			members: result,
		});
	} catch (error: any) {
		console.error('Failed to fetch members:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取会员列表失败' },
			{ status: 500 }
		);
	}
}
