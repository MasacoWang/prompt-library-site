'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Email Templates', href: '/templates' },
  { label: 'Prompt Library', href: '/prompts' },
  { label: '🤖 AI Assistant', href: '/ai-assistant' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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
