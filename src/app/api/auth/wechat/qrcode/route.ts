import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// 简单的内存存储（生产环境应该使用Redis）
const qrCodeSessions = new Map<string, { scanned: boolean; confirmed: boolean; userId?: string }>();

export async function POST(request: NextRequest) {
	try {
		const sceneStr = uuidv4();
		qrCodeSessions.set(sceneStr, { scanned: false, confirmed: false });

		// 生成模拟二维码URL（实际应该调用微信API生成带参数的二维码）
		// 这里使用在线二维码生成服务
		const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=WECHAT_LOGIN_${sceneStr}`;

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
