import ActionGuide from '@/components/ActionGuide';
import HomeTabs from '@/components/HomeTabs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh">
      {/* ── HERO (compact) ── */}
      <section className="pt-6 sm:pt-8 pb-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight mb-1 animate-fade-in">
            AI Recruiter Toolkit
          </h1>
          <p className="text-xs text-text-secondary max-w-md mx-auto mb-3 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            One-click templates for sourcing, outreach, interviews & offers. No login needed.
          </p>
          <ActionGuide />
        </div>
      </section>

      {/* ── WHAT YOU CAN DO (moved up) ── */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Link href="/templates" className="card p-3 text-center hover:border-primary/40 transition-colors group">
              <div className="text-xl mb-1">✉️</div>
              <p className="text-[11px] font-semibold text-text-primary group-hover:text-primary transition-colors">Email Templates</p>
              <p className="text-[10px] text-text-muted">Every recruiting stage</p>
            </Link>
            <Link href="/prompts" className="card p-3 text-center hover:border-primary/40 transition-colors group">
              <div className="text-xl mb-1">💡</div>
              <p className="text-[11px] font-semibold text-text-primary group-hover:text-primary transition-colors">AI Prompts</p>
              <p className="text-[10px] text-text-muted">Copilot-ready drafts</p>
            </Link>
            <Link href="/copywriting" className="card p-3 text-center hover:border-primary/40 transition-colors group">
              <div className="text-xl mb-1">📝</div>
              <p className="text-[11px] font-semibold text-text-primary group-hover:text-primary transition-colors">Job Post Templates</p>
              <p className="text-[10px] text-text-muted">LinkedIn-ready posts</p>
            </Link>
            <Link href="/ai-assistant" className="card p-3 text-center hover:border-primary/40 transition-colors group">
              <div className="text-xl mb-1">🤖</div>
              <p className="text-[11px] font-semibold text-text-primary group-hover:text-primary transition-colors">AI Assistant</p>
              <p className="text-[10px] text-text-muted">Generate & customize</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ── BROWSE TOOLKIT ── */}
      <section id="template-library" className="px-4 sm:px-6 pb-10 sm:pb-14 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-sm sm:text-base font-bold text-text-primary mb-0.5">Browse the Toolkit</h2>
            <p className="text-[11px] text-text-secondary">Click a category to explore all templates, prompts, and job posts</p>
          </div>
          <HomeTabs />
        </div>
      </section>
    </div>
  );
}
