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

const GUIDE_STEPS = [
  { step: 1, title: 'Browse', desc: 'Pick a category — Email Templates, Prompts, or Job Posts — or use filters to find what you need.' },
  { step: 2, title: 'Select', desc: 'Click any template to preview the full content.' },
  { step: 3, title: 'Customize', desc: 'Fill in the variables, switch tone, or edit the content to make it yours.' },
  { step: 4, title: 'Use', desc: 'Copy the text, send to Outlook, or open in Copilot Chat — ready to go.' },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentHash(window.location.hash);
    const onHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrowseOpen(false);
      }
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) {
        setGuideOpen(false);
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

          {/* How to Use dropdown */}
          <div ref={guideRef} className="relative">
            <button
              onClick={() => setGuideOpen(!guideOpen)}
              className={`px-2.5 py-1.5 rounded-lg text-[12.5px] font-medium transition-all inline-flex items-center gap-1 whitespace-nowrap ${
                guideOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              ℹ️ Guide
              <span className={`text-[10px] transition-transform ${guideOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {guideOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-80 bg-white rounded-xl border border-border shadow-lg p-5 animate-fade-in z-50">
                <p className="text-[13px] font-bold text-text-primary mb-1">Welcome to AI Recruiter Toolkit</p>
                <p className="text-[11px] text-text-muted leading-relaxed mb-4">
                  Your one-stop resource for recruiting emails, AI prompts, and job post templates — find, customize, and send in seconds.
                </p>
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">How It Works</p>
                <div className="space-y-3">
                  {GUIDE_STEPS.map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">{item.step}</span>
                      <div>
                        <p className="text-[12px] font-semibold text-text-primary">{item.title}</p>
                        <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-[11px] text-text-muted">
                    💡 <span className="font-medium">Tip:</span> Sign in with any email to keep your templates, edits, and favorites saved across devices.
                  </p>
                </div>
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
          <div className="border-t border-border my-2" />
          <div className="px-3 pt-1 pb-1">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">ℹ️ How It Works</p>
          </div>
          <div className="px-3 py-2">
            <p className="text-[11px] text-text-muted leading-relaxed mb-3">
              Your one-stop resource for recruiting emails, AI prompts, and job post templates — find, customize, and send in seconds.
            </p>
            {GUIDE_STEPS.map((item) => (
              <div key={item.step} className="flex gap-2.5 py-1.5">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">{item.step}</span>
                <div>
                  <p className="text-[12px] font-semibold text-text-primary">{item.title}</p>
                  <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-text-muted mt-2">
              💡 <span className="font-medium">Tip:</span> Sign in to keep your changes saved across devices.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
