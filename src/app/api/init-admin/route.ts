import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database/memberManager';
import bcrypt from 'bcrypt';

/**
 * 初始化管理员账号
 *
 * ⚠️ 安全说明（2026-11-19 修复）：
 *   旧实现无任何鉴权 —— 任何访客 POST 即可创建一个 isAdmin=true 的账号，
 *   等同于自助提权。现要求：
 *   1) 必须携带环境变量 INITIAL_ADMIN_SECRET 指定的密钥
 *   2) 生产环境默认禁用（需显式设置 ALLOW_INIT_ADMIN=true）
 */

/** 初始化密钥（来自环境变量，未配置则接口不可用） */
const INIT_SECRET = process.env.INITIAL_ADMIN_SECRET || '';
/** 是否允许在生产环境执行初始化 */
const ALLOW_IN_PRODUCTION = process.env.ALLOW_INIT_ADMIN === 'true';

export async function POST(request: NextRequest) {
	try {
		// ── 守卫 1：生产环境需显式开启 ──
		if (process.env.NODE_ENV === 'production' && !ALLOW_IN_PRODUCTION) {
			return NextResponse.json(
				{ error: '初始化接口已在生产环境关闭' },
				{ status: 404 }
			);
		}

		// ── 守卫 2：必须携带正确的初始化密钥 ──
		if (!INIT_SECRET) {
			return NextResponse.json(
				{ error: '初始化接口未配置密钥' },
				{ status: 404 }
			);
		}
		const provided =
			request.headers.get('x-init-secret') ||
			request.cookies.get('initSecret')?.value ||
			'';
		if (provided !== INIT_SECRET) {
			return NextResponse.json(
				{ error: '初始化密钥无效' },
				{ status: 401 }
			);
		}

		const { email, password, phone, name } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: '邮箱和密码不能为空' },
				{ status: 400 }
			);
		}

		const adminPhone = phone || process.env.ADMIN_PHONE || '';
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
	} catch (error: unknown) {
		console.error('Create admin error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '创建管理员失败' },
			{ status: 500 }
		);
	}
}
