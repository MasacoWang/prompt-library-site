import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

function hashPasscode(passcode: string): string {
  return createHash('sha256').update(passcode).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const { email, passcode, reset } = await req.json();

    if (!email || !passcode) {
      return NextResponse.json({ error: 'Email and passcode are required' }, { status: 400 });
    }
    if (passcode.length < 4) {
      return NextResponse.json({ error: 'Passcode must be at least 4 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await kv.get(`user:${normalizedEmail}`);

    if (existing && !reset) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in or reset your passcode.' }, { status: 409 });
    }

    const hashed = hashPasscode(passcode);
    await kv.set(`user:${normalizedEmail}`, { hashedPasscode: hashed, createdAt: Date.now() });

    return NextResponse.json({ success: true, isReset: !!existing });
  } catch {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
