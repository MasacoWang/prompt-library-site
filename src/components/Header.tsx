'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginButton from '@/components/LoginButton';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'All Templates', href: '/templates' },
  { label: 'Email Templates', href: '/templates?kind=template' },
  { label: 'Prompts', href: '/templates?kind=prompt' },
];

const BROWSE_ITEMS = [
  { label: '✉️ Email Templates', href: '/templates?kind=template' },
  { label: '💡 Prompt Library', href: '/templates?kind=prompt' },
  { label: '📝 Job Post Templates', href: '/templates?kind=copywriting' },
  { label: '🤖 AI Assistant', href: '/ai-assistant' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentHash(window.location.hash);
    const onHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => {
      window.removeEventListener('hashchange', onHash);
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' && (!currentHash || currentHash === '#');
    if (href.startsWith('/#')) {
      const hash = href.replace('/', '');
      return pathname === '/' && currentHash === hash;
    }
    // Handle query param links like /templates?kind=prompt
    const [hrefPath, hrefQuery] = href.split('?');
    if (hrefQuery) {
      return pathname === hrefPath && typeof window !== 'undefined' && window.location.search === `?${hrefQuery}`;
    }
    return pathname === href;
  };

  const handleNavClick = (href: string) => {
    setBrowseOpen(false);
    setMenuOpen(false);
    if (href.startsWith('/#')) {
      const hash = href.replace('/', '');
      setCurrentHash(hash);
      if (pathname === '/') {
        window.location.hash = '';
        setTimeout(() => { window.location.hash = hash; }, 0);
      } else {
        window.location.href = href;
      }
    } else {
      setCurrentHash('');
    }
  };

  return (
    <header className="header-bar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo + AI CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-[15px] font-semibold text-text-primary tracking-tight hidden xl:inline">
              AI Recruiter Toolkit
            </span>
          </Link>
          <Link
            href="/ai-assistant"
            className="hidden md:inline-flex items-center gap-1.5 btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm"
          >
            🤖 Try AI Assistant
          </Link>
        </div>

        {/* Desktop Nav: flat links + Browse dropdown */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all whitespace-nowrap ${
                isActive(item.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Browse the Toolkit dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setBrowseOpen(!browseOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all inline-flex items-center gap-1 whitespace-nowrap ${
                browseOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              Browse Toolkit
              <span className={`text-[10px] transition-transform ${browseOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {browseOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-52 bg-white rounded-xl border border-border shadow-lg py-1.5 animate-fade-in z-50">
                {BROWSE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
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

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Login Button */}
          <LoginButton />
        </nav>

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
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-text-secondary'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border my-2" />
          <div className="px-3 pt-1 pb-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Browse Toolkit</p>
          </div>
          {BROWSE_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
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
            className="block btn-primary px-4 py-2.5 text-sm text-center mt-2 font-semibold"
          >
            🤖 Try AI Assistant
          </Link>
        </div>
      )}
    </header>
  );
}
