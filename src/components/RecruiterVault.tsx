'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Template, ViewMode, Tone, EditorMode } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import {
  loadTemplates, saveTemplates, exportTemplates,
  extractVariables, substituteVariables, copyToCopilot, copyToClipboard,
  openInOutlook, generateId,
} from '@/lib/utils';
import Dashboard from './Dashboard';
import Editor from './Editor';

const COPILOT_URL = 'https://m365.cloud.microsoft/chat';

export default function RecruiterVault() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('use');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [tone, setTone] = useState<Tone>('professional');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Template>>({});
  const [mounted, setMounted] = useState(false);

  const openCopilot= () => window.open(COPILOT_URL, '_blank');

  useEffect(() => {
    setTemplates(loadTemplates(STARTER_TEMPLATES));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && templates.length > 0) saveTemplates(templates);
  }, [templates, mounted]);

  const selectedTemplate = templates.find((t) => t.id === selectedId) || null;
  const activeBody = selectedTemplate
    ? tone === 'casual' && selectedTemplate.casualBody
      ? selectedTemplate.casualBody
      : selectedTemplate.body
    : editDraft.body || '';
  const variables = extractVariables(activeBody);
  const previewText = substituteVariables(activeBody, variableValues);

  useEffect(() => {
    if (selectedId) {
      const vars = extractVariables(activeBody);
      setVariableValues((prev) => {
        const next: Record<string, string> = {};
        vars.forEach((v) => { next[v] = prev[v] || ''; });
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tone]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editDraft.title || !editDraft.body) {
      showToast('Title and body are required');
      return;
    }
    if (editDraft.id) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editDraft.id ? { ...t, ...editDraft, updatedAt: new Date().toISOString() } as Template : t
        )
      );
      setSelectedId(editDraft.id);
    } else {
      const now = new Date().toISOString();
      const newId = generateId();
      const newT: Template = {
        id: newId, title: editDraft.title!, category: editDraft.category || 'Strategy',
        kind: (editDraft.kind as 'prompt' | 'template') || 'prompt',
        body: editDraft.body!, casualBody: editDraft.casualBody || '',
        pinned: false, createdAt: now, updatedAt: now,
      };
      setTemplates((prev) => [...prev, newT]);
      setSelectedId(newId);
    }
    setEditorMode('use');
    showToast('Saved to Vault ✓');
  }, [editDraft, showToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (view === 'editor' && editorMode === 'edit') handleSaveEdit();
        else showToast('Saved ✓');
      }
      if (e.key === 'Escape' && view !== 'dashboard') {
        setView('dashboard'); setSelectedId(null); setEditorMode('use');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, editorMode, handleSaveEdit, showToast]);

  const handleSelect = (id: string) => {
    setSelectedId(id); setEditorMode('use'); setView('editor'); setVariableValues({});
  };
  const handleCreateNew = () => {
    setSelectedId(null); setEditorMode('edit');
    setEditDraft({ title: '', category: 'Strategy', kind: 'prompt', body: '', casualBody: '' });
    setView('editor');
  };
  const handleEditTemplate = (id?: string) => {
    const tpl = id ? templates.find((t) => t.id === id) : selectedTemplate;
    if (tpl) { setSelectedId(tpl.id); setEditDraft({ ...tpl }); setEditorMode('edit'); setView('editor'); }
  };
  const handleDelete = (id: string) => {
    if (!confirm('Delete this template?')) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedId === id) { setSelectedId(null); setView('dashboard'); }
    showToast('Deleted');
  };
  const handleTogglePin = (id: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  };

  const filteredTemplates= templates.filter((t) => {
    const q = search.toLowerCase();
    const matchS = !q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    return matchS && (categoryFilter === 'All' || t.category === categoryFilter);
  });
  const pinnedTemplates = templates.filter((t) => t.pinned);

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col relative z-10 text-white font-sans">
      {/* ── HEADER ── */}
      <header className="glass shrink-0 px-6 py-3">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-cyan-400 flex items-center justify-center text-base shadow-lg shadow-teal-glow">
              🔐
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Recruiter Vault</h1>
          </div>
          <div id="quick-access-pins" className="flex items-center gap-2 overflow-x-auto">
            {pinnedTemplates.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className="shrink-0 px-3 py-1 glass rounded-full text-xs text-teal font-medium hover:bg-white/15 transition truncate max-w-[150px]"
                title={t.title}
              >
                📌 {t.title}
              </button>
            ))}
          </div>
          <button
            onClick={openCopilot}
            className="shrink-0 px-4 py-1.5 glass rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/15 transition"
          >
            🤖 Open Copilot ↗
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-hidden p-4">
        <section id="editor-zone" className="h-full">
          {view === 'dashboard' ? (
            <Dashboard
              templates={filteredTemplates}
              search={search}
              onSearchChange={setSearch}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onSelect={handleSelect}
              onCreate={handleCreateNew}
              onEdit={handleEditTemplate}
              onDelete={handleDelete}
              onTogglePin={handleTogglePin}
              onExport={() => exportTemplates(templates)}
            />
          ) : (
            <div className="animate-slide-in h-full">
              <Editor
                template={selectedTemplate}
                editorMode={editorMode}
                editDraft={editDraft}
                tone={tone}
                variables={variables}
                variableValues={variableValues}
                previewText={previewText}
                onBack={() => { setView('dashboard'); setSelectedId(null); setEditorMode('use'); }}
                onEditMode={() => handleEditTemplate()}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => { if (selectedTemplate) setEditorMode('use'); else { setView('dashboard'); setSelectedId(null); } }}
                onDraftChange={setEditDraft}
                onToneChange={setTone}
                onVariableChange={(k, v) => setVariableValues((p) => ({ ...p, [k]: v }))}
                onCopyToCopilot={async () => { await copyToCopilot(previewText); showToast('Copied & opened Copilot ✓'); }}
                onCopyPlain={async () => { await copyToClipboard(previewText); showToast('Copied ✓'); }}
                onOpenOutlook={() => { if (selectedTemplate) openInOutlook(selectedTemplate.title, previewText); }}
                onDelete={() => { if (selectedTemplate) handleDelete(selectedTemplate.id); }}
                onTogglePin={() => { if (selectedTemplate) handleTogglePin(selectedTemplate.id); }}
              />
            </div>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="glass shrink-0 px-6 py-2.5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={async () => { await copyToCopilot(previewText); showToast('Copied & opened Copilot ✓'); }}
              disabled={!selectedTemplate}
              className="btn-teal px-5 py-2 rounded-full text-sm"
            >
              🤖 Copy to Copilot
            </button>
            <button
              onClick={() => { if (selectedTemplate) openInOutlook(selectedTemplate.title, previewText); }}
              disabled={!selectedTemplate}
              className="px-4 py-2 glass rounded-full text-sm text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              ✉️ Outlook
            </button>
            <button
              onClick={async () => { await copyToClipboard(previewText); showToast('Copied ✓'); }}
              disabled={!selectedTemplate}
              className="px-4 py-2 glass rounded-full text-sm text-white/80 hover:text-white hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              📋 Copy
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>Ctrl+S Save · Esc Close</span>
            <span>{templates.length} templates</span>
          </div>
        </div>
      </footer>



      {toast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 glass-strong text-deep-ink px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
