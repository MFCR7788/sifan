#!/bin/bash

# ==========================================
# 修复生产环境Cookie配置脚本
# 直接在服务器上运行此脚本
# ==========================================

set -e

echo "=========================================="
echo "修复生产环境Cookie配置"
echo "时间: $(date)"
echo "=========================================="

# 备份原文件
echo ""
echo "【步骤 1/4】备份原文件..."
cp src/app/api/auth/login/route.ts src/app/api/auth/login/route.ts.backup
cp src/app/api/user/me/member/route.ts src/app/api/user/me/member/route.ts.backup
echo "✓ 备份完成"

# 修复登录 API
echo ""
echo "【步骤 2/4】修复登录API的Cookie配置..."

cat > src/app/api/auth/login/route.ts << 'LOGINEOF'
import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/storage/database/userManager';
import bcrypt from 'bcrypt';

// 硬编码的admin账户
const ADMIN_PHONE = '15967675767';
const ADMIN_EMAIL = 'admin@magic-superman.com';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { phone, password } = body;

		if (!phone || !password) {
			return NextResponse.json(
				{ error: '手机号和密码不能为空' },
				{ status: 400 }
			);
		}

		let user;

		// 检查是否是admin账户（支持手机号或邮箱登录）
		if (phone === ADMIN_PHONE || phone === ADMIN_EMAIL) {
			// 先尝试从数据库中查找用户
			let dbUser = await userManager.getUserByPhone(ADMIN_PHONE);

			if (dbUser) {
				// 验证密码
				let isValidPassword;
				if (password === 'Qf229888777') {
					// 硬编码密码验证（临时）
					isValidPassword = true;

					// 如果数据库中的密码不是这个哈希值，更新它
					const expectedHash = await bcrypt.hash('Qf229888777', 10);
					if (dbUser.password !== expectedHash) {
						await userManager.updateUser(dbUser.id, { password: await bcrypt.hash('Qf229888777', 10) } as any);
					}
				} else {
					// 使用数据库密码验证
					isValidPassword = await bcrypt.compare(password, dbUser.password);
				}

				if (isValidPassword && dbUser.isAdmin) {
					// 返回数据库中的真实用户
					const { password: _, ...userWithoutPassword } = dbUser;
					user = userWithoutPassword;
				}
			} else {
				// 兜底：验证硬编码的admin密码（临时方案）
				if (password === 'Qf229888777') {
					// 创建临时的admin用户对象
					user = {
						id: 'admin-id',
						phone: ADMIN_PHONE,
						email: ADMIN_EMAIL,
						name: 'Admin',
						isAdmin: true,
						isActive: true,
						createdAt: new Date().toISOString(),
					};
				}
			}
		} else {
			// 验证普通用户登录（通过手机号）
			user = await userManager.login(phone, password);
		}

		if (!user) {
			return NextResponse.json(
				{ error: '手机号或密码错误，请联系管理员！' },
				{ status: 401 }
			);
		}

		// 创建响应并设置 Cookie
		const response = NextResponse.json({
			message: '登录成功',
			user,
		});

		console.log('=== 登录接口日志 ===');
		console.log('登录用户信息:', user);
		console.log('用户ID:', user.id);
		console.log('NODE_ENV:', process.env.NODE_ENV);

		// 根据环境动态设置 Cookie 配置
		const isProduction = process.env.NODE_ENV === 'production';
		const cookieSecure = isProduction && process.env.COOKIE_SECURE !== 'false';
		const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? '.zjsifan.com' : undefined);

		console.log('Cookie配置:', {
			httpOnly: isProduction, // 生产环境 true，开发环境 false
			secure: cookieSecure,
			sameSite: 'lax',
			domain: cookieDomain,
		});

		// 设置用户 ID 到 Cookie（简单实现，生产环境应使用 JWT）
		response.cookies.set('userId', user.id, {
			httpOnly: isProduction, // 生产环境设为 true，开发环境设为 false 方便调试
			secure: cookieSecure, // 生产环境使用 secure，开发环境不使用
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7, // 7 天
			domain: cookieDomain,
		});

		console.log('✅ Cookie已设置，userId:', user.id);
		console.log('==================');

		return response;
	} catch (error: any) {
		console.error('Login error:', error);
		return NextResponse.json(
			{ error: '登录失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
LOGINEOF

echo "✓ 登录API已修复"

# 修复会员 API
echo ""
echo "【步骤 3/4】修复会员API的认证机制..."

cat > src/app/api/user/me/member/route.ts << 'MEMBEREOF'
import { NextRequest, NextResponse } from 'next/server';
import { memberManager } from '@/storage/database/memberManager';
import { userManager } from '@/storage/database/userManager';

export async function GET(request: NextRequest) {
	try {
		// 双重认证：优先从 Cookie 读取，失败则从 Header 读取
		let userId = request.cookies.get('userId')?.value;

		// 如果 Cookie 中没有 userId，尝试从 Header 读取（备选方案）
		if (!userId) {
			userId = request.headers.get('x-user-id');
			console.log('Member API: Cookie中无userId，尝试从Header读取');
		}

		console.log('Member API: 最终userId:', userId);
		console.log('Member API: 所有Cookie:', request.cookies.getAll());
		console.log('Member API: Headers x-user-id:', request.headers.get('x-user-id'));

		if (!userId) {
			console.log('Member API: userId不存在，返回401');
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		let member = await memberManager.getMemberByUserId(userId);
		console.log('Member API: 查询到的会员信息:', member);

		// 如果会员不存在，自动创建基础会员
		if (!member) {
			console.log('Member API: 会员不存在，尝试自动创建');
			try {
				// 对于管理员账户，直接创建会员记录
				if (userId === 'admin-id') {
					console.log('Member API: 检测到管理员账户，创建会员记录');
					member = await memberManager.createMember({
						userId,
						memberLevel: 'platinum', // 管理员给白金会员
						balance: 0,
						points: 0,
						totalRecharge: 0,
						totalConsumption: 0,
						memberStatus: 'active',
					});
					console.log('Member API: 创建的管理员会员信息:', member);
				} else {
					// 获取用户信息，使用用户注册时间作为成为会员的时间
					const user = await userManager.getUserById(userId);
					console.log('Member API: 获取到的用户信息:', user);
					const createdAt = user?.createdAt || new Date().toISOString();

					member = await memberManager.createMember({
						userId,
						memberLevel: 'basic',
						balance: 0,
						points: 0,
						totalRecharge: 0,
						totalConsumption: 0,
						memberStatus: 'active',
					});
					console.log('Member API: 创建的会员信息:', member);
				}
			} catch (createError) {
				console.error('Auto-create member error:', createError);
				return NextResponse.json(
					{ error: '会员信息创建失败' },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({ member });
	} catch (error: any) {
		console.error('Get member error:', error);

		// 如果是数据库连接错误，返回 401 而不是 500
		if (error.message?.includes('Database') || error.message?.includes('PGDATABASE')) {
			return NextResponse.json(
				{ error: '数据库未配置' },
				{ status: 401 }
			);
		}

		return NextResponse.json(
			{ error: '获取会员信息失败' },
			{ status: 500 }
		);
	}
}
MEMBEREOF

echo "✓ 会员API已修复"

# 4. 重新构建并重启
echo ""
echo "【步骤 4/4】重新构建并重启服务..."

echo "卸载 formidable（如果有）..."
pnpm remove formidable || npm uninstall formidable || echo "formidable 未安装，跳过"

echo "安装依赖..."
pnpm install

echo "构建项目..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    echo "正在恢复备份..."
    cp src/app/api/auth/login/route.ts.backup src/app/api/auth/login/route.ts
    cp src/app/api/user/me/member/route.ts.backup src/app/api/user/me/member/route.ts
    exit 1
fi

echo "重启 PM2 应用..."
pm2 restart enterprise-website

echo "等待服务启动..."
sleep 15

echo ""
echo "=========================================="
echo "修复完成！"
echo "=========================================="

echo ""
echo "验证结果:"
pm2 status

echo ""
echo "=========================================="
echo "重要提示："
echo "用户需要重新登录才能生效！"
echo "=========================================="
echo ""
echo "测试建议："
echo "1. 在浏览器中访问: https://www.zjsifan.com"
echo "2. 退出登录，重新登录"
echo "3. 悬停在用户名上，查看会员信息"
echo "=========================================="
