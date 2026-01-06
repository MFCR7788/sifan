import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import type { UpdateUser } from '@/storage/database/shared/schema';

export async function PATCH(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const updateData = body as Partial<UpdateUser>;

		const user = await userManager.updateUser(userId, updateData);
		
		if (!user) {
			return NextResponse.json(
				{ error: '更新失败，用户不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '更新成功',
			user,
		});
	} catch (error: any) {
		console.error('Update user error:', error);
		return NextResponse.json(
			{ error: error.message || '更新失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
