'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Template, Tone, EditorMode } from '@/lib/types';
import { SCENARIOS, PHASES } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { useSharedTemplates } from '@/lib/useSharedTemplates';
import {
  loadTemplates, saveTemplates, exportTemplates,
  extractVariables, substituteVariables, copyToCopilot, copyToClipboard,
  openInOutlook, generateId,
  loadFavorites, toggleFavorite, loadViewCounts, incrementViewCount,
  getAllCategories, saveCustomCategory, deleteCustomCategory, isCustomCategory,
  loadSharedFavCounts,
} from '@/lib/utils';
import { useFavoritesSync } from '@/lib/useFavoritesSync';
import Editor from '@/components/Editor';
import Swal from 'sweetalert2';

// ─── Filter Options ───
const KIND_OPTIONS = [
  { key: 'all', label: 'All', icon: '📁' },
  { key: 'template', label: 'Email Templates', icon: '✉️' },
  { key: 'prompt', label: 'Prompt Library', icon: '💡' },
] as const;

const USECASE_OPTIONS = [
  { key: 'all', label: 'All' },
  ...SCENARIOS.map((s) => ({ key: s.key, label: s.label })),
] as const;

const PHASE_OPTIONS = [
  { key: 'all', label: 'All' },
  ...PHASES.map((p) => ({ key: p.key, label: `${p.icon} ${p.label}` })),
] as const;

