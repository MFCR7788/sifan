import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  const userId = request.cookies.get('userId')?.value;
  const headerUserId = request.headers.get('x-user-id');

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookies: allCookies.map(c => ({ name: c.name, value: c.value })),
    cookieUserId: userId,
    headerUserId: headerUserId,
    finalUserId: userId || headerUserId,
    allCookieString: request.headers.get('cookie'),
  });
}
