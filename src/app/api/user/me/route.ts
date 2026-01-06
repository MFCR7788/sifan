import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const user = await userManager.getUserById(userId);
		if (!user) {
			return NextResponse.json(
				{ error: '用户不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ user });
	} catch (error: any) {
		console.error('Get user error:', error);
		return NextResponse.json(
			{ error: '获取用户信息失败' },
			{ status: 500 }
		);
	}
}
