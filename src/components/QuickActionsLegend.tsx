export default function QuickActionsLegend() {
  return (
    <div className="flex flex-col items-start gap-1.5 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-surface-alt border border-border text-left">
      <span className="text-xs font-semibold text-text-primary tracking-tight">Quick Actions</span>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-5 sm:gap-y-1 text-xs text-text-secondary">
        <span>🤖 <strong>Run in Copilot</strong> — generate recruiter insights</span>
        <span>📋 <strong>Copy Text</strong> — reuse prompts or templates</span>
        <span>✉️ <strong>Open in Outlook</strong> — create a ready-to-send email</span>
      </div>
      <p className="text-[11px] text-text-muted">Tip: Look for these icons on each item to run, copy, or send instantly.</p>
    </div>
  );
}
