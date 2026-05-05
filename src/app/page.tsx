import Link from 'next/link';
import WorkflowDiagram from '@/components/WorkflowDiagram';

export default function Home() {
  return (
    <div className="min-h-screen bg-mesh">
      {/* ── HERO ── */}
      <section className="pt-10 sm:pt-14 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary tracking-tight leading-tight mb-2 animate-fade-in">
            AI Recruiter Toolkit
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mb-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
            Create ready‑to‑send recruiting content in seconds
          </p>
          <p className="text-base sm:text-lg font-semibold text-text-primary mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Choose → Run → Send
          </p>
          <div className="inline-flex items-center gap-3 sm:gap-5 px-4 py-2 rounded-full bg-white/80 border border-border shadow-sm animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary font-medium">
              🤖 Run in Copilot
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary font-medium">
              📋 Copy
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary font-medium">
              ✉️ Open in Outlook
            </span>
          </div>
        </div>
      </section>

      {/* ── BROWSE THE TOOLKIT (light background) ── */}
      <section className="px-4 sm:px-6 py-10 sm:py-14 bg-[#f5f6fa]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1">Browse the Toolkit</h2>
            <p className="text-sm text-text-secondary">Choose what you need to get started</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Blue - Email Templates */}
            <Link href="/templates?kind=template" className="p-5 text-center rounded-xl border border-[#0078d4]/15 bg-[#0078d4]/[0.03] hover:bg-[#0078d4]/[0.06] hover:border-[#0078d4]/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#0078d4]/[0.07] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✉️</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-[#0078d4] transition-colors mb-1">Email Templates</p>
              <p className="text-xs text-text-muted">Ready‑to‑send recruiting emails</p>
            </Link>

            {/* Green - Prompt Library */}
            <Link href="/templates?kind=prompt" className="p-5 text-center rounded-xl border border-[#107c10]/15 bg-[#107c10]/[0.03] hover:bg-[#107c10]/[0.06] hover:border-[#107c10]/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#107c10]/[0.07] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💡</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-[#107c10] transition-colors mb-1">Prompt Library</p>
              <p className="text-xs text-text-muted">Generate recruiter insights instantly</p>
            </Link>

            {/* Yellow - Create a Job Post */}
            <Link href="/templates?scenario=job-post" className="p-5 text-center rounded-xl border border-[#ffb900]/15 bg-[#ffb900]/[0.03] hover:bg-[#ffb900]/[0.06] hover:border-[#ffb900]/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#ffb900]/[0.07] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📝</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-[#d83b01] transition-colors mb-1">Create a Job Post</p>
              <p className="text-xs text-text-muted">Create high‑impact job posts</p>
            </Link>

            {/* Red - AI Assistant */}
            <Link href="/ai-assistant" className="p-5 text-center rounded-xl border border-[#d83b01]/15 bg-[#d83b01]/[0.03] hover:bg-[#d83b01]/[0.06] hover:border-[#d83b01]/30 hover:shadow-sm transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#d83b01]/[0.07] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🤖</span>
              </div>
              <p className="text-sm font-semibold text-text-primary group-hover:text-[#d83b01] transition-colors mb-1">AI Assistant</p>
              <p className="text-xs text-text-muted">Generate emails, job posts & summaries with AI</p>
            </Link>
          </div>

          {/* Filter guide */}
          <div className="mt-6 p-4 rounded-xl bg-white border border-border text-center">
            <p className="text-xs text-text-secondary">
              💡 <span className="font-medium text-text-primary">Tip:</span> Use filters to narrow by <span className="font-medium">Recruiting Phase</span> or <span className="font-medium">Use Case</span> on the templates page.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <WorkflowDiagram />
      </section>
    </div>
  );
}
