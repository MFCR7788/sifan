import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database/memberManager';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
	try {
		const { email, password, phone, name } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: '邮箱和密码不能为空' },
				{ status: 400 }
			);
		}

		const adminPhone = phone || '15967675767'; // 默认管理员的手机号
		const adminName = name || 'Admin';

		// 检查邮箱是否已存在
		const existingUserByEmail = await userManager.getUserByEmail(email);
		if (existingUserByEmail) {
			return NextResponse.json(
				{ error: '该邮箱已被注册' },
				{ status: 400 }
			);
		}

		// 检查手机号是否已存在
		const existingUserByPhone = await userManager.getUserByPhone(adminPhone);
		if (existingUserByPhone) {
			return NextResponse.json(
				{ error: '该手机号已被注册' },
				{ status: 400 }
			);
		}

		// 加密密码（userManager.createUser会再次加密，所以这里不需要）
		// const hashedPassword = await bcrypt.hash(password, 10);

		// 创建admin用户
		const user = await userManager.createUser({
			email,
			phone: adminPhone,
			name: adminName,
			password, // 传递明文密码，userManager.createUser会自动加密
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
