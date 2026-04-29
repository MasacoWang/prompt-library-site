'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Template } from '@/lib/types';
import { SCENARIOS, PHASES, CATEGORIES } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { copyToCopilot, copyToClipboard, openInOutlook, loadViewCounts, loadFavorites, toggleFavorite, loadTemplates, saveTemplates, generateId } from '@/lib/utils';
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

function ItemCard({ item, onToast, viewCount, isFavorite, onToggleFavorite, onDelete }: { item: Template; onToast: (msg: string) => void; viewCount?: number; isFavorite?: boolean; onToggleFavorite?: () => void; onDelete?: () => void }) {
  return (
    <div className="card p-4 group card-enter">
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
      <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-border">
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

function SplitList({ items, onToast, emptyLabel, viewCounts, favorites, onToggleFavorite, onDelete }: { items: Template[]; onToast: (msg: string) => void; emptyLabel: string; viewCounts: Record<string, number>; favorites: Set<string>; onToggleFavorite: (id: string) => void; onDelete: (id: string) => void }) {
  const templates = items.filter((i) => i.kind === 'template');
  const prompts = items.filter((i) => i.kind === 'prompt');

  return (
    <div className="mt-4 pl-2 sm:pl-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">✉️ Email Templates</h5>
        {templates.length > 0 ? (
          <div className="space-y-3">{templates.map((t) => <ItemCard key={t.id} item={t} onToast={onToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => onToggleFavorite(t.id)} onDelete={() => onDelete(t.id)} />)}</div>
        ) : (
          <p className="text-xs text-text-muted italic py-3">No templates for this {emptyLabel}</p>
        )}
      </div>
      <div>
        <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">💡 Prompts</h5>
        {prompts.length > 0 ? (
          <div className="space-y-3">{prompts.map((t) => <ItemCard key={t.id} item={t} onToast={onToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => onToggleFavorite(t.id)} onDelete={() => onDelete(t.id)} />)}</div>
        ) : (
          <p className="text-xs text-text-muted italic py-3">No prompts for this {emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Template[]>([]);
  const [newDraft, setNewDraft] = useState({ title: '', body: '', category: 'Strategy', kind: 'prompt' as 'prompt' | 'template' });

  // Switch tab based on URL hash (e.g. /#scenarios, /#phases)
  useEffect(() => {
    setFavorites(loadFavorites());
    setViewCounts(loadViewCounts());
    setItems(loadTemplates(STARTER_TEMPLATES));
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

  const emailTemplates = items.filter((t) => t.kind === 'template');
  const prompts = items.filter((t) => t.kind === 'prompt');
  const favoriteItems = items.filter((t) => favorites.has(t.id));
  const getByScenario = (key: string) => items.filter((t) => t.scenario?.includes(key));
  const getByPhase = (key: string) => items.filter((t) => t.phase?.includes(key));

  const handleCreate = () => {
    if (!newDraft.title || !newDraft.body) { showToast('Title and body are required'); return; }
    const now = new Date().toISOString();
    const newT: Template = {
      id: generateId(), title: newDraft.title, category: newDraft.category,
      kind: newDraft.kind, body: newDraft.body, casualBody: '',
      pinned: false, createdAt: now, updatedAt: now,
    };
    setItems((prev) => {
      const updated = [...prev, newT];
      saveTemplates(updated);
      return updated;
    });
    setNewDraft({ title: '', body: '', category: 'Strategy', kind: 'prompt' });
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {emailTemplates.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prompts.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={favorites.has(t.id)} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} />
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
        <div className="space-y-3 animate-fade-in">
          {SCENARIOS.map((sc) => {
            const matched = getByScenario(sc.key);
            const isExpanded = expandedScenario === sc.key;
            return (
              <div key={sc.key}>
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : sc.key)}
                  className={`w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all ${
                    isExpanded
                      ? 'bg-white border-2 border-primary shadow-md'
                      : 'card hover:border-primary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                    {sc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[15px] text-text-primary">{sc.label}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-text-muted bg-surface-alt px-2.5 py-1 rounded-full">
                      {matched.length} items
                    </span>
                    <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </div>
                </button>
                {isExpanded && (
                  <SplitList items={matched} onToast={showToast} emptyLabel="scenario" viewCounts={viewCounts} favorites={favorites} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Recruiting Phases tab ── */}
      {activeTab === 'phases' && (
        <div className="space-y-3 animate-fade-in">
          {PHASES.map((ph) => {
            const matched = getByPhase(ph.key);
            const isExpanded = expandedPhase === ph.key;
            return (
              <div key={ph.key}>
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : ph.key)}
                  className={`w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all ${
                    isExpanded
                      ? 'bg-white border-2 border-primary shadow-md'
                      : 'card hover:border-primary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                    {ph.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[15px] text-text-primary">{ph.label}</h4>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-text-muted bg-surface-alt px-2.5 py-1 rounded-full">
                      {matched.length} items
                    </span>
                    <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </div>
                </button>
                {isExpanded && (
                  <SplitList items={matched} onToast={showToast} emptyLabel="phase" viewCounts={viewCounts} favorites={favorites} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Favorites tab ── */}
      {activeTab === 'favorites' && (
        <div className="animate-fade-in">
          {favoriteItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {favoriteItems.map((t) => (
                <ItemCard key={t.id} item={t} onToast={showToast} viewCount={viewCounts[t.id]} isFavorite={true} onToggleFavorite={() => handleToggleFavorite(t.id)} onDelete={() => handleDelete(t.id)} />
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
              <select
                value={newDraft.category}
                onChange={(e) => setNewDraft((d) => ({ ...d, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
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
                onClick={() => setNewDraft({ title: '', body: '', category: 'Strategy', kind: 'prompt' })}
                className="btn-ghost px-4 py-2.5 text-sm"
              >
                Clear
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
