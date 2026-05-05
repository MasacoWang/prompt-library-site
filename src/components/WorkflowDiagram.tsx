'use client';

export default function WorkflowDiagram() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-1">How It Works</h2>
        <p className="text-sm text-text-secondary">From search to send in seconds — no more copy-paste juggling</p>
      </div>

      {/* Step-by-Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Step 1: Filter */}
        <div className="relative group">
          <div className="bg-white rounded-xl border border-[#0078d4]/20 p-5 text-center hover:shadow-md hover:border-[#0078d4]/40 transition-all h-full">
            <div className="w-10 h-10 rounded-full bg-[#0078d4]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🔍</span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#0078d4]/10 text-[#0078d4] text-[10px] font-bold mb-2">STEP 1</div>
            <h3 className="text-sm font-bold text-text-primary mb-1.5">Filter</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Narrow by <span className="font-medium text-text-secondary">Recruiting Phase</span> (Sourcing, Interview…) or <span className="font-medium text-text-secondary">Use Case</span> (Outreach, Job Post…)
            </p>
          </div>
          {/* Arrow (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-[#0078d4]/40 text-lg z-10">→</div>
        </div>

        {/* Step 2: Find */}
        <div className="relative group">
          <div className="bg-white rounded-xl border border-[#107c10]/20 p-5 text-center hover:shadow-md hover:border-[#107c10]/40 transition-all h-full">
            <div className="w-10 h-10 rounded-full bg-[#107c10]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">📋</span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#107c10]/10 text-[#107c10] text-[10px] font-bold mb-2">STEP 2</div>
            <h3 className="text-sm font-bold text-text-primary mb-1.5">Find</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Pick from curated templates — or <span className="font-medium text-text-secondary">search by keyword</span> to find exactly what you need
            </p>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-[#107c10]/40 text-lg z-10">→</div>
        </div>

        {/* Step 3: Fill */}
        <div className="relative group">
          <div className="bg-white rounded-xl border border-[#ffb900]/20 p-5 text-center hover:shadow-md hover:border-[#ffb900]/40 transition-all h-full">
            <div className="w-10 h-10 rounded-full bg-[#ffb900]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">✏️</span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#ffb900]/10 text-[#b87a00] text-[10px] font-bold mb-2">STEP 3</div>
            <h3 className="text-sm font-bold text-text-primary mb-1.5">Fill</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Fill in variables like <span className="font-medium text-text-secondary">Candidate Name</span> and <span className="font-medium text-text-secondary">Role</span> — preview before sending
            </p>
          </div>
          <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-[#ffb900]/60 text-lg z-10">→</div>
        </div>

        {/* Step 4: Send */}
        <div className="group">
          <div className="bg-white rounded-xl border border-[#d83b01]/20 p-5 text-center hover:shadow-md hover:border-[#d83b01]/40 transition-all h-full">
            <div className="w-10 h-10 rounded-full bg-[#d83b01]/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg">🚀</span>
            </div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-[#d83b01]/10 text-[#d83b01] text-[10px] font-bold mb-2">STEP 4</div>
            <h3 className="text-sm font-bold text-text-primary mb-1.5">Send</h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              One click to <span className="font-medium text-text-secondary">Outlook</span>, <span className="font-medium text-text-secondary">Copilot</span>, or <span className="font-medium text-text-secondary">clipboard</span> — subject auto-filled
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-border">
          <span className="text-lg mt-0.5">✉️</span>
          <div>
            <p className="text-xs font-semibold text-text-primary mb-0.5">One-Click Outlook</p>
            <p className="text-[11px] text-text-muted leading-relaxed">Subject auto-extracted, body ready to send</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-border">
          <span className="text-lg mt-0.5">🤖</span>
          <div>
            <p className="text-xs font-semibold text-text-primary mb-0.5">Copy to Copilot</p>
            <p className="text-[11px] text-text-muted leading-relaxed">Run prompts in AI instantly — just paste</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-border">
          <span className="text-lg mt-0.5">➕</span>
          <div>
            <p className="text-xs font-semibold text-text-primary mb-0.5">Add Your Own</p>
            <p className="text-[11px] text-text-muted leading-relaxed">Create custom prompts and templates anytime</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-border">
          <span className="text-lg mt-0.5">🧠</span>
          <div>
            <p className="text-xs font-semibold text-text-primary mb-0.5">AI Assistant</p>
            <p className="text-[11px] text-text-muted leading-relaxed">Generate custom content when no template fits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