export default function TemplatesHub() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = !!(session?.user as any)?.isAdmin;
  const { sharedTemplates, addSharedTemplate, deleteSharedTemplate, fetchShared } = useSharedTemplates();

  // ─── State ───
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [usecaseFilter, setUsecaseFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('use');
  const [tone, setTone] = useState<Tone>('professional');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [editDraft, setEditDraft] = useState<Partial<Template>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [sharedFavCounts, setSharedFavCounts] = useState<Record<string, number>>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>([]);

  const starterIds = new Set(STARTER_TEMPLATES.map((t) => t.id));
  const sharedIds = useMemo(() => new Set(sharedTemplates.map((t) => t.id)), [sharedTemplates]);

  useFavoritesSync(favorites, setFavorites, {
    templates,
    starterTemplateIds: starterIds,
    setTemplates,
    deletedTemplateIds,
    setDeletedTemplateIds,
  });

  // ─── Init from URL params ───
  useEffect(() => {
    const allStarters = [...STARTER_TEMPLATES, ...sharedTemplates.filter(st => !starterIds.has(st.id))];
    setTemplates(loadTemplates(allStarters));
    setFavorites(loadFavorites());
    setViewCounts(loadViewCounts());
    setSharedFavCounts(loadSharedFavCounts());
    setMounted(true);

    // Read URL params for pre-filtering
    const kind = searchParams.get('kind');
    const scenario = searchParams.get('scenario');
    const phase = searchParams.get('phase');
    if (kind && ['template', 'prompt'].includes(kind)) setKindFilter(kind);
    if (scenario) setUsecaseFilter(scenario);
    if (phase) setPhaseFilter(phase);
  }, [searchParams, sharedTemplates]);

  // ─── Persist templates ───
  useEffect(() => {
    if (mounted && templates.length > 0) saveTemplates(templates);
  }, [templates, mounted]);

  // ─── Computed ───
  const selectedTemplate = templates.find((t) => t.id === selectedId) || null;
  const activeBody = selectedTemplate
    ? tone === 'casual' && selectedTemplate.casualBody ? selectedTemplate.casualBody : selectedTemplate.body
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

  // ─── Handlers ───
  const showToastMsg = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleFavoriteToggle = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => toggleFavorite(prev, id));
    setTimeout(() => setSharedFavCounts(loadSharedFavCounts()), 500);
  }, []);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedId(id);
    setEditorMode('use');
    setVariableValues({});
    setPanelOpen(true);
    const updated = incrementViewCount(id);
    setViewCounts(updated);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editDraft.title || !editDraft.body) { showToastMsg('Title and body required'); return; }
    if (editDraft.id && editDraft.id !== '__new__') {
      setTemplates((prev) => prev.map((t) => t.id === editDraft.id ? { ...t, ...editDraft, updatedAt: new Date().toISOString() } as Template : t));
      setSelectedId(editDraft.id);
    } else {
      // New template — if admin, save to KV (shared); otherwise localStorage (personal)
      if (isAdmin) {
        const kinds = editDraft.kinds || [editDraft.kind || 'prompt'];
        const result = await addSharedTemplate({
          title: editDraft.title!,
          category: editDraft.category || 'Strategy',
          kind: (kinds[0] as 'prompt' | 'template') || 'prompt',
          kinds,
          body: editDraft.body!,
          casualBody: editDraft.casualBody || '',
          pinned: false,
          scenario: editDraft.scenario || [],
          phase: editDraft.phase || [(editDraft.category || 'Strategy').toLowerCase()],
        });
        if (!result.success) {
          showToastMsg(result.error || 'Failed to save');
          return;
        }
        showToastMsg('Saved to shared library ✓');
        setEditorMode('use');
        setPanelOpen(false);
        setSelectedId(null);
        return;
      }
      const now = new Date().toISOString();
      const newId = generateId();
      const newT: Template = {
        id: newId, title: editDraft.title!, category: editDraft.category || 'Strategy',
        kind: (editDraft.kind as 'prompt' | 'template') || 'prompt',
        kinds: editDraft.kinds || [editDraft.kind || 'prompt'],
        body: editDraft.body!, casualBody: editDraft.casualBody || '',
        pinned: false, createdAt: now, updatedAt: now,
        phase: editDraft.phase || [(editDraft.category || 'Strategy').toLowerCase()],
        scenario: editDraft.scenario || [],
      };
      setTemplates((prev) => [...prev, newT]);
      setSelectedId(newId);
    }
    setEditorMode('use');
    showToastMsg('Saved ✓');
  }, [editDraft, showToastMsg, isAdmin, addSharedTemplate]);

  const handleDelete = useCallback(async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSharedTemplate = sharedIds.has(id);
    const result = await Swal.fire({
      title: 'Delete this template?',
      text: isSharedTemplate && isAdmin
        ? "This will remove it for ALL users. This action can't be undone."
        : "This action can't be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      if (isSharedTemplate && isAdmin) {
        const res = await deleteSharedTemplate(id);
        if (!res.success) {
          Swal.fire('Error', res.error || 'Failed to delete', 'error');
          return;
        }
      }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeletedTemplateIds((prev) => [...prev, id]);
      if (selectedId === id) { setSelectedId(null); setPanelOpen(false); }
      Swal.fire('Deleted!', 'Your template has been removed.', 'success');
    }
  }, [selectedId, isAdmin, sharedIds, deleteSharedTemplate]);

  const handleCopilot = useCallback(async (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await copyToCopilot(text);
      showToastMsg('✅ Copied! Paste (Ctrl+V) in Copilot chat to run');
    } catch {
      showToastMsg('Copy failed — please use Copy, then paste in Copilot');
    }
  }, [showToastMsg]);

  const handleCopy = useCallback(async (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await copyToClipboard(text);
    showToastMsg('Copied');
  }, [showToastMsg]);

  const handleOutlook = useCallback((title: string, body: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    openInOutlook(title, body);
  }, []);

  const clearFilters = () => {
    setKindFilter('all');
    setUsecaseFilter('all');
    setPhaseFilter('all');
    setSearch('');
    setShowFavoritesOnly(false);
  };

  const activeFilterCount = [
    kindFilter !== 'all' ? 1 : 0,
    usecaseFilter !== 'all' ? 1 : 0,
    phaseFilter !== 'all' ? 1 : 0,
    showFavoritesOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // ─── Filtering ───
  const filtered = templates.filter((t) => {
    if (kindFilter !== 'all' && t.kind !== kindFilter && !t.kinds?.includes(kindFilter)) return false;
    if (showFavoritesOnly && !favorites.has(t.id)) return false;
    if (usecaseFilter !== 'all' && !t.scenario?.includes(usecaseFilter)) return false;
    if (phaseFilter !== 'all' && !t.phase?.includes(phaseFilter)) return false;
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q) && !t.body.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
    return true;
  });

  // ─── Count badges ───
  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    templates.forEach((t) => { counts[t.kind] = (counts[t.kind] || 0) + 1; });
    return counts;
  }, [templates]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); if (editorMode === 'edit') handleSaveEdit(); }
      if (e.key === 'Escape') {
        if (panelOpen) { setPanelOpen(false); setSelectedId(null); setEditorMode('use'); }
        if (showMobileFilters) setShowMobileFilters(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editorMode, handleSaveEdit, panelOpen, showMobileFilters]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* ── STICKY FILTER BAR ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Row 1: Search + Mobile filter button + New */}
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, content, or category…"
                className="w-full pl-8 pr-8 py-2 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">🔍</span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-text-primary"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile: filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:border-primary/40"
            >
              Filters{activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
            </button>

            <button
              onClick={() => {
                setSelectedId('__new__');
                setEditDraft({ title: '', category: 'Strategy', kind: 'prompt', body: '', casualBody: '' });
                setEditorMode('edit');
                setPanelOpen(true);
              }}
              className="btn-primary px-3 py-2 text-sm whitespace-nowrap"
            >
              + New{isAdmin ? ' (Shared)' : ''}
            </button>
          </div>

          {/* Row 2: Desktop filters */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap mt-2">
            {/* Kind filter */}
            <div className="flex items-center gap-1">
              {KIND_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setKindFilter(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    kindFilter === opt.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:bg-surface-hover border border-transparent hover:border-border'
                  }`}
                >
                  {opt.icon} {opt.label} <span className="ml-0.5 opacity-70">({kindCounts[opt.key] || 0})</span>
                </button>
              ))}
            </div>

            {/* Job Post shortcut */}
            <button
              onClick={() => setUsecaseFilter(usecaseFilter === 'job-post' ? 'all' : 'job-post')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                usecaseFilter === 'job-post'
                  ? 'bg-[#ffb900] text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-hover border border-transparent hover:border-border'
              }`}
            >
              📝 Job Posts
            </button>

            <span className="w-px h-5 bg-border" />
            <select
              value={usecaseFilter}
              onChange={(e) => setUsecaseFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {USECASE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.key === 'all' ? 'Use Case: All' : opt.label}</option>
              ))}
            </select>

            {/* Phase */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {PHASE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.key === 'all' ? 'Recruiting Phase: All' : opt.label}</option>
              ))}
            </select>

            {/* Favorites toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                showFavoritesOnly
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-hover border border-transparent hover:border-border'
              }`}
            >
              ❤️ Favorites
            </button>

            {/* Clear */}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="px-2.5 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-all">
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Card grid */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${panelOpen ? 'hidden md:block md:w-1/2 lg:w-3/5' : 'w-full'}`}>
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-3 opacity-50">📭</p>
              <p className="text-base font-medium text-text-secondary">No matches</p>
              <p className="text-sm text-text-muted mt-1">Try clearing filters or searching a different keyword.</p>
              <button onClick={clearFilters} className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((t, i) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  index={i}
                  isFavorite={favorites.has(t.id)}
                  viewCount={viewCounts[t.id] || 0}
                  favCount={sharedFavCounts[t.id] || 0}
                  isSelected={selectedId === t.id}
                  onSelect={() => handleSelectItem(t.id)}
                  onFavorite={(e) => handleFavoriteToggle(t.id, e)}
                  onCopilot={(e) => handleCopilot(t.body, e)}
                  onCopy={(e) => handleCopy(t.body, e)}
                  onOutlook={(e) => handleOutlook(t.title, t.body, e)}
                  onLinkedIn={async (e) => { e.stopPropagation(); await copyToClipboard(t.body); showToast('Copied! Paste on LinkedIn'); window.open('https://www.linkedin.com/feed/', '_blank'); }}
                  onEdit={(e) => { e.stopPropagation(); setSelectedId(t.id); setEditDraft({ ...t }); setEditorMode('edit'); setPanelOpen(true); }}
                  onDelete={(e) => handleDelete(t.id, e)}
                />
              ))}
            </div>
          )}
          <p className="text-center text-xs text-text-muted mt-6">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Right: Side Panel (Editor) */}
        {panelOpen && (
          <div className="fixed inset-0 z-40 md:relative md:inset-auto md:z-auto md:w-1/2 lg:w-2/5 md:border-l border-border bg-white md:bg-surface-alt overflow-y-auto shadow-xl md:shadow-none">
            <Editor
              template={selectedTemplate}
              editorMode={editorMode}
              editDraft={editDraft}
              tone={tone}
              variables={variables}
              variableValues={variableValues}
              previewText={previewText}
              isFavorite={selectedTemplate ? favorites.has(selectedTemplate.id) : false}
              viewCount={selectedTemplate ? (viewCounts[selectedTemplate.id] || 0) : 0}
              onBack={() => { setPanelOpen(false); setSelectedId(null); setEditorMode('use'); }}
              onEditMode={() => { if (selectedTemplate) { setEditDraft({ ...selectedTemplate }); setEditorMode('edit'); } }}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => { if (selectedTemplate) setEditorMode('use'); else { setPanelOpen(false); setSelectedId(null); } }}
              onDraftChange={setEditDraft}
              onToneChange={setTone}
              onVariableChange={(k, v) => setVariableValues((p) => ({ ...p, [k]: v }))}
              onCopyToCopilot={async () => { await handleCopilot(previewText); }}
              onCopyPlain={async () => { await handleCopy(previewText); }}
              onOpenOutlook={() => { if (selectedTemplate) handleOutlook(selectedTemplate.title, previewText); }}
              onOpenLinkedIn={async () => { await copyToClipboard(previewText); showToast('Copied! Paste on LinkedIn'); window.open('https://www.linkedin.com/feed/', '_blank'); }}
              onToggleFavorite={() => { if (selectedTemplate) handleFavoriteToggle(selectedTemplate.id); }}
              onDelete={async () => { if (selectedTemplate) handleDelete(selectedTemplate.id); }}
            />
          </div>
        )}
      </div>

      {/* ── MOBILE FILTER BOTTOM SHEET ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setShowMobileFilters(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[75vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text-primary">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="btn-ghost p-2 text-lg">✕</button>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {KIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setKindFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        kindFilter === opt.key
                          ? 'bg-primary text-white'
                          : 'bg-surface-alt text-text-secondary border border-border'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Use Case */}
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">Use Case</label>
                <div className="flex flex-wrap gap-2">
                  {USECASE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setUsecaseFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        usecaseFilter === opt.key
                          ? 'bg-primary text-white'
                          : 'bg-surface-alt text-text-secondary border border-border'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phase */}
              <div>
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">Recruiting Phase</label>
                <div className="flex flex-wrap gap-2">
                  {PHASE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setPhaseFilter(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        phaseFilter === opt.key
                          ? 'bg-primary text-white'
                          : 'bg-surface-alt text-text-secondary border border-border'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorites */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                  showFavoritesOnly ? 'bg-red-500 text-white' : 'bg-surface-alt text-text-secondary border border-border'
                }`}
              >
                ❤️ Favorites only
              </button>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold"
                >
                  Apply
                </button>
                <button
                  onClick={() => { clearFilters(); setShowMobileFilters(false); }}
                  className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-[60]">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Template Card Component ───
