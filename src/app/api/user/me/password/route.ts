import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

export async function POST(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { oldPassword, newPassword } = body;

		if (!oldPassword || !newPassword) {
			return NextResponse.json(
				{ error: '请提供旧密码和新密码' },
				{ status: 400 }
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: '新密码至少6位' },
				{ status: 400 }
			);
		}

		const success = await userManager.changePassword(userId, oldPassword, newPassword);
		
		if (!success) {
			return NextResponse.json(
				{ error: '旧密码错误' },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			message: '密码修改成功',
		});
	} catch (error: any) {
		console.error('Change password error:', error);
		return NextResponse.json(
			{ error: '修改密码失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
