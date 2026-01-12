import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, name, password, phone, avatar } = body as InsertUser;

		// 验证必填字段
		if (!phone || !name || !password) {
			return NextResponse.json(
				{ error: '手机号、用户名和密码为必填项' },
				{ status: 400 }
			);
		}

		// 检查手机号是否已存在
		const existingUser = await userManager.getUserByPhone(phone);
		if (existingUser) {
			return NextResponse.json(
				{ error: '该手机号已被注册' },
				{ status: 400 }
			);
		}

		// 如果提供了邮箱，检查邮箱是否已存在
		if (email && email.trim()) {
			const existingEmailUser = await userManager.getUserByEmail(email.trim());
			if (existingEmailUser) {
				return NextResponse.json(
					{ error: '该邮箱已被使用' },
					{ status: 400 }
				);
			}
		}

		// 创建用户，邮箱为空时不传
		const user = await userManager.createUser({
			email: email && email.trim() ? email.trim() : undefined,
			name,
			password,
			phone,
			avatar,
		});

		console.log('Register: 用户创建成功，userId:', user.id);

		// 自动创建会员账户，使用用户注册时间作为成为会员的时间
		try {
			const member = await memberManager.createMember({
				userId: user.id,
				memberLevel: 'basic',
				balance: 0,
				points: 0,
				totalRecharge: 0,
				totalConsumption: 0,
				memberStatus: 'active',
			});
			console.log('Register: 会员创建成功，memberId:', member.id);
		} catch (memberError) {
			console.error('Register: 会员创建失败:', memberError);
			// 会员创建失败不影响用户注册，只记录错误
		}

		// 创建响应并设置 Cookie
		const response = NextResponse.json({
			message: '注册成功',
			user,
		});

		// 设置用户 ID 到 Cookie（简单实现，生产环境应使用 JWT）
		response.cookies.set('userId', user.id, {
			httpOnly: false, // 开发环境设为 false，方便调试
			secure: false, // 开发环境不使用 secure
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 天
		});

		console.log('Register: Cookie已设置，userId:', user.id);

		return response;
	} catch (error: any) {
		console.error('Registration error:', error);
		return NextResponse.json(
			{ error: error.message || '注册失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
