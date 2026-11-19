import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

type UserUpdateData = {
	name?: string;
	email?: string | null;
	isAdmin?: boolean;
	isActive?: boolean;
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

		// 防止修改自己的管理员权限
		if (id === guard.admin.id && body.isAdmin === false) {
			return NextResponse.json(
				{ success: false, error: '不能修改自己的管理员权限' },
				{ status: 400 }
			);
		}

		const updateData: UserUpdateData = { updatedAt: new Date().toISOString() };

		if (body.name !== undefined) updateData.name = body.name;
		// 空字符串转换为null
		if (body.email !== undefined) updateData.email = body.email.trim() || null;
		if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
		if (body.isActive !== undefined) updateData.isActive = body.isActive;

		const db = await getDb();

		const result = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id));

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error('Failed to update user:', error);
		const errorMessage = error instanceof Error ? error.message : '更新用户失败';
		return NextResponse.json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
}
