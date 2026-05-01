'use client';

import Link from 'next/link';

const STEPS = [
  { step: 1, title: 'Browse Templates', desc: 'Pick a category — Email Templates, Prompts, or Job Posts — or use filters by recruiting phase and use case to find what you need.', link: '/templates', linkLabel: 'Go to All Templates →' },
  { step: 2, title: 'Select & Preview', desc: 'Click any template card to open it and preview the full content. You can switch between professional and casual tone.', link: '/templates', linkLabel: 'Browse Templates →' },
  { step: 3, title: 'Customize', desc: 'Fill in the placeholder variables, edit the text, or create your own template from scratch. All changes save automatically.', link: '/templates', linkLabel: 'Start Editing →' },
  { step: 4, title: 'Copy & Use', desc: 'Click "Copy" to grab the text, send directly to Outlook, or open in Copilot Chat — your template is ready to send.', link: '/templates', linkLabel: 'Try It Now →' },
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
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
            Welcome to AI Recruiter Toolkit
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
            Your one-stop resource for recruiting emails, AI prompts, and job post templates — find, customize, and send in seconds.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <span className="text-xl">📖</span> How It Works
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((item) => (
              <div key={item.step} className="card p-5 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-primary mb-1">{item.title}</h3>
                    <p className="text-[12px] text-text-muted leading-relaxed mb-2">{item.desc}</p>
                    <Link href={item.link} className="text-[12px] font-medium text-primary hover:underline">
                      {item.linkLabel}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
