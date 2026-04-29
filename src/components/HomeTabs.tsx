'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Template } from '@/lib/types';
import { SCENARIOS, PHASES } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { copyToCopilot, copyToClipboard, openInOutlook, loadViewCounts, incrementViewCount, loadFavorites, toggleFavorite, loadTemplates, saveTemplates, generateId, getAllCategories, saveCustomCategory, deleteCustomCategory, isCustomCategory } from '@/lib/utils';
import Swal from 'sweetalert2';

type TabKey = 'templates' | 'prompts' | 'scenarios' | 'phases' | 'favorites' | 'new';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'templates', label: 'Email Templates', icon: '✉️' },
  { key: 'prompts', label: 'Prompt Library', icon: '💡' },
  { key: 'scenarios', label: 'Scenarios', icon: '🎯' },
  { key: 'phases', label: 'Recruiting Phases', icon: '📊' },
  { key: 'favorites', label: 'Favorites', icon: '❤️' },
  { key: 'new', label: '+ New', icon: '✨' },
];

function ItemCard({ item, onToast, viewCount, isFavorite, onToggleFavorite, onDelete, onOpen }: { item: Template; onToast: (msg: string) => void; viewCount?: number; isFavorite?: boolean; onToggleFavorite?: () => void; onDelete?: () => void; onOpen?: () => void }) {
  return (
    <div className="card p-4 group card-enter cursor-pointer" onClick={onOpen}>
      <div className="mb-2">
        <h4 className="font-semibold text-sm text-text-primary truncate">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="token-pill">{item.category}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              item.kind === 'prompt'
                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {item.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
          </span>
        </div>
      </div>
      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-2">
        {item.body.slice(0, 120)}
      </p>
      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] text-text-muted mb-3">
        {(viewCount ?? 0) > 0 && <span>👁 {viewCount}</span>}
        {isFavorite && <span className="text-red-400">❤️</span>}
      </div>
      <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`btn-ghost px-2 py-1 text-xs ${isFavorite ? 'text-red-500' : ''}`}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
        <button
          onClick={async () => { await copyToCopilot(item.body); onToast('Copied & opened Copilot ✓'); }}
          className="btn-ghost px-2 py-1 text-xs"
        >
          🤖 Copilot
        </button>
        <button
          onClick={async () => { await copyToClipboard(item.body); onToast('Copied ✓'); }}
          className="btn-ghost px-2 py-1 text-xs"
        >
          📋 Copy
        </button>
        <button
          onClick={() => openInOutlook(item.title, item.body)}
          className="btn-ghost px-2 py-1 text-xs"
        >
          ✉️ Outlook
        </button>
        {onDelete && (
          <button onClick={onDelete} className="btn-ghost px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Template[]>([]);
  const [newDraft, setNewDraft] = useState({ title: '', body: '', category: 'Strategy', kind: 'prompt' as 'prompt' | 'template', scenario: [] as string[] });
  const [categories, setCategories] = useState<string[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [homeCategoryFilter, setHomeCategoryFilter] = useState('All');
  const [homeScenarioFilter, setHomeScenarioFilter] = useState('All');
  const [homePhaseFilter, setHomePhaseFilter] = useState('All');
  const [selectedDetail, setSelectedDetail] = useState<Template | null>(null);

  // Switch tab based on URL hash (e.g. /#scenarios, /#phases)
  useEffect(() => {
    setFavorites(loadFavorites());
    setViewCounts(loadViewCounts());
    setItems(loadTemplates(STARTER_TEMPLATES));
    setCategories(getAllCategories());
    const hash = window.location.hash.replace('#', '');
    if (hash === 'scenarios') setActiveTab('scenarios');
    else if (hash === 'phases') setActiveTab('phases');

    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'scenarios') setActiveTab('scenarios');
      else if (h === 'phases') setActiveTab('phases');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => toggleFavorite(prev, id));
  };

  const handleDelete= async (id: string) => {
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
      setItems((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTemplates(updated);
        return updated;
      });
      Swal.fire('Deleted!', 'Your template has been removed.', 'success');
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    const result = await Swal.fire({
      title: 'Delete category?',
      text: `Remove "${catName}"? Templates in this category won't be deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      deleteCustomCategory(catName);
      setCategories(getAllCategories());
      if (homeCategoryFilter === catName) setHomeCategoryFilter('All');
      Swal.fire('Deleted!', `Category "${catName}" has been removed.`, 'success');
    }
  };

  const handleOpen = (id: string) => {
    const found = items.find((t) => t.id === id);
    if (found) {
      setSelectedDetail(found);
      const updated = incrementViewCount(id);
      setViewCounts(updated);
    }
  };

  const emailTemplates = items.filter((t) => t.kind === 'template' && (homeCategoryFilter === 'All' || t.category === homeCategoryFilter));
  const prompts = items.filter((t) => t.kind === 'prompt' && (homeCategoryFilter === 'All' || t.category === homeCategoryFilter));
  const favoriteItems = items.filter((t) => favorites.has(t.id));
  const scenarioItems = items.filter((t) => {
    if (homeScenarioFilter === 'All') return t.scenario && t.scenario.length > 0;
    return t.scenario?.includes(homeScenarioFilter);
  });
  const phaseItems = items.filter((t) => {
    if (homePhaseFilter === 'All') return t.phase && t.phase.length > 0;
    return t.phase?.includes(homePhaseFilter);
  });

  const handleCreate = () => {
    if (!newDraft.title || !newDraft.body) { showToast('Title and body are required'); return; }
    const now = new Date().toISOString();
    const newT: Template = {
      id: generateId(), title: newDraft.title, category: newDraft.category,
      kind: newDraft.kind, body: newDraft.body, casualBody: '',
      pinned: false, createdAt: now, updatedAt: now,
      phase: [newDraft.category.toLowerCase()],
      scenario: newDraft.scenario || [],
    };
    setItems((prev) => {
      const updated = [...prev, newT];
      saveTemplates(updated);
      return updated;
    });
    setNewDraft({ title: '', body: '', category: 'Strategy', kind: 'prompt', scenario: [] });
    setCategories(getAllCategories());
    setHomeCategoryFilter(newDraft.category);
    showToast('Created ✓');
    setActiveTab(newT.kind === 'template' ? 'templates' : 'prompts');
  };

  return (
    <div>
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-2xl border border-border mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Email Templates tab ── */}
      {activeTab === 'templates' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            <button onClick={() => setHomeCategoryFilter('All')} className={`cat-pill whitespace-nowrap ${homeCategoryFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
            {categories.map((c) => (
              <span key={c} className="inline-flex items-center gap-0.5">
                <button onClick={() => setHomeCategoryFilter(c)} className={`cat-pill whitespace-nowrap ${homeCategoryFilter === c ? 'cat-pill-active' : ''}`}>{c}</button>
                {isCustomCategory(c) && <button onClick={() => handleDeleteCategory(c)} className="text-red-400 hover:text-red-600 text-xs ml-[-4px]" title={`Delete ${c}`}>✕</button>}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {emailTemplates.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} onOpen={() => handleOpen(t.id)} />
            ))}
          </div>
          {emailTemplates.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/templates" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {emailTemplates.length} Email Templates →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Prompt Library tab ── */}
      {activeTab === 'prompts' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            <button onClick={() => setHomeCategoryFilter('All')} className={`cat-pill whitespace-nowrap ${homeCategoryFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
            {categories.map((c) => (
              <span key={c} className="inline-flex items-center gap-0.5">
                <button onClick={() => setHomeCategoryFilter(c)} className={`cat-pill whitespace-nowrap ${homeCategoryFilter === c ? 'cat-pill-active' : ''}`}>{c}</button>
                {isCustomCategory(c) && <button onClick={() => handleDeleteCategory(c)} className="text-red-400 hover:text-red-600 text-xs ml-[-4px]" title={`Delete ${c}`}>✕</button>}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prompts.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} onOpen={() => handleOpen(t.id)} />
            ))}
          </div>
          {prompts.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/prompts" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {prompts.length} Prompts →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Scenarios tab ── */}
      {activeTab === 'scenarios' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            <button onClick={() => setHomeScenarioFilter('All')} className={`cat-pill whitespace-nowrap ${homeScenarioFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
            {SCENARIOS.map((sc) => (
              <button key={sc.key} onClick={() => setHomeScenarioFilter(sc.key)} className={`cat-pill whitespace-nowrap ${homeScenarioFilter === sc.key ? 'cat-pill-active' : ''}`}>{sc.icon} {sc.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scenarioItems.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} onOpen={() => handleOpen(t.id)} />
            ))}
          </div>
          {scenarioItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3 opacity-50">📭</p>
              <p className="text-base font-medium text-text-secondary">No items found for this scenario</p>
            </div>
          )}
          {scenarioItems.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/scenarios" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {scenarioItems.length} Scenario Items →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Recruiting Phases tab ── */}
      {activeTab === 'phases' && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            <button onClick={() => setHomePhaseFilter('All')} className={`cat-pill whitespace-nowrap ${homePhaseFilter === 'All' ? 'cat-pill-active' : ''}`}>All</button>
            {PHASES.map((ph) => (
              <button key={ph.key} onClick={() => setHomePhaseFilter(ph.key)} className={`cat-pill whitespace-nowrap ${homePhaseFilter === ph.key ? 'cat-pill-active' : ''}`}>{ph.icon} {ph.label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {phaseItems.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} onOpen={() => handleOpen(t.id)} />
            ))}
          </div>
          {phaseItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3 opacity-50">📭</p>
              <p className="text-base font-medium text-text-secondary">No items found for this phase</p>
            </div>
          )}
          {phaseItems.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/phases" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {phaseItems.length} Phase Items →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Favorites tab ── */}
      {activeTab === 'favorites' && (
        <div className="animate-fade-in">
          {favoriteItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favoriteItems.map((t) => (
                <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={true} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} onOpen={() => handleOpen(t.id)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🤍</div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No favorites yet</h3>
              <p className="text-sm text-text-muted">Click the ❤️ button on any template or prompt to add it here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── + New tab ── */}
      {activeTab === 'new' && (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="card p-6 space-y-5">
            <h3 className="text-lg font-semibold text-text-primary">Create New</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setNewDraft((d) => ({ ...d, kind: 'prompt' }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${newDraft.kind === 'prompt' ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' : 'bg-surface-alt text-text-secondary border border-border hover:border-primary/30'}`}
              >
                💡 Prompt
              </button>
              <button
                onClick={() => setNewDraft((d) => ({ ...d, kind: 'template' }))}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${newDraft.kind === 'template' ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-surface-alt text-text-secondary border border-border hover:border-primary/30'}`}
              >
                ✉️ Email Template
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                type="text"
                value={newDraft.title}
                onChange={(e) => setNewDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="e.g. Follow-up after screening call"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Category</label>
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <select
                    value={newDraft.category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') { setShowNewCategory(true); return; }
                      setNewDraft((d) => ({ ...d, category: e.target.value }));
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">＋ Add new category…</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    autoFocus
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCategoryName.trim()) {
                        const updated = saveCustomCategory(newCategoryName.trim());
                        setCategories(getAllCategories());
                        setNewDraft((d) => ({ ...d, category: newCategoryName.trim() }));
                        setNewCategoryName('');
                        setShowNewCategory(false);
                        if (updated.length > 0) showToast('Category added ✓');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        saveCustomCategory(newCategoryName.trim());
                        setCategories(getAllCategories());
                        setNewDraft((d) => ({ ...d, category: newCategoryName.trim() }));
                        setNewCategoryName('');
                        setShowNewCategory(false);
                        showToast('Category added ✓');
                      } else {
                        setShowNewCategory(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                    className="btn-ghost px-3 py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Scenarios <span className="normal-case font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.key}
                    onClick={() => setNewDraft((d) => ({
                      ...d,
                      scenario: d.scenario.includes(sc.key) ? d.scenario.filter((s) => s !== sc.key) : [...d.scenario, sc.key],
                    }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      newDraft.scenario.includes(sc.key)
                        ? 'bg-primary/10 text-primary border-2 border-primary/30'
                        : 'bg-surface-alt text-text-secondary border border-border hover:border-primary/30'
                    }`}
                  >
                    {sc.icon} {sc.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 block">Body</label>
              <textarea
                value={newDraft.body}
                onChange={(e) => setNewDraft((d) => ({ ...d, body: e.target.value }))}
                placeholder="Write your prompt or email template here... Use {{variable}} for dynamic fields."
                rows={8}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
              >
                ✨ Create
              </button>
              <button
                onClick={() => setNewDraft({ title: '', body: '', category: 'Strategy', kind: 'prompt', scenario: [] })}
                className="btn-ghost px-4 py-2.5 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail overlay ── */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-text-primary mb-2">{selectedDetail.title}</h2>
                  <div className="flex items-center gap-2">
                    <span className="token-pill">{selectedDetail.category}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      selectedDetail.kind === 'prompt'
                        ? 'bg-purple-50 text-purple-600 border border-purple-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {selectedDetail.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
                    </span>
                    {(viewCounts[selectedDetail.id] ?? 0) > 0 && (
                      <span className="text-xs text-text-muted">👁 {viewCounts[selectedDetail.id]}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedDetail(null)} className="btn-ghost p-2 text-lg shrink-0">✕</button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap text-sm text-text-primary leading-relaxed font-sans">{selectedDetail.body}</pre>
            </div>
            {/* Actions */}
            <div className="p-4 border-t border-border flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { toggleFavorite(favorites, selectedDetail.id); setFavorites((prev) => toggleFavorite(prev, selectedDetail.id)); }}
                className={`btn-ghost px-3 py-1.5 text-sm ${favorites.has(selectedDetail.id) ? 'text-red-500' : ''}`}
              >
                {favorites.has(selectedDetail.id) ? '❤️ Unfavorite' : '🤍 Favorite'}
              </button>
              <button
                onClick={async () => { await copyToCopilot(selectedDetail.body); showToast('Copied & opened Copilot ✓'); }}
                className="btn-ghost px-3 py-1.5 text-sm"
              >
                🤖 Copilot
              </button>
              <button
                onClick={async () => { await copyToClipboard(selectedDetail.body); showToast('Copied ✓'); }}
                className="btn-ghost px-3 py-1.5 text-sm"
              >
                📋 Copy
              </button>
              <button
                onClick={() => openInOutlook(selectedDetail.title, selectedDetail.body)}
                className="btn-ghost px-3 py-1.5 text-sm"
              >
                ✉️ Outlook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
