import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kvGet, kvSet } from '@/lib/redis';
import { authOptions } from '@/lib/auth';

function getUserId(session: { user?: { id?: string; email?: string } }): string | null {
  return session?.user?.id || session?.user?.email || null;
}

// GET - Load all user data (favorites, templates, custom categories)
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = getUserId(session);
    const [favorites, userTemplates, customCategories, deletedIds] = await Promise.all([
      kvGet<string[]>(`favorites:${userId}`),
      kvGet(`templates:${userId}`),
      kvGet<string[]>(`categories:${userId}`),
      kvGet<string[]>(`deleted:${userId}`),
    ]);

    return NextResponse.json({
      favorites: favorites || [],
      userTemplates: userTemplates || [],
      customCategories: customCategories || [],
      deletedTemplateIds: deletedIds || [],
    });
  } catch {
    return NextResponse.json({ favorites: [], userTemplates: [], customCategories: [], deletedTemplateIds: [] });
  }
}

// POST - Save user data
export async function POST(req: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = getUserId(session);
    const { favorites, userTemplates, customCategories, deletedTemplateIds } = await req.json();

    const promises = [];
    if (favorites !== undefined) promises.push(kvSet(`favorites:${userId}`, favorites));
    if (userTemplates !== undefined) promises.push(kvSet(`templates:${userId}`, userTemplates));
    if (customCategories !== undefined) promises.push(kvSet(`categories:${userId}`, customCategories));
    if (deletedTemplateIds !== undefined) promises.push(kvSet(`deleted:${userId}`, deletedTemplateIds));

    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
