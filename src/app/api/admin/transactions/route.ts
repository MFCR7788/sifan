import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { memberTransactions, members, users } from '@/storage/database/shared/schema';
import { verifyAdmin } from '@/lib/admin-auth';
import { eq, sql, and, desc } from 'drizzle-orm';

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

		// 获取查询参数
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type'); // 'recharge' | 'consumption'
		const status = searchParams.get('status'); // 'pending' | 'completed' | 'failed'
		const transactionType = searchParams.get('transactionType'); // 'recharge' | 'membership_purchase' | 'points_purchase' | 'service_use'

		// 构建查询条件
		const conditions = [];

		if (type === 'recharge') {
			conditions.push(eq(memberTransactions.transactionType, 'recharge'));
		} else if (type === 'consumption') {
			conditions.push(sql`${memberTransactions.transactionType} != ${'recharge'}`);
		}

		if (status && status !== '') {
			conditions.push(eq(memberTransactions.status, status));
		}

		if (transactionType && transactionType !== '') {
			conditions.push(eq(memberTransactions.transactionType, transactionType));
		}

		// 获取交易记录（关联会员和用户信息）
		const result = await db
			.select({
				id: memberTransactions.id,
				memberId: memberTransactions.memberId,
				transactionType: memberTransactions.transactionType,
				amount: memberTransactions.amount,
				balanceBefore: memberTransactions.balanceBefore,
				balanceAfter: memberTransactions.balanceAfter,
				pointsBefore: memberTransactions.pointsBefore,
				pointsAfter: memberTransactions.pointsAfter,
				description: memberTransactions.description,
				status: memberTransactions.status,
				paymentMethod: memberTransactions.paymentMethod,
				paymentTransactionId: memberTransactions.paymentTransactionId,
				createdAt: memberTransactions.createdAt,
				completedAt: memberTransactions.completedAt,
				// 会员信息
				memberName: users.name,
				memberPhone: users.phone,
			})
			.from(memberTransactions)
			.leftJoin(members, eq(memberTransactions.memberId, members.id))
			.leftJoin(users, eq(members.userId, users.id))
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(memberTransactions.createdAt));

		return NextResponse.json({
			success: true,
			transactions: result,
		});
	} catch (error: any) {
		console.error('Failed to fetch transactions:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '获取交易记录失败' },
			{ status: 500 }
		);
	}
}
