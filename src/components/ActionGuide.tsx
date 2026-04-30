export default function ActionGuide() {
  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs sm:text-sm text-text-secondary font-medium">
      <span>Click a template</span>
      <span className="text-text-muted">→</span>
      <span className="inline-flex items-center gap-1">🤖 Copilot</span>
      <span className="text-text-muted">·</span>
      <span className="inline-flex items-center gap-1">📋 Copy</span>
      <span className="text-text-muted">·</span>
      <span className="inline-flex items-center gap-1">✉️ Outlook</span>
    </div>
  );
}
