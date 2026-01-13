import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/storage/database';
import { users } from '@/storage/database/shared/schema';
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

		// 防止修改自己的管理员权限
		if (id === adminUser.id && body.isAdmin === false) {
			return NextResponse.json(
				{ success: false, error: '不能修改自己的管理员权限' },
				{ status: 400 }
			);
		}

		const updateData: any = { updatedAt: new Date().toISOString() };

		if (body.name !== undefined) updateData.name = body.name;
		// 空字符串转换为null
		if (body.email !== undefined) updateData.email = body.email.trim() || null;
		if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
		if (body.isActive !== undefined) updateData.isActive = body.isActive;

		const result = await db
			.update(users)
			.set(updateData)
			.where(eq(users.id, id));

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error('Failed to update user:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '更新用户失败' },
			{ status: 500 }
		);
	}
}
