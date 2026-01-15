import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { orders } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

type OrderUpdateData = {
	status?: string;
	notes?: string | null;
	updatedAt: string;
};

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const adminUser = await verifyAdmin(request);
		if (!adminUser) {
			return NextResponse.json(
				{ success: false, error: '无管理员权限' },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const body = await request.json();
		const { status, notes } = body;

		const updateData: OrderUpdateData = { updatedAt: new Date().toISOString() };
		if (status) updateData.status = status;
		if (notes !== undefined) updateData.notes = notes;

		const db = await getDb();

		await db
			.update(orders)
			.set(updateData)
			.where(eq(orders.id, id));

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error('Failed to update order:', error);
		const errorMessage = error instanceof Error ? error.message : '更新定制定单失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
