import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { members } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyAdmin } from '@/lib/admin-auth';

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
		const updateData: any = { updatedAt: new Date().toISOString() };

		if (body.memberLevel !== undefined) updateData.memberLevel = body.memberLevel;
		if (body.balance !== undefined) updateData.balance = body.balance;
		if (body.points !== undefined) updateData.points = body.points;
		if (body.memberStatus !== undefined) updateData.memberStatus = body.memberStatus;
		if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt).toISOString() : null;

		const db = await getDb();

		await db
			.update(members)
			.set(updateData)
			.where(eq(members.id, id));

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Failed to update member:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '更新会员信息失败' },
			{ status: 500 }
		);
	}
}
