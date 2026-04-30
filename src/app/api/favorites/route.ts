import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { kv } from '@vercel/kv';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAuthOptions(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const GitHubProvider = require('next-auth/providers/github').default;
  return {
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
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

// GET - Load favorites for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.email;
    const favorites = await kv.get<string[]>(`favorites:${userId}`) || [];
    return NextResponse.json({ favorites });
  } catch {
    return NextResponse.json({ favorites: [] });
  }
}

// POST - Save favorites for logged-in user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { favorites } = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id || session.user.email;
    await kv.set(`favorites:${userId}`, favorites);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
