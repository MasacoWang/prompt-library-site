import Link from 'next/link';
import ActionGuide from '@/components/ActionGuide';
import HomeTabs from '@/components/HomeTabs';

const HERO_BULLETS= [
  'Cold outreach templates',
  'Interview scheduling',
  'Candidate evaluation prompts',
  'Hiring manager updates',
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

      {/* ── TABBED DISCOVERY ── */}
      <section id="template-library" className="px-4 sm:px-6 pb-12 sm:pb-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Browse the Toolkit</h2>
            <p className="text-sm text-text-secondary">Discover templates and prompts by type, scenario, or recruiting phase</p>
          </div>
          <HomeTabs />
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
