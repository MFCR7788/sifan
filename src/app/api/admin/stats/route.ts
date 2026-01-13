import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { orders, users, members, memberTransactions } from '@/storage/database/shared/schema';
import { verifyAdmin } from '@/lib/admin-auth';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
	try {
		// 验证管理员权限
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const db = await getDb();

		// 获取统计数据 - 使用正确的count聚合函数
		const [totalOrdersResult, totalUsersResult, totalMembersResult, totalRevenueResult] = await Promise.all([
			db.select({ count: sql<number>`count(*)` }).from(orders),
			db.select({ count: sql<number>`count(*)` }).from(users),
			db.select({ count: sql<number>`count(*)` }).from(members),
			// 总收入（所有已完成的交易，包括充值、购买会员、购买积分等）
			db.select({ amount: memberTransactions.amount })
				.from(memberTransactions)
				.where(
					sql`${memberTransactions.status} = ${'completed'}`
				),
		]);

		const totalOrders = totalOrdersResult[0]?.count || 0;
		const totalUsers = totalUsersResult[0]?.count || 0;
		const totalMembers = totalMembersResult[0]?.count || 0;
		const totalRevenue = totalRevenueResult.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) / 100; // 转换为元

		return NextResponse.json({
			success: true,
			totalOrders,
			totalUsers,
			totalMembers,
			totalRevenue: totalRevenue.toFixed(2),
		});
	} catch (error: any) {
		console.error('Failed to fetch admin stats:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取统计数据失败' },
			{ status: 500 }
		);
	}
}
