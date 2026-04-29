'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BROWSE_ITEMS = [
  { label: '✉️ Email Templates', href: '/templates' },
  { label: '💡 Prompt Library', href: '/prompts' },
  { label: '🎯 Scenarios', href: '/#scenarios' },
  { label: '📊 Recruiting Phases', href: '/#phases' },
  { label: '🤖 AI Assistant', href: '/ai-assistant' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isBrowseActive = ['/templates', '/prompts', '/ai-assistant'].includes(pathname) || pathname === '/';

  return (
    <header className="header-bar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
            C
          </div>
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">
            AI Recruiter Toolkit
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
              pathname === '/'
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            Home
          </Link>

          {/* Browse the Toolkit dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setBrowseOpen(!browseOpen)}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all inline-flex items-center gap-1 ${
                isBrowseActive || browseOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              Browse the Toolkit
              <span className={`text-[10px] transition-transform ${browseOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {browseOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-border shadow-lg py-1.5 animate-fade-in z-50">
                {BROWSE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setBrowseOpen(false)}
                    className={`block px-4 py-2.5 text-[13px] font-medium transition ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/ai-assistant"
          className="hidden md:inline-flex btn-primary px-4 py-2 text-[13px] shrink-0 items-center gap-1.5"
        >
          🤖 Try AI Assistant
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-hover transition"
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-lg px-4 pb-4 pt-2 space-y-1">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              pathname === '/' ? 'bg-primary/10 text-primary' : 'text-text-secondary'
            }`}
          >
            Home
          </Link>
          <div className="px-3 pt-3 pb-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Browse the Toolkit</p>
          </div>
          {BROWSE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition pl-5 ${
                pathname === item.href ? 'bg-primary/10 text-primary' : 'text-text-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/ai-assistant"
            onClick={() => setMenuOpen(false)}
            className="block btn-primary px-4 py-2.5 text-sm text-center mt-2"
          >
            🤖 Try AI Assistant
          </Link>
        </div>
      )}
    </header>
  );
}
