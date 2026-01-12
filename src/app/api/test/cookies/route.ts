import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const userId = request.cookies.get('userId')?.value;

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookies: allCookies.map(c => ({ name: c.name, value: c.value })),
    userId: userId,
    allCookieString: request.headers.get('cookie'),
  });
}
