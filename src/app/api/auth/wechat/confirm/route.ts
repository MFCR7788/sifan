import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '@/lib/auth';

// 简单的内存存储（生产环境应该使用Redis）
const qrCodeSessions = new Map<string, { scanned: boolean; confirmed: boolean; userId?: string; token?: string }>();

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { sceneStr, userId } = body;

		if (!sceneStr || !userId) {
			return NextResponse.json(
				{ success: false, error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		const session = qrCodeSessions.get(sceneStr);

		if (!session) {
			return NextResponse.json(
				{ success: false, error: '二维码已过期' },
				{ status: 400 }
			);
		}

		// 生成token
		const token = generateToken({ userId });

		// 更新session
		session.scanned = true;
		session.confirmed = true;
		session.userId = userId;
		session.token = token;

		qrCodeSessions.set(sceneStr, session);

		return NextResponse.json({
			success: true,
			token,
		});
	} catch (error: any) {
		console.error('Failed to confirm QR code login:', error);
		return NextResponse.json(
			{ success: false, error: error.message || '确认登录失败' },
			{ status: 500 }
		);
	}
}
