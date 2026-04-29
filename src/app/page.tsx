import Link from 'next/link';
import ActionGuide from '@/components/ActionGuide';

const HERO_BULLETS= [
  'Cold outreach templates',
  'Interview scheduling',
  'Candidate evaluation prompts',
  'Hiring manager updates',
];

const USE_CASES = [
  { icon: '📨', title: 'Candidate Outreach', desc: 'Personalized cold outreach and follow-ups', href: '/templates' },
  { icon: '🎯', title: 'Interview Preparation', desc: 'Scheduling, prep notes, and question banks', href: '/prompts' },
  { icon: '📊', title: 'Candidate Evaluation', desc: 'Summaries, JD matching, and fit scoring', href: '/prompts' },
  { icon: '📋', title: 'Hiring Manager Updates', desc: 'Status reports and pipeline summaries', href: '/prompts' },
];

const TRUST_ITEMS = [
  { icon: '⚡', text: 'Save time with consistent, ready-to-use messaging' },
  { icon: '🔄', text: 'Reduce manual prep work across every hiring stage' },
  { icon: '📈', text: 'Improve recruiter workflow quality and candidate experience' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh">
      {/* ── HERO ── */}
      <section className="hero pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary text-xs font-medium mb-6 animate-fade-in">
            Practical Recruiting Templates &amp; Prompts
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-[1.15] mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            AI Recruiter Toolkit
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Simple tools to speed up sourcing, outreach, and hiring workflows.
          </p>

          {/* Bullets */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {HERO_BULLETS.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-medium text-text-secondary shadow-sm">
                <span className="text-primary">✓</span> {b}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <a href="#template-library" className="btn-primary px-8 py-3 text-sm inline-flex items-center gap-2">
              Browse Templates &amp; Prompts ↓
            </a>
          </div>

          {/* Usage guide strip */}
          <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <ActionGuide />
          </div>
        </div>
      </section>

      {/* ── LIBRARY SECTION ── */}
      <section id="template-library" className="px-4 sm:px-6 pb-12 sm:pb-16 scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Template Library</h2>
            <p className="text-sm text-text-secondary">Ready-to-use content for every recruiting stage</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Email Templates Card */}
            <div className="card p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg mb-4">✉️</div>
              <h3 className="text-base font-semibold text-text-primary mb-1.5">Email Templates</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1">
                Ready-to-send candidate communication templates — outreach, scheduling, offers, rejections, and more.
              </p>
              <Link href="/templates" className="btn-secondary px-4 py-2 text-sm text-center inline-flex items-center gap-1.5 self-start">
                Explore Email Templates →
              </Link>
            </div>

            {/* Prompt Library Card */}
            <div className="card p-6 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg mb-4">💡</div>
              <h3 className="text-base font-semibold text-text-primary mb-1.5">Prompt Library</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5 flex-1">
                AI prompts for sourcing, screening, interview prep, and hiring manager updates — copy, customize, and go.
              </p>
              <Link href="/prompts" className="btn-secondary px-4 py-2 text-sm text-center inline-flex items-center gap-1.5 self-start">
                Browse Prompts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR USE CASES ── */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary text-center mb-8">Popular Use Cases</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {USE_CASES.map((uc) => (
              <Link key={uc.title} href={uc.href} className="card p-5 text-center group">
                <div className="text-2xl mb-3">{uc.icon}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-1 group-hover:text-primary transition">{uc.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{uc.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / WHY ── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary text-center mb-8">Why Recruiters Use This</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.text} className="card p-5 text-center">
                <div className="text-2xl mb-3">{item.icon}</div>
                <p className="text-sm text-text-secondary leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
