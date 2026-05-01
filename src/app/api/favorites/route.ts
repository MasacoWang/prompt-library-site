import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAuthOptions(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GitHubProvider = require('next-auth/providers/github').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const CredentialsProvider = require('next-auth/providers/credentials').default;
  return {
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
      CredentialsProvider({
        name: 'Email',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Passcode', type: 'password' },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async authorize(credentials: any) {
          if (!credentials?.email || !credentials?.password) return null;
          return { id: credentials.email, email: credentials.email, name: credentials.email.split('@')[0] };
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    callbacks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async session({ session, token }: any) {
        if (session.user) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
  };
}

function getUserId(session: { user?: { id?: string; email?: string } }): string | null {
  return session?.user?.id || session?.user?.email || null;
}

// GET - Load all user data (favorites, templates, custom categories)
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session: any = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = getUserId(session);
    const [favorites, userTemplates, customCategories, deletedIds] = await Promise.all([
      kv.get<string[]>(`favorites:${userId}`),
      kv.get(`templates:${userId}`),
      kv.get<string[]>(`categories:${userId}`),
      kv.get<string[]>(`deleted:${userId}`),
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
    const session: any = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = getUserId(session);
    const { favorites, userTemplates, customCategories, deletedTemplateIds } = await req.json();

    const promises = [];
    if (favorites !== undefined) promises.push(kv.set(`favorites:${userId}`, favorites));
    if (userTemplates !== undefined) promises.push(kv.set(`templates:${userId}`, userTemplates));
    if (customCategories !== undefined) promises.push(kv.set(`categories:${userId}`, customCategories));
    if (deletedTemplateIds !== undefined) promises.push(kv.set(`deleted:${userId}`, deletedTemplateIds));

    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
