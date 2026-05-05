import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kvGet, kvSet } from '@/lib/redis';
import { authOptions } from '@/lib/auth';

function checkIsAdmin(email?: string | null, githubLogin?: string | null): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(e => e.trim()).filter(Boolean);
  const adminGithub = (process.env.ADMIN_GITHUB_USERNAMES || '').toLowerCase().split(',').map(u => u.trim()).filter(Boolean);
  if (email && adminEmails.includes(email.toLowerCase().trim())) return true;
  if (githubLogin && adminGithub.includes(githubLogin.toLowerCase().trim())) return true;
  return false;
}

async function verifyAdmin(): Promise<{ isAdmin: boolean; error?: NextResponse }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session: any = await getServerSession(authOptions);
  if (!session?.user) {
    return { isAdmin: false, error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
  }
  if (!session.user.isAdmin && !checkIsAdmin(session.user.email)) {
    return { isAdmin: false, error: NextResponse.json({ error: 'Not authorized' }, { status: 403 }) };
  }
  return { isAdmin: true };
}

const KV_TEMPLATES_KEY = 'shared-templates';

interface SharedTemplate {
  id: string;
  title: string;
  category: string;
  kind: 'prompt' | 'template' | 'copywriting';
  kinds?: string[];
  body: string;
  casualBody?: string;
  pinned: boolean;
  scenario: string[];
  phase: string[];
  createdAt: string;
  updatedAt: string;
}

function validateTemplate(data: Record<string, unknown>): { valid: boolean; error?: string; template?: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt'> } {
  const { title, category, kind, kinds, body, casualBody, pinned, scenario, phase } = data;
  if (!title || typeof title !== 'string' || title.trim().length === 0) return { valid: false, error: 'Title is required' };
  if (!category || typeof category !== 'string') return { valid: false, error: 'Category is required' };
  if (!kind || !['prompt', 'template', 'copywriting'].includes(kind as string)) return { valid: false, error: 'Kind must be prompt, template, or copywriting' };
  if (!body || typeof body !== 'string' || body.trim().length === 0) return { valid: false, error: 'Body is required' };
  if (casualBody !== undefined && casualBody !== null && typeof casualBody !== 'string') return { valid: false, error: 'casualBody must be a string' };
  if (scenario !== undefined && !Array.isArray(scenario)) return { valid: false, error: 'scenario must be an array' };
  if (phase !== undefined && !Array.isArray(phase)) return { valid: false, error: 'phase must be an array' };

  return {
    valid: true,
    template: {
      title: (title as string).trim(),
      category: category as string,
      kind: kind as 'prompt' | 'template' | 'copywriting',
      kinds: Array.isArray(kinds) ? kinds.filter((k): k is string => typeof k === 'string') : [kind as string],
      body: (body as string).trim(),
      casualBody: casualBody ? (casualBody as string).trim() : undefined,
      pinned: pinned === true,
      scenario: Array.isArray(scenario) ? scenario.filter((s): s is string => typeof s === 'string') : [],
      phase: Array.isArray(phase) ? phase.filter((p): p is string => typeof p === 'string') : [(category as string).toLowerCase()],
    },
  };
}

// POST — Create a new shared template
export async function POST(req: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return error!;

  try {
    const data = await req.json();
    const validation = validateTemplate(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const templates: SharedTemplate[] = (await kvGet(KV_TEMPLATES_KEY)) || [];
    const now = new Date().toISOString();
    const id = 'shared-' + validation.template!.kind + '-' + validation.template!.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check for duplicate ID
    if (templates.some(t => t.id === id)) {
      return NextResponse.json({ error: 'A template with this title and kind already exists' }, { status: 409 });
    }

    const newTemplate: SharedTemplate = {
      id,
      ...validation.template!,
      createdAt: now,
      updatedAt: now,
    };

    templates.push(newTemplate);
    await kvSet(KV_TEMPLATES_KEY, templates);

    return NextResponse.json({ success: true, template: newTemplate }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

// PUT — Update an existing shared template
export async function PUT(req: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return error!;

  try {
    const data = await req.json();
    const { id } = data;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Template id is required' }, { status: 400 });
    }

    const validation = validateTemplate(data);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const templates: SharedTemplate[] = (await kvGet(KV_TEMPLATES_KEY)) || [];
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    templates[idx] = {
      ...templates[idx],
      ...validation.template!,
      updatedAt: new Date().toISOString(),
    };
    await kvSet(KV_TEMPLATES_KEY, templates);

    return NextResponse.json({ success: true, template: templates[idx] });
  } catch {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

// DELETE — Delete a shared template
export async function DELETE(req: NextRequest) {
  const { isAdmin, error } = await verifyAdmin();
  if (!isAdmin) return error!;

  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Template id is required' }, { status: 400 });
    }

    const templates: SharedTemplate[] = (await kvGet(KV_TEMPLATES_KEY)) || [];
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await kvSet(KV_TEMPLATES_KEY, filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
