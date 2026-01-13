import { NextRequest, NextResponse } from 'next/server';
import { getWechatAccessToken, getWechatUserInfo } from '@/lib/wechat-oauth';
import { userManager } from '@/storage/database/userManager';
import { memberManager } from '@/storage/database/memberManager';
import { generateToken } from '@/lib/auth';
import { db } from '@/storage/database';
import { users } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

// 简单的内存存储（生产环境应该使用Redis）
const qrCodeSessions = new Map<string, {
	scanned: boolean;
	confirmed: boolean;
	userId?: string;
	token?: string;
	authUrl?: string;
	expireAt?: number;
}>();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const code = searchParams.get('code');
		const state = searchParams.get('state');

		// 检查是否有错误
		if (searchParams.get('error')) {
			const error = searchParams.get('error_description') || '授权失败';
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent(error)}`);
		}

		if (!code || !state) {
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('缺少必要参数')}`);
		}

		console.log('微信回调:', { code, state });

		// 检查session是否有效
		const session = qrCodeSessions.get(state);
		if (!session) {
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('二维码已过期')}`);
		}

		// 检查是否过期
		if (session.expireAt && Date.now() > session.expireAt) {
			qrCodeSessions.delete(state);
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('二维码已过期')}`);
		}

		// 标记为已扫码
		session.scanned = true;
		qrCodeSessions.set(state, session);

		// 1. 用code换取access_token
		console.log('获取access_token...');
		const tokenData = await getWechatAccessToken(code);

		if (!tokenData) {
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('获取access_token失败')}`);
		}

		console.log('access_token获取成功, openid:', tokenData.openid);

		// 2. 获取用户信息
		console.log('获取用户信息...');
		const userInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid);

		if (!userInfo) {
			return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent('获取用户信息失败')}`);
		}

		console.log('用户信息获取成功:', userInfo.nickname);

		// 3. 查找或创建用户
		let user;
		let isNewUser = false;

		// 先尝试通过openid查找用户（需要在users表添加openid字段）
		// 这里暂时使用其他方式查找，或者直接创建新用户

		// 尝试通过unionid查找（如果有）
		if (userInfo.unionid) {
			const [existingUser] = await db.select().from(users).where(eq(users.email, `wx_unionid_${userInfo.unionid}@wechat.com`));
			if (existingUser) {
				user = existingUser;
			}
		}

		// 如果没找到，通过openid查找
		if (!user) {
			const [existingUser] = await db.select().from(users).where(eq(users.email, `wx_openid_${tokenData.openid}@wechat.com`));
			if (existingUser) {
				user = existingUser;
			}
		}

		// 如果还是没找到，创建新用户
		if (!user) {
			isNewUser = true;
			console.log('创建新用户...');

			// 生成随机手机号作为临时标识（因为微信开放平台不能直接获取手机号）
			// 实际项目中，可以要求用户后续补充手机号，或者使用unionid作为唯一标识
			const tempPhone = `WX${Date.now()}`.slice(0, 11);

			user = await userManager.createUser({
				email: `wx_openid_${tokenData.openid}@wechat.com`,
				phone: tempPhone,
				name: userInfo.nickname || '微信用户',
				password: '', // 微信登录用户没有密码
				isAdmin: false,
				isActive: true,
			});

			// 创建会员账户
			await memberManager.createMember({
				userId: user.id,
				memberLevel: 'basic',
				balance: 0,
				points: 0,
				totalRecharge: 0,
				totalConsumption: 0,
				memberStatus: 'active',
			});

			console.log('新用户创建成功, userId:', user.id);
		} else {
			// 更新用户信息
			await userManager.updateUser(user.id, {
				name: userInfo.nickname || user.name,
			} as any);
			console.log('用户信息更新成功, userId:', user.id);
		}

		// 4. 生成JWT token
		const token = generateToken({ userId: user.id });

		// 5. 更新session
		session.confirmed = true;
		session.userId = user.id;
		session.token = token;
		qrCodeSessions.set(state, session);

		console.log('登录成功, userId:', user.id);

		// 6. 重定向到前端登录成功页面
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?wechat=success&state=${state}`);
	} catch (error: any) {
		console.error('微信回调处理失败:', error);
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login?error=${encodeURIComponent(error.message || '登录失败')}`);
	}
}
