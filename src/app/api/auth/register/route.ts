import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, name, password, phone, avatar } = body as InsertUser;

		// 检查邮箱是否已存在
		const existingUser = await userManager.getUserByEmail(email);
		if (existingUser) {
			return NextResponse.json(
				{ error: '该邮箱已被注册' },
				{ status: 400 }
			);
		}

		// 创建用户
		const user = await userManager.createUser({
			email,
			name,
			password,
			phone,
			avatar,
		});

		// 自动创建会员账户
		try {
			await memberManager.createMember({
				userId: user.id,
				memberLevel: 'basic',
				balance: 0,
				points: 0,
			});
		} catch (memberError) {
			console.error('Error creating member:', memberError);
			// 会员创建失败不影响用户注册，只记录错误
		}

		return NextResponse.json({
			message: '注册成功',
			user,
		});
	} catch (error: any) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: error.message || '注册失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
