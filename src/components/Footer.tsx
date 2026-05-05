'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
          <p className="text-[11px] text-text-muted">
            Copyright © 2026 Clarice Wang. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
