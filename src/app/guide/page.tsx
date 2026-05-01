'use client';

import Link from 'next/link';

const STEPS = [
  { step: 1, title: 'Browse', desc: 'Pick a category or filter by recruiting phase', illustration: '/guide-browse.svg' },
  { step: 2, title: 'Select', desc: 'Click a template to preview the full content', illustration: '/guide-select.svg' },
  { step: 3, title: 'Customize', desc: 'Fill variables, switch tone, or edit freely', illustration: '/guide-customize.svg' },
  { step: 4, title: 'Use', desc: 'Copy, send to Outlook, or open in Copilot', illustration: '/guide-use.svg' },
];

const QUICK_LINKS = [
  { icon: '✉️', title: 'Email Templates', desc: 'Ready-to-use recruiting emails for every stage — outreach, scheduling, offers, and more.', href: '/templates?kind=template' },
  { icon: '💡', title: 'Prompt Library', desc: 'AI prompts to help you source, screen, and evaluate candidates with Copilot.', href: '/templates?kind=prompt' },
  { icon: '📝', title: 'Job Post Templates', desc: 'Professional job posting templates you can customize for any role.', href: '/templates?kind=copywriting' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Generate personalized emails, job posts, and next-step confirmations with AI.', href: '/ai-assistant' },
  { icon: '📊', title: 'Analytics', desc: 'View site usage and template popularity (passcode protected).', href: '/analytics' },
];

const TIPS = [
  { icon: '🔑', text: 'Sign in with any email + passcode to keep your templates, edits, and favorites saved across all your devices.' },
  { icon: '⭐', text: 'Click the heart icon on any template to add it to your favorites for quick access.' },
  { icon: '➕', text: 'Create your own templates by clicking "+ New" — they\'ll be saved to your account.' },
  { icon: '🔄', text: 'Switch between Professional and Casual tone to adjust the style instantly.' },
  { icon: '📋', text: 'Use "Copy to Copilot" to paste directly into Microsoft 365 Copilot Chat.' },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Welcome to AI Recruiter Toolkit
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Your one-stop resource for recruiting emails, AI prompts, and job post templates — find, customize, and send in seconds.
          </p>
        </div>

        {/* How It Works — Flow */}
        <section className="mb-14">
          <h2 className="text-lg font-bold text-text-primary mb-8 text-center">
            📖 How It Works
          </h2>

          {/* Flow container */}
          <div className="relative">
            {/* Connection line (desktop) */}
            <div className="hidden sm:block absolute top-[60px] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-4">
              {STEPS.map((item, i) => (
                <div key={item.step} className="flex flex-col items-center text-center relative">
                  {/* SVG Illustration */}
                  <div className="w-[120px] h-[120px] mb-3 relative z-10">
                    <img src={item.illustration} alt={item.title} className="w-full h-full" />
                  </div>

                  {/* Arrow between steps (mobile) */}
                  {i < STEPS.length - 1 && (
                    <div className="sm:hidden text-primary/50 text-2xl my-2 font-bold">↓</div>
                  )}

                  {/* Step number */}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold mb-2">
                    {item.step}
                  </span>

                  {/* Text */}
                  <h3 className="text-[14px] font-semibold text-text-primary mb-1">{item.title}</h3>
                  <p className="text-[12px] text-text-muted leading-relaxed max-w-[180px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Single CTA */}
          <div className="text-center mt-8">
            <Link href="/templates" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm">
              Get Started →
            </Link>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="text-xl">🗂️</span> Navigate the Site
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card p-5 hover:shadow-md transition group"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition mb-1">{item.title}</h3>
                <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="text-xl">💡</span> Tips & Tricks
          </h2>
          <div className="card p-5 space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-base shrink-0">{tip.icon}</span>
                <p className="text-[12.5px] text-text-secondary leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center pt-4">
          <Link href="/" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
