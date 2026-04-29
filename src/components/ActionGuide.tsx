export default function ActionGuide() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 whitespace-nowrap overflow-x-auto text-sm sm:text-base text-text-secondary font-medium">
      <span>Choose a prompt or template</span>
      <span className="text-text-muted">→</span>
      <span className="inline-flex items-center gap-1.5">🤖 Copilot</span>
      <span className="text-text-muted">·</span>
      <span className="inline-flex items-center gap-1.5">📋 Copy</span>
      <span className="text-text-muted">·</span>
      <span className="inline-flex items-center gap-1.5">✉️ Outlook</span>
    </div>
  );
}
