import { NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { message, type } = await req.json();
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Store feedback in Redis
    const feedbackList = (await kvGet<Array<{ message: string; type: string; createdAt: string }>>('feedback:list')) || [];
    feedbackList.push({
      message: message.trim().slice(0, 1000),
      type: type || 'general',
      createdAt: new Date().toISOString(),
    });
    await kvSet('feedback:list', feedbackList);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
