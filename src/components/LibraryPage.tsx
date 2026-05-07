'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Template, Tone, EditorMode } from '@/lib/types';
import { SCENARIOS, PHASES } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { useAllStarters } from '@/lib/useAllStarters';
import {
  loadTemplates, saveTemplates, exportTemplates,
  extractVariables, substituteVariables, copyToCopilot, copyToClipboard,
  openInOutlook, generateId,
  loadFavorites, toggleFavorite, loadViewCounts, incrementViewCount,
  getAllCategories, deleteCustomCategory, isCustomCategory,
  loadSharedFavCounts, loadDeletedIds, saveDeletedIds,
} from '@/lib/utils';
import { useFavoritesSync } from '@/lib/useFavoritesSync';
import Editor from '@/components/Editor';
import ActionGuide from '@/components/ActionGuide';
import Swal from 'sweetalert2';

interface LibraryPageProps {
  kindFilter: 'template' | 'prompt' | null;
  pageTitle: string;
  pageDescription: string;
  filterMode?: 'scenario' | 'phase';
}

export default function LibraryPage({ kindFilter, pageTitle, pageDescription, filterMode }: LibraryPageProps) {
  const { allStarters } = useAllStarters();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [subFilter, setSubFilter] = useState('All');
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
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return [...loadDeletedIds()];
  });

  const starterIds = useMemo(() => new Set(allStarters.map((t) => t.id)), [allStarters]);

  // Sync all user data with server when logged in
  useFavoritesSync(favorites, setFavorites, {
    templates,
    starterTemplateIds: starterIds,
    setTemplates,
    customCategories: allCategories.filter((c) => !['Strategy', 'Sourcing', 'Screening', 'Interview', 'Offer'].includes(c)),
    setCustomCategories: (cats: string[]) => setAllCategories([...['Strategy', 'Sourcing', 'Screening', 'Interview', 'Offer'], ...cats]),
    deletedTemplateIds,
    setDeletedTemplateIds,
  });

  useEffect(() => {
    setTemplates(loadTemplates(allStarters));
    setFavorites(loadFavorites());
    setViewCounts(loadViewCounts());
    setSharedFavCounts(loadSharedFavCounts());
    setAllCategories(getAllCategories());
    setMounted(true);
  }, [allStarters]);

  useEffect(() => {
    if (mounted && templates.length > 0) saveTemplates(templates);
  }, [templates, mounted]);

  useEffect(() => {
    if (mounted) saveDeletedIds(deletedTemplateIds);
  }, [deletedTemplateIds, mounted]);

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

  const showToast = useCallback((msg: string) => {
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
    const updated = incrementViewCount(id);
    setViewCounts(updated);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editDraft.title || !editDraft.body) { showToast('Title and body required'); return; }
    if (editDraft.id) {
      setTemplates((prev) => prev.map((t) => t.id === editDraft.id ? { ...t, ...editDraft, phase: [(editDraft.category || t.category).toLowerCase()], updatedAt: new Date().toISOString() } as Template : t));
      setSelectedId(editDraft.id);
    } else {
      const now = new Date().toISOString();
      const newId = generateId();
      const newT: Template = {
        id: newId, title: editDraft.title!, category: editDraft.category || 'Strategy',
        kind: (editDraft.kind as 'prompt' | 'template') || (kindFilter || 'prompt'),
        body: editDraft.body!, casualBody: editDraft.casualBody || '',
        pinned: false, createdAt: now, updatedAt: now,
        phase: [(editDraft.category || 'Strategy').toLowerCase()],
        scenario: editDraft.scenario || [],
      };
      setTemplates((prev) => [...prev, newT]);
      setSelectedId(newId);
    }
    setEditorMode('use');
    showToast('Saved ✓');
  }, [editDraft, showToast, kindFilter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); if (editorMode === 'edit') handleSaveEdit(); }
      if (e.key === 'Escape' && selectedId) { setSelectedId(null); setEditorMode('use'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editorMode, handleSaveEdit, selectedId]);

  // Filter by kind + search + category + favorites + scenario/phase
  const filtered = templates.filter((t) => {
    if (kindFilter && t.kind !== kindFilter) return false;
    if (showFavoritesOnly && !favorites.has(t.id)) return false;
    const q = search.toLowerCase();
    const matchS = !q || t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    if (!matchS) return false;
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (filterMode === 'scenario' && subFilter !== 'All' && !t.scenario?.includes(subFilter)) return false;
    if (filterMode === 'phase' && subFilter !== 'All' && !t.phase?.includes(subFilter)) return false;
    if (filterMode === 'scenario' && subFilter === 'All') {
      return t.scenario && t.scenario.length > 0;
    }
    if (filterMode === 'phase' && subFilter === 'All') {
      return t.phase && t.phase.length > 0;
    }
    return true;
  });

  if (!mounted) return null;

  // Editor view
  if (selectedId) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="animate-slide-in" style={{ minHeight: 'calc(100vh - 180px)' }}>
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
            onBack={() => { setSelectedId(null); setEditorMode('use'); }}
            onEditMode={() => { if (selectedTemplate) { setEditDraft({ ...selectedTemplate }); setEditorMode('edit'); } }}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => { if (selectedTemplate) setEditorMode('use'); else setSelectedId(null); }}
            onDraftChange={setEditDraft}
            onToneChange={setTone}
            onVariableChange={(k, v) => setVariableValues((p) => ({ ...p, [k]: v }))}
            onCopyToCopilot={async () => { await copyToCopilot(previewText); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }}
            onCopyPlain={async () => { await copyToClipboard(previewText); showToast('Copied ✓'); }}
            onOpenOutlook={() => { if (selectedTemplate) openInOutlook(selectedTemplate.title, previewText); }}
            onOpenLinkedIn={async () => { await copyToClipboard(previewText); showToast('Copied! Paste on LinkedIn'); window.open('https://www.linkedin.com/feed/', '_blank'); }}
            onToggleFavorite={() => { if (selectedTemplate) handleFavoriteToggle(selectedTemplate.id); }}
            onDelete={async () => {
              if (!selectedTemplate) return;
              const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'Cancel',
              });
              if (result.isConfirmed) {
                setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));
                setDeletedTemplateIds((prev) => [...prev, selectedTemplate.id]);
                setSelectedId(null);
                Swal.fire('Deleted!', 'Your template has been removed.', 'success');
              }
            }}
          />
        </div>
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
            {toast}
          </div>
        )}
      </div>
    );
  }

  // Library grid view
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">{pageTitle}</h1>
        <p className="text-sm text-text-secondary mb-3">{pageDescription}</p>
        <ActionGuide />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-6">
        <div className="w-full sm:flex-1 sm:min-w-[200px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="input-field pl-9"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 -mb-1">
          <button
            onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); }}
            className={`cat-pill whitespace-nowrap ${showFavoritesOnly ? 'cat-pill-active !bg-red-500 !border-red-500' : ''}`}
          >
            ❤️ Favorites
          </button>
          <span className="w-px h-5 bg-border mx-0.5" />
          {filterMode === 'scenario' ? (
            <>
              <button onClick={() => setSubFilter('All')} className={`cat-pill whitespace-nowrap ${subFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
              {SCENARIOS.map((sc) => (
                <button key={sc.key} onClick={() => setSubFilter(sc.key)} className={`cat-pill whitespace-nowrap ${subFilter === sc.key ? 'cat-pill-active' : ''}`}>{sc.icon} {sc.label}</button>
              ))}
            </>
          ) : filterMode === 'phase' ? (
            <>
              <button onClick={() => setSubFilter('All')} className={`cat-pill whitespace-nowrap ${subFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
              {PHASES.map((ph) => (
                <button key={ph.key} onClick={() => setSubFilter(ph.key)} className={`cat-pill whitespace-nowrap ${subFilter === ph.key ? 'cat-pill-active' : ''}`}>{ph.icon} {ph.label}</button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={() => setCategoryFilter('All')}
                className={`cat-pill whitespace-nowrap ${categoryFilter === 'All' ? 'cat-pill-active' : ''}`}
              >
                All
              </button>
              {allCategories.map((c) => (
                <span key={c} className="inline-flex items-center gap-0.5">
                  <button
                    onClick={() => setCategoryFilter(c)}
                    className={`cat-pill whitespace-nowrap ${categoryFilter === c ? 'cat-pill-active' : ''}`}
                  >
                    {c}
                  </button>
                  {isCustomCategory(c) && (
                    <button
                      onClick={async () => {
                        const result = await Swal.fire({ title: 'Delete category?', text: `Remove "${c}"? Templates won't be deleted.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' });
                        if (result.isConfirmed) { deleteCustomCategory(c); setAllCategories(getAllCategories()); if (categoryFilter === c) setCategoryFilter('All'); Swal.fire('Deleted!', `Category "${c}" removed.`, 'success'); }
                      }}
                      className="text-red-400 hover:text-red-600 text-xs ml-[-4px]"
                      title={`Delete ${c}`}
                    >✕</button>
                  )}
                </span>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedId(null);
              setEditDraft({ title: '', category: 'Strategy', kind: kindFilter || 'prompt', body: '', casualBody: '' });
              setEditorMode('edit');
              setSelectedId('__new__');
            }}
            className="btn-primary px-4 py-2"
          >
            + New
          </button>
          <button onClick={() => exportTemplates(templates)} className="btn-secondary px-3 py-2" title="Export">
            ↓ Export
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3 opacity-50">📭</p>
          <p className="text-base font-medium text-text-secondary">No templates found</p>
          <p className="text-sm text-text-muted mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filtered.map((t, i) => (
            <div
              key={t.id}
              onClick={() => handleSelectItem(t.id)}
              className="card p-3.5 cursor-pointer group card-enter"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="mb-2">
                <h3 className="font-semibold text-text-primary text-sm mb-1.5 group-hover:text-primary transition truncate">
                  {t.title}
                </h3>
                <div className="flex items-center gap-1.5">
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
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-2">
                {t.body.slice(0, 120)}
              </p>
              {/* Stats row */}
              <div className="flex items-center gap-2 text-[10px] text-text-muted mb-2">
                {viewCounts[t.id] > 0 && (
                  <span className="flex items-center gap-1">👁 {viewCounts[t.id]}</span>
                )}
                {(sharedFavCounts[t.id] || 0) > 0 && (
                  <span className="flex items-center gap-1 text-red-400">❤️ {sharedFavCounts[t.id]}</span>
                )}
                {favorites.has(t.id) && !(sharedFavCounts[t.id] > 0) && (
                  <span className="flex items-center gap-1 text-red-400">❤️</span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-2 border-t border-border">
                <button
                  onClick={(e) => { e.stopPropagation(); handleFavoriteToggle(t.id, e); }}
                  className={`btn-ghost p-1.5 text-xs ${favorites.has(t.id) ? 'text-red-500' : ''}`}
                  title={favorites.has(t.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(t.id) ? '❤️ Unfavorite' : '🤍 Favorite'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedId(t.id); setEditDraft({ ...t }); setEditorMode('edit'); }}
                  className="btn-ghost p-1.5 text-xs"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const result = await Swal.fire({
                      title: 'Are you sure?',
                      text: "You won't be able to revert this!",
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#d33',
                      cancelButtonColor: '#3085d6',
                      confirmButtonText: 'Yes, delete it!',
                      cancelButtonText: 'Cancel',
                    });
                    if (result.isConfirmed) {
                      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
                      setDeletedTemplateIds((prev) => [...prev, t.id]);
                      Swal.fire('Deleted!', 'Your template has been removed.', 'success');
                    }
                  }}
                  className="btn-ghost p-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
