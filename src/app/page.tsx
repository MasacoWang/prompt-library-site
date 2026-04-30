import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh">
      {/* ── HERO ── */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight mb-3 animate-fade-in">
            Create ready‑to‑send recruiting content in seconds
          </h1>
          <p className="text-base sm:text-lg font-medium text-text-secondary mb-2 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            Choose → Run → Send
          </p>
          <p className="text-sm text-text-muted animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Run in Copilot · Copy · Open in Outlook
          </p>
        </div>
      </section>

      {/* ── BROWSE THE TOOLKIT ── */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1">Browse the Toolkit</h2>
            <p className="text-sm text-text-secondary">Choose what you need to get started</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/templates?kind=template" className="card p-5 text-center hover:border-primary/40 hover:shadow-md transition-all group">
              <div className="text-3xl mb-2">✉️</div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">Email Templates</p>
              <p className="text-xs text-text-muted">Ready‑to‑send recruiting emails</p>
            </Link>
            <Link href="/templates?kind=prompt" className="card p-5 text-center hover:border-primary/40 hover:shadow-md transition-all group">
              <div className="text-3xl mb-2">💡</div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">Prompt Library</p>
              <p className="text-xs text-text-muted">Generate recruiter insights instantly</p>
            </Link>
            <Link href="/templates?kind=copywriting" className="card p-5 text-center hover:border-primary/40 hover:shadow-md transition-all group">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">Job Post Templates</p>
              <p className="text-xs text-text-muted">Create high‑impact job posts</p>
            </Link>
            <Link href="/templates" className="card p-5 text-center hover:border-primary/40 hover:shadow-md transition-all group">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">Recruiting Phases</p>
              <p className="text-xs text-text-muted">Find the right content for each stage of hiring</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
