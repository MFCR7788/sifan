import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { orders, users, members, memberTransactions } from '@/storage/database/shared/schema';
import { verifyAdmin } from '@/lib/admin-auth';
import { eq } from 'drizzle-orm';

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

		// 获取统计数据
		const [totalOrdersResult, totalUsersResult, totalMembersResult, totalRevenueResult] = await Promise.all([
			db.select({ count: orders.orderNumber }).from(orders),
			db.select({ count: users.id }).from(users),
			db.select({ count: members.id }).from(members),
			db.select({ amount: memberTransactions.amount })
				.from(memberTransactions)
				.where(eq(memberTransactions.status, 'completed')),
		]);

		const totalOrders = totalOrdersResult.length;
		const totalUsers = totalUsersResult.length;
		const totalMembers = totalMembersResult.length;
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
