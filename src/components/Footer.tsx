'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('bug');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type }),
      });
      if (res.ok) {
        setStatus('sent');
        setMessage('');
        setTimeout(() => { setOpen(false); setStatus('idle'); }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-text-secondary border border-border hover:border-primary/40 hover:text-primary transition-all"
      >
        🐛 Report a Bug / Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary">🐛 Send Feedback</h3>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary text-lg">✕</button>
            </div>
            <div className="flex gap-2">
              {(['bug', 'suggestion', 'other'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    type === t ? 'bg-primary text-white' : 'bg-surface-alt text-text-secondary border border-border'
                  }`}
                >
                  {t === 'bug' ? '🐛 Bug' : t === 'suggestion' ? '💡 Suggestion' : '💬 Other'}
                </button>
              ))}
            </div>
            <div>
              <p className="text-[11px] text-text-muted mb-1.5">Common topics (click to add):</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Sign in not working',
                  'Template not loading',
                  'Outlook button not working',
                  'Copy to Copilot failed',
                  'Filter not showing results',
                  'Variables not filling in',
                  'Page loading slowly',
                  'Request a new template',
                ].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setMessage((prev) => prev ? `${prev}\n${topic}` : topic)}
                    className="px-2 py-1 rounded-md text-[10px] font-medium bg-surface-alt text-text-secondary border border-border hover:border-primary/40 hover:text-primary transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue or share your idea…"
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || status === 'sending'}
              className="btn-primary w-full py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending…' : status === 'sent' ? '✓ Sent! Thank you' : status === 'error' ? 'Failed — try again' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SiteVisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const KEY = 'ai-recruiter-toolkit-site';
    const NAMESPACE = 'prompt-library-site';
    // Only count once per session
    const counted = sessionStorage.getItem('visitor-counted');
    const url = counted
      ? `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}`
      : `https://api.counterapi.dev/v1/${NAMESPACE}/${KEY}/up`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setCount(data.count);
          if (!counted) sessionStorage.setItem('visitor-counted', '1');
        }
      })
      .catch(() => {});
  }, []);

  if (count === null) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
      👀 {count.toLocaleString()} {count === 1 ? 'visit' : 'visits'}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img src="/favicon.svg" alt="Logo" className="w-6 h-6 rounded-md" />
              <span className="text-sm font-semibold text-text-primary">AI Recruiter Toolkit</span>
            </div>
            <p className="text-xs text-text-muted">Prompts, templates, and AI tools for modern recruiters.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary transition">Home</Link>
            <Link href="/templates?kind=template" className="text-xs text-text-secondary hover:text-text-primary transition">Email Templates</Link>
            <Link href="/templates?kind=prompt" className="text-xs text-text-secondary hover:text-text-primary transition">Prompt Library</Link>
            <Link href="/ai-assistant" className="text-xs text-text-secondary hover:text-text-primary transition">AI Assistant</Link>
          </div>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-text-muted leading-relaxed">
              ⚠️ Templates are for general guidance only. Please tailor wording to your company policy and local regulations.
              Do not paste sensitive personal data or candidate PII on this public site.
            </p>
            <SiteVisitorCount />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-text-muted">
              Copyright © 2026 Clarice Wang. All rights reserved.
            </p>
            <FeedbackButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
