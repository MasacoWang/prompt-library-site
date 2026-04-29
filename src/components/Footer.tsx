'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-white text-xs font-bold">C</div>
              <span className="text-sm font-semibold text-text-primary">AI Recruiter Toolkit</span>
            </div>
            <p className="text-xs text-text-muted">Prompts, templates, and AI tools for modern recruiters.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary transition">Home</Link>
            <Link href="/templates" className="text-xs text-text-secondary hover:text-text-primary transition">Templates</Link>
            <Link href="/prompts" className="text-xs text-text-secondary hover:text-text-primary transition">Prompts</Link>
            <Link href="/ai-assistant" className="text-xs text-text-secondary hover:text-text-primary transition">AI Assistant</Link>
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <p className="text-[11px] text-text-muted leading-relaxed">
            ⚠️ Templates are for general guidance only. Please tailor wording to your company policy and local regulations.
            Do not paste sensitive personal data or candidate PII on this public site.
          </p>
        </div>
      </div>
    </footer>
  );
}
