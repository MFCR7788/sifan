import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';

export async function POST(request: NextRequest) {
	try {
		// 支持从 Cookie 和 Header 两种方式读取 userId
		let userId: string | undefined = request.cookies.get('userId')?.value;

		// 备选方案：从自定义 header 中读取（解决 localhost cookie 不发送的问题）
		if (!userId) {
			userId = request.headers.get('x-user-id') || undefined;
		}

		if (!userId) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { phone } = body;

		// 验证手机号格式
		if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
			return NextResponse.json(
				{ error: '手机号格式不正确' },
				{ status: 400 }
			);
		}

		// 检查手机号是否已被其他用户使用
		const isPhoneExists = await userManager.isPhoneExists(phone, userId);
		if (isPhoneExists) {
			return NextResponse.json(
				{ error: '该手机号已被使用' },
				{ status: 409 }
			);
		}

		// 更新用户手机号
		const user = await userManager.updateUser(userId, { phone });

		if (!user) {
			return NextResponse.json(
				{ error: '绑定失败，用户不存在' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: '手机号绑定成功',
			user,
		});
	} catch (error: unknown) {
		console.error('Bind phone error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '绑定失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
