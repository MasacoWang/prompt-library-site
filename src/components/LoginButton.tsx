'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

function ChangePasscodeModal({ onClose }: { onClose: () => void }) {
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasscode || !newPasscode) { setError('All fields are required'); return; }
    if (newPasscode.length < 4) { setError('New passcode must be at least 4 characters'); return; }
    if (newPasscode !== confirmPasscode) { setError('New passcodes do not match'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/change-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPasscode, newPasscode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change passcode');
        setLoading(false);
        return;
      }
      setSuccess('Passcode changed successfully!');
      setTimeout(onClose, 1500);
    } catch {
      setError('Failed to change passcode');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-5 w-full max-w-xs shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-text-primary mb-4">Change Passcode</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={currentPasscode}
            onChange={(e) => setCurrentPasscode(e.target.value)}
            placeholder="Current passcode"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            placeholder="New passcode (min 4 chars)"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={confirmPasscode}
            onChange={(e) => setConfirmPasscode(e.target.value)}
            placeholder="Confirm new passcode"
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-text-secondary hover:bg-surface-hover transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginButton() {
  const { data: session, status } = useSession();
  const [showChangePasscode, setShowChangePasscode] = useState(false);

  if (status === 'loading') {
    return <span className="text-xs text-text-muted">...</span>;
  }

  if (session?.user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary hidden sm:inline truncate max-w-[120px]">
            {session.user.name || session.user.email}
          </span>
          <button
            onClick={() => setShowChangePasscode(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
            title="Change passcode"
          >
            🔒
          </button>
          <button
            onClick={() => signOut()}
            className="text-xs px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
          >
            Sign out
          </button>
        </div>
        {showChangePasscode && <ChangePasscodeModal onClose={() => setShowChangePasscode(false)} />}
      </>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => signIn()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
      >
        🔑 Sign in
      </button>
      {/* Tooltip hint */}
      <div className="absolute top-full right-0 mt-2 w-52 p-2.5 rounded-lg bg-text-primary text-white text-[11px] leading-relaxed shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <p className="font-medium mb-1">Optional — no sign‑in needed!</p>
        <p>Sign in with any email + passcode to sync favorites across devices.</p>
      </div>
    </div>
  );
}
