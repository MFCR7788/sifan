import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { members } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

type MemberUpdateData = {
	memberLevel?: string;
	balance?: number;
	points?: number;
	memberStatus?: string;
	expiresAt?: string | null;
	updatedAt: string;
};

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireAdmin(request);
		if (!guard.ok) return guard.response;
		const { id } = await params;
		const body = await request.json();
		const updateData: MemberUpdateData = { updatedAt: new Date().toISOString() };

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
	} catch (error: unknown) {
		console.error('Failed to update member:', error);
		const errorMessage = error instanceof Error ? error.message : '更新会员信息失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
