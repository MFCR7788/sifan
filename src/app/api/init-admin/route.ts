import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database/memberManager';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: '邮箱和密码不能为空' },
				{ status: 400 }
			);
		}

		// 检查用户是否已存在
		const existingUser = await userManager.getUserByEmail(email);
		if (existingUser) {
			return NextResponse.json(
				{ error: '用户已存在' },
				{ status: 400 }
			);
		}

		// 加密密码
		const hashedPassword = await bcrypt.hash(password, 10);

		// 创建admin用户
		const user = await userManager.createUser({
			email,
			name: 'Admin',
			password: hashedPassword,
			isAdmin: true,
			isActive: true,
		});

		// 创建会员账户
		const member = await memberManager.createMember({
			userId: user.id,
			memberLevel: 'diamond', // 给admin最高等级
			balance: 0,
			points: 0,
			totalRecharge: 0,
			totalConsumption: 0,
			memberStatus: 'active',
		});

		return NextResponse.json({
			success: true,
			user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
			member,
		});
	} catch (error: any) {
		console.error('Create admin error:', error);
		return NextResponse.json(
			{ error: error.message || '创建管理员失败' },
			{ status: 500 }
		);
	}
}
