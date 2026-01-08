import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const cookies = request.cookies;
	const userId = cookies.get('userId');

	const allCookies: Record<string, string> = {};
	cookies.getAll().forEach(cookie => {
		allCookies[cookie.name] = cookie.value;
	});

	return NextResponse.json({
		hasUserId: !!userId,
		userId: userId?.value,
		allCookies,
		headers: {
			cookie: request.headers.get('cookie'),
		},
	});
}
