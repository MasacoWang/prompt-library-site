'use client';

const STEPS = [
  { icon: '🔍', color: '#0078d4', label: 'Filter', desc: 'Narrow by Recruiting Phase or Use Case' },
  { icon: '📋', color: '#107c10', label: 'Find', desc: 'Pick a template or search by keyword' },
  { icon: '✏️', color: '#b87a00', label: 'Fill', desc: 'Fill in variables — preview before sending' },
  { icon: '🚀', color: '#d83b01', label: 'Send', desc: 'One click to Outlook, Copilot, or clipboard' },
];

const FEATURES = [
  { icon: '✉️', title: 'One-Click Outlook', desc: 'Subject auto-extracted, body ready to send' },
  { icon: '🤖', title: 'Copy to Copilot', desc: 'Run prompts in AI instantly — just paste' },
  { icon: '➕', title: 'Add Your Own', desc: 'Create custom prompts and templates anytime' },
  { icon: '🧠', title: 'AI Assistant', desc: 'Generate custom content when no template fits' },
];

export default function WorkflowDiagram() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-base sm:text-xl font-bold text-text-primary mb-1">How It Works</h2>
        <p className="text-xs sm:text-sm text-text-secondary">From search to send in seconds</p>
      </div>

      {/* Step-by-Step Flow — horizontal on mobile with compact cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {STEPS.map((step, i) => (
          <div key={step.label} className="relative group">
            <div
              className="bg-white rounded-xl border p-3 sm:p-5 text-center hover:shadow-md transition-all h-full"
              style={{ borderColor: `${step.color}30` }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3"
                style={{ backgroundColor: `${step.color}15` }}
              >
                <span className="text-sm sm:text-lg">{step.icon}</span>
              </div>
              <div
                className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold mb-1 sm:mb-2"
                style={{ backgroundColor: `${step.color}15`, color: step.color }}
              >
                STEP {i + 1}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-text-primary mb-0.5 sm:mb-1.5">{step.label}</h3>
              <p className="text-[10px] sm:text-[11px] text-text-muted leading-relaxed hidden sm:block">
                {step.desc}
              </p>
            </div>
            {/* Arrow between steps (desktop only) */}
            {i < 3 && (
              <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 text-text-muted/40 text-lg z-10">→</div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile: one-line description below steps */}
      <p className="text-[11px] text-text-muted text-center mb-5 sm:hidden">
        Filter by phase → Find a template → Fill variables → Send via Outlook or Copilot
      </p>

      {/* Feature Highlights — 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl bg-white/70 border border-border">
            <span className="text-base sm:text-lg mt-0.5 shrink-0">{f.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-text-primary mb-0.5 truncate">{f.title}</p>
              <p className="text-[9px] sm:text-[11px] text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
