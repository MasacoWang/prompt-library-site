'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <span className="text-xs text-text-muted">...</span>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary hidden sm:inline truncate max-w-[120px]">
          {session.user.name || session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
    >
      🔑 Sign in
    </button>
  );
}
