'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passcode) { setError('Please enter email and passcode'); return; }
    if (passcode.length < 4) { setError('Passcode must be at least 4 characters'); return; }

    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email,
      password: passcode,
      callbackUrl,
      redirect: false,
    });
    if (result?.error) {
      setError('Invalid email or passcode. Please try again or register first.');
      setLoading(false);
    } else if (result?.ok) {
      window.location.href = callbackUrl;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passcode) { setError('Please enter email and passcode'); return; }
    if (passcode.length < 4) { setError('Passcode must be at least 4 characters'); return; }
    if (passcode !== confirmPasscode) { setError('Passcodes do not match'); return; }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
      setSuccess('Registered successfully! Signing you in...');
      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password: passcode,
        callbackUrl,
        redirect: false,
      });
      if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        setSuccess('');
        setError('Registered but sign-in failed. Please try signing in manually.');
        setLoading(false);
      }
    } catch {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-text-primary mb-2">Sign in to AI Recruiter Toolkit</h1>
          <p className="text-xs text-text-muted">Sign in to sync your favorites across devices</p>
        </div>

        <div className="card p-6 space-y-5">
          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-medium transition ${mode === 'signin' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-hover'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-xs font-medium transition ${mode === 'register' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface-hover'}`}
            >
              Register
            </button>
          </div>

          {/* Email + Passcode Form */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Your passcode (min 4 chars)"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Confirm Passcode</label>
                <input
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Re-enter your passcode"
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-600">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? (mode === 'signin' ? 'Signing in...' : 'Registering...') : (mode === 'signin' ? '✉️ Sign in with Email' : '✉️ Register with Email')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* GitHub */}
          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface-hover transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            Sign in with GitHub
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 p-3 rounded-lg bg-surface-alt border border-border text-center">
          <p className="text-[11px] text-text-muted">
            🔓 <span className="font-medium">No sign‑in required</span> to use templates. Sign in only syncs your favorites across devices.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mesh flex items-center justify-center"><p className="text-text-muted">Loading...</p></div>}>
      <SignInForm />
    </Suspense>
  );
}