function TemplateCard({
  template: t, index, isFavorite, viewCount, favCount, isSelected,
  onSelect, onFavorite, onCopilot, onCopy, onOutlook, onLinkedIn, onEdit, onDelete,
}: {
  template: Template;
  index: number;
  isFavorite: boolean;
  viewCount: number;
  favCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onFavorite: (e: React.MouseEvent) => void;
  onCopilot: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onOutlook: (e: React.MouseEvent) => void;
  onLinkedIn: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`card p-3 cursor-pointer group card-enter relative ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      {/* Secondary actions (top-right) */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onFavorite} className={`p-1 rounded text-xs hover:bg-surface-hover ${isFavorite ? 'text-red-500' : 'text-text-muted'}`} title="Favorite">
          {isFavorite ? '❤️' : '🤍'}
        </button>
        <button onClick={onEdit} className="p-1 rounded text-xs text-text-muted hover:bg-surface-hover" title="Edit">
          ✏️
        </button>
        <button onClick={onDelete} className="p-1 rounded text-xs text-red-400 hover:bg-red-50" title="Delete">
          🗑️
        </button>
      </div>

      {/* Title + badges */}
      <div className="mb-2 pr-16">
        <h3 className="font-semibold text-text-primary text-sm mb-1.5 group-hover:text-primary transition truncate">
          {t.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="token-pill text-[10px]">{t.category}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            t.kind === 'prompt'
              ? 'bg-purple-50 text-purple-600 border border-purple-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {t.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
          </span>
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-2">
        {t.body.slice(0, 100)}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-2 text-[10px] text-text-muted mb-2">
        {viewCount > 0 && <span>👁 {viewCount}</span>}
        {favCount > 0 && <span className="text-red-400">❤️ {favCount}</span>}
        {isFavorite && !favCount && <span className="text-red-400">❤️</span>}
      </div>

      {/* Primary actions (always visible) */}
      <div className="pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button onClick={onCopilot} className="flex-1 btn-ghost px-2 py-1.5 text-[11px] font-medium hover:bg-primary/5 hover:text-primary rounded-lg transition" title="Auto-copies text — just paste in Copilot">
            🤖 Copilot
          </button>
          <button onClick={onCopy} className="flex-1 btn-ghost px-2 py-1.5 text-[11px] font-medium hover:bg-primary/5 hover:text-primary rounded-lg transition">
            📋 Copy
          </button>
          {t.kind === 'template' && (
            <button onClick={onOutlook} className="flex-1 btn-ghost px-2 py-1.5 text-[11px] font-medium hover:bg-primary/5 hover:text-primary rounded-lg transition">
              ✉️ Outlook
            </button>
          )}
          {(t.kind === 'template' || t.scenario?.includes('job-post')) && (
            <button onClick={onLinkedIn} className="flex-1 btn-ghost px-2 py-1.5 text-[11px] font-medium hover:bg-[#0a66c2]/5 hover:text-[#0a66c2] rounded-lg transition">
              💼 LinkedIn
            </button>
          )}
        </div>
        <p className="text-[9px] text-text-muted text-center mt-1 opacity-70">
          💡 Copilot: auto-copies text → just paste (Ctrl+V) in chat
        </p>
      </div>
    </div>
  );
}
