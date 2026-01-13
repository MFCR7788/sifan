import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getWechatAuthUrl } from '@/lib/wechat-oauth';

// 简单的内存存储（生产环境应该使用Redis）
const qrCodeSessions = new Map<string, {
	scanned: boolean;
	confirmed: boolean;
	userId?: string;
	token?: string;
	authUrl?: string;
	expireAt?: number;
}>();

export async function POST(request: NextRequest) {
	try {
		// 检查是否配置了微信开放平台
		if (!process.env.WECHAT_OPEN_APPID || !process.env.WECHAT_OPEN_APPSECRET) {
			return NextResponse.json(
				{
					success: false,
					error: '微信开放平台未配置',
					message: '请在环境变量中配置 WECHAT_OPEN_APPID 和 WECHAT_OPEN_APPSECRET'
				},
				{ status: 500 }
			);
		}

		const sceneStr = uuidv4();
		const authUrl = getWechatAuthUrl(sceneStr);

		// 存储session，设置2分钟过期
		const session = {
			scanned: false,
			confirmed: false,
			authUrl,
			expireAt: Date.now() + 120000, // 2分钟后过期
		};
		qrCodeSessions.set(sceneStr, session);

		// 生成二维码URL（使用在线二维码生成服务）
		const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(authUrl)}`;

		return NextResponse.json({
			success: true,
			sceneStr,
			qrCodeUrl,
		});
	} catch (error: any) {
		console.error('Failed to generate QR code:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '生成二维码失败' },
			{ status: 500 }
		);
	}
}
