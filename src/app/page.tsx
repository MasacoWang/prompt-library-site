import ActionGuide from '@/components/ActionGuide';
import HomeTabs from '@/components/HomeTabs';

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh">
      {/* ── HERO ── */}
      <section className="hero pt-12 sm:pt-20 pb-10 sm:pb-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary text-xs font-medium mb-6 animate-fade-in">
            ⚡ Ready-to-Use Recruiting Templates & AI Prompts
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-[1.15] mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            AI Recruiter Toolkit
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto mb-6 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
            One-click templates for sourcing, outreach, interviews, and offers.<br className="hidden sm:block" />
            No login needed. Pick a template → send it.
          </p>

          {/* How it works - 3 steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm text-text-secondary">Pick a template</span>
            </div>
            <span className="hidden sm:block text-text-muted">→</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm text-text-secondary">Customize [variables]</span>
            </div>
            <span className="hidden sm:block text-text-muted">→</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-sm text-text-secondary">Send via Copilot / Outlook / Copy</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABBED DISCOVERY ── */}
      <section id="template-library" className="px-4 sm:px-6 pb-12 sm:pb-16 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">Browse the Toolkit</h2>
            <p className="text-sm text-text-secondary mb-4">Click any category below to explore all templates, prompts, and job posts</p>
            <ActionGuide />
          </div>
          <HomeTabs />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary text-center mb-8">What You Can Do</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">✉️</div>
              <p className="text-xs font-semibold text-text-primary mb-1">Email Templates</p>
              <p className="text-[11px] text-text-muted">Ready-to-send emails for every recruiting stage</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">💡</div>
              <p className="text-xs font-semibold text-text-primary mb-1">AI Prompts</p>
              <p className="text-[11px] text-text-muted">Copy to Copilot for instant AI-powered drafts</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-xs font-semibold text-text-primary mb-1">Job Post Templates</p>
              <p className="text-[11px] text-text-muted">LinkedIn-ready posts to attract candidates</p>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-xs font-semibold text-text-primary mb-1">AI Assistant</p>
              <p className="text-[11px] text-text-muted">Generate custom emails, posts & summaries</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
