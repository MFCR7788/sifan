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
