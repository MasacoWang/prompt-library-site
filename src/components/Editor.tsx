'use client';

import type { Template, Tone, EditorMode } from '@/lib/types';
import { extractVariables, getAllCategories } from '@/lib/utils';

interface EditorProps {
  template: Template | null;
  editorMode: EditorMode;
  editDraft: Partial<Template>;
  tone: Tone;
  variables: string[];
  variableValues: Record<string, string>;
  previewText: string;
  isFavorite?: boolean;
  viewCount?: number;
  onBack: () => void;
  onEditMode: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDraftChange: (d: Partial<Template>) => void;
  onToneChange: (t: Tone) => void;
  onVariableChange: (key: string, value: string) => void;
  onCopyToCopilot: () => void;
  onCopyPlain: () => void;
  onOpenOutlook: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
}

export default function Editor({
  template, editorMode, editDraft, tone, variables, variableValues, previewText,
  isFavorite, viewCount,
  onBack, onEditMode, onSaveEdit, onCancelEdit, onDraftChange, onToneChange,
  onVariableChange, onCopyToCopilot, onCopyPlain, onOpenOutlook, onDelete,
  onToggleFavorite,
}: EditorProps) {
  const isEditing = editorMode === 'edit';
  const displayTitle = isEditing ? (editDraft.title || 'Untitled') : (template?.title || '');
  const displayCategory = isEditing ? (editDraft.category || 'Strategy') : (template?.category || '');
  const displayKind = isEditing ? (editDraft.kind || 'prompt') : (template?.kind || 'prompt');
  const editPreviewText = isEditing ? (editDraft.body || '') : previewText;
  const hasCasual = isEditing ? !!editDraft.casualBody : !!template?.casualBody;

  // Highlight [Variables] in preview as teal token pills
  const renderPreview = (text: string) => {
    if (!text) return <span className="text-text-muted italic">Start typing to see preview...</span>;
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (/^\[[^\]]+\]$/.test(part)) {
        return (
          <span key={i} className="inline-flex items-center mx-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary border border-primary-100">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const inputClass = 'input-field';
  const labelClass = 'block text-xs font-medium text-text-secondary mb-1.5';

  return (
    <div className="h-full flex flex-col editor-panel overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-border shrink-0">
        <button onClick={onBack} className="btn-ghost px-3 py-1.5 text-sm">
          ← Back
        </button>

        {!isEditing && template ? (
          <>
            <h2 className="font-semibold text-text-primary text-sm flex-1 truncate">{template.title}</h2>
            {/* Tone Toggle */}
            <div className="flex border border-border rounded-full p-0.5">
              <button
                onClick={() => onToneChange('professional')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  tone === 'professional'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Professional
              </button>
              <button
                onClick={() => onToneChange('casual')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  tone === 'casual'
                    ? 'bg-primary text-white shadow-sm'
                    : hasCasual ? 'text-text-secondary hover:text-text-primary' : 'text-text-muted cursor-not-allowed'
                }`}
                disabled={!hasCasual}
                title={hasCasual ? 'Switch to casual tone' : 'No casual version'}
              >
                Casual
              </button>
            </div>
            {onToggleFavorite && (
              <button onClick={onToggleFavorite} className={`btn-ghost p-1.5 text-sm ${isFavorite ? 'text-red-500' : ''}`} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
            {(viewCount ?? 0) > 0 && (
              <span className="text-xs text-text-muted flex items-center gap-1 px-2">👁 {viewCount}</span>
            )}
            <button onClick={onEditMode} className="btn-ghost px-3 py-1.5 text-sm">
              ✏️ Edit
            </button>
            <button onClick={onDelete} className="btn-ghost p-1.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
              🗑️
            </button>
          </>
        ) : (
          <>
            <h2 className="font-semibold text-text-primary text-sm flex-1">
              {editDraft.id ? 'Edit Template' : 'New Template'}
            </h2>
            <button onClick={onSaveEdit} className="btn-primary px-4 py-1.5 text-sm">
              💾 Save
            </button>
            <button onClick={onCancelEdit} className="btn-ghost px-3 py-1.5 text-sm">
              Cancel
            </button>
          </>
        )}
      </div>

      {/* ── Split Panes ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-auto md:overflow-hidden">
        {/* Left Pane — Form */}
        <div className="w-full md:w-1/2 md:border-r border-border md:overflow-auto p-4 sm:p-6">
          {isEditing ? (
            <div className="space-y-5 max-w-[560px]">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  value={editDraft.title || ''}
                  onChange={(e) => onDraftChange({ ...editDraft, title: e.target.value })}
                  placeholder="Template title..."
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={editDraft.category || 'Strategy'}
                    onChange={(e) => onDraftChange({ ...editDraft, category: e.target.value })}
                    className={inputClass}
                  >
                    {getAllCategories().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={editDraft.kind || 'prompt'}
                    onChange={(e) => onDraftChange({ ...editDraft, kind: e.target.value as 'prompt' | 'template' | 'copywriting' })}
                    className={inputClass}
                  >
                    <option value="prompt">💡 Prompt</option>
                    <option value="template">✉️ Email Template</option>
                    <option value="copywriting">📝 Recruiting 文案</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Body (Professional)</label>
                <textarea
                  value={editDraft.body || ''}
                  onChange={(e) => onDraftChange({ ...editDraft, body: e.target.value })}
                  placeholder="Write your template... Use [Variable Name] for dynamic fields."
                  rows={14}
                  className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
                />
                <p className="text-[11px] text-text-muted mt-1.5">Use [Variable Name] — inputs auto-generate</p>
              </div>
              <div>
                <label className={labelClass}>Body (Casual) — optional</label>
                <textarea
                  value={editDraft.casualBody || ''}
                  onChange={(e) => onDraftChange({ ...editDraft, casualBody: e.target.value })}
                  placeholder="Optional casual version..."
                  rows={8}
                  className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-[560px]">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="token-pill">{template?.category}</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    template?.kind === 'prompt'
                      ? 'bg-purple-50 text-purple-600 border border-purple-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}
                >
                  {template?.kind === 'prompt' ? '💡 Prompt' : '✉️ Email Template'}
                </span>
                {tone === 'casual' && hasCasual && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">
                    😊 Casual
                  </span>
                )}
              </div>

              {/* Variable inputs */}
              {variables.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Fill in Variables</h3>
                  {variables.map((v) => (
                    <div key={v}>
                      <label className="block text-xs font-medium text-primary mb-1">{v}</label>
                      <input
                        value={variableValues[v] || ''}
                        onChange={(e) => onVariableChange(v, e.target.value)}
                        placeholder={`Enter ${v}...`}
                        className="input-field focus:border-primary focus:ring-primary/10"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted py-4">No variables — preview is ready!</p>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                <button onClick={onCopyToCopilot} className="btn-primary px-4 py-2 text-sm">
                  🤖 Copy to Copilot
                </button>
                <button onClick={onCopyPlain} className="btn-secondary px-4 py-2 text-sm">
                  📋 Copy
                </button>
                <button onClick={onOpenOutlook} className="btn-secondary px-4 py-2 text-sm">
                  ✉️ Outlook
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane — Live Preview */}
        <div className="w-full md:w-1/2 md:overflow-auto p-4 sm:p-6 bg-surface-alt">
          <div className="bg-white rounded-2xl paper-shadow p-5 sm:p-8 max-w-[620px] mx-auto min-h-[300px] sm:min-h-[400px]">
            <div className="border-b border-border pb-3 mb-5">
              <h3 className="text-lg font-semibold text-text-primary">{displayTitle}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-text-muted">{displayCategory}</span>
                <span className="text-xs text-border">•</span>
                <span className="text-xs text-text-muted">{displayKind === 'prompt' ? '💡 Prompt' : '✉️ Email Template'}</span>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm leading-[1.8] text-text-secondary">
              {renderPreview(editPreviewText)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
