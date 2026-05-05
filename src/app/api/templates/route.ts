import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const KV_TEMPLATES_KEY = 'shared-templates';

export async function GET() {
  try {
    const templates = (await kvGet(KV_TEMPLATES_KEY)) || [];
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: [] });
  }
}
