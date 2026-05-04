import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

const KV_TEMPLATES_KEY = 'shared-templates';

export async function GET() {
  try {
    const templates = (await kv.get(KV_TEMPLATES_KEY)) || [];
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: [] });
  }
}
