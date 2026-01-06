import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const response = NextResponse.json({
			message: '登出成功',
		});

		// 清除 Cookie
		response.cookies.set('userId', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 0,
		});

		return response;
	} catch (error: any) {
		console.error('Logout error:', error);
		return NextResponse.json(
			{ error: '登出失败' },
			{ status: 500 }
		);
	}
}
