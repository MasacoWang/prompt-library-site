import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { passcode } = await req.json();
  const validPasscode = process.env.SITE_PASSCODE;

  if (passcode === validPasscode) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('site_access', 'granted', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, error: 'Invalid passcode' }, { status: 401 });
}
