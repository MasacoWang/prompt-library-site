import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { kv } from '@vercel/kv';
import { createHash } from 'crypto';

function hashPasscode(passcode: string): string {
  return createHash('sha256').update(passcode).digest('hex');
}

function checkIsAdmin(email?: string | null, githubLogin?: string | null): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(e => e.trim()).filter(Boolean);
  const adminGithub = (process.env.ADMIN_GITHUB_USERNAMES || '').toLowerCase().split(',').map(u => u.trim()).filter(Boolean);
  if (email && adminEmails.includes(email.toLowerCase().trim())) return true;
  if (githubLogin && adminGithub.includes(githubLogin.toLowerCase().trim())) return true;
  return false;
}

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Passcode', type: 'password', placeholder: 'Your passcode' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.password.length < 4) return null;

        const normalizedEmail = credentials.email.toLowerCase().trim();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stored: any = await kv.get(`user:${normalizedEmail}`);
        if (!stored || !stored.hashedPasscode) return null;

        const inputHash = hashPasscode(credentials.password);
        if (inputHash !== stored.hashedPasscode) return null;

        return {
          id: normalizedEmail,
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, account, profile }: any) {
      // Store GitHub username in the JWT on first sign-in
      if (account?.provider === 'github' && profile?.login) {
        token.githubLogin = profile.login;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
        // Recompute admin status from env vars on every session fetch
        session.user.isAdmin = checkIsAdmin(token.email, token.githubLogin);
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
