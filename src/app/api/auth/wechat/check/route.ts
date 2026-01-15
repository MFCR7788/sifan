import { NextRequest, NextResponse } from 'next/server';

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
		const sceneStr = searchParams.get('sceneStr');

		if (!sceneStr) {
			return NextResponse.json(
				{ success: false, error: '缺少sceneStr参数' },
				{ status: 400 }
			);
		}

		const session = qrCodeSessions.get(sceneStr);

		if (!session) {
			return NextResponse.json({
				success: false,
				scanned: false,
				confirmed: false,
				expired: true,
			});
		}

		// 检查是否过期
		if (session.expireAt && Date.now() > session.expireAt) {
			qrCodeSessions.delete(sceneStr);
			return NextResponse.json({
				success: false,
				scanned: false,
				confirmed: false,
				expired: true,
			});
		}

		return NextResponse.json({
			success: true,
			scanned: session.scanned,
			confirmed: session.confirmed,
			userId: session.userId,
			token: session.token,
			expired: false,
		});
	} catch (error: unknown) {
		console.error('Failed to check QR code status:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : '检查扫码状态失败' },
			{ status: 500 }
		);
	}
}
