import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

function hashPasscode(passcode: string): string {
  return createHash('sha256').update(passcode).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { currentPasscode, newPasscode } = await req.json();

    if (!currentPasscode || !newPasscode) {
      return NextResponse.json({ error: 'Current and new passcode are required' }, { status: 400 });
    }
    if (newPasscode.length < 4) {
      return NextResponse.json({ error: 'New passcode must be at least 4 characters' }, { status: 400 });
    }

    const normalizedEmail = session.user.email.toLowerCase().trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stored: any = await kv.get(`user:${normalizedEmail}`);
    if (!stored || !stored.hashedPasscode) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Verify current passcode
    const currentHash = hashPasscode(currentPasscode);
    if (currentHash !== stored.hashedPasscode) {
      return NextResponse.json({ error: 'Current passcode is incorrect' }, { status: 403 });
    }

    // Update to new passcode
    const newHash = hashPasscode(newPasscode);
    await kv.set(`user:${normalizedEmail}`, { ...stored, hashedPasscode: newHash });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to change passcode' }, { status: 500 });
  }
}
