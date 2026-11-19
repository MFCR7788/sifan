import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { orders } from '@/storage/database/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
	try {
		const guard = await requireAdmin(request);
		if (!guard.ok) return guard.response;
		const db = await getDb();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');

		if (status && status !== 'all') {
			const result = await db
				.select()
				.from(orders)
				.where(eq(orders.status, status))
				.orderBy(desc(orders.createdAt));
			return NextResponse.json({
				success: true,
				orders: result,
			});
		} else {
			const result = await db
				.select()
				.from(orders)
				.orderBy(desc(orders.createdAt));
			return NextResponse.json({
				success: true,
				orders: result,
			});
		}
	} catch (error: unknown) {
		console.error('Failed to fetch orders:', error);
		const errorMessage = error instanceof Error ? error.message : '获取定制定单失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
