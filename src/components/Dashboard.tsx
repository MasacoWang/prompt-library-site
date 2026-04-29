'use client';

import type { Template } from '@/lib/types';
import { getAllCategories } from '@/lib/utils';

interface DashboardProps {
  templates: Template[];
  search: string;
  onSearchChange: (s: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
}

export default function Dashboard({
  templates, search, onSearchChange, categoryFilter, onCategoryChange,
  onSelect, onCreate, onEdit, onDelete, onExport,
}: DashboardProps) {
  return (
    <div className="h-full overflow-auto px-2">
      <div className="max-w-[1400px] mx-auto">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="flex-1 min-w-[220px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search templates..."
              className="w-full glass rounded-2xl px-4 py-2.5 pl-10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal/30 transition"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 glass rounded-2xl p-1">
            <button
              onClick={() => onCategoryChange('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                categoryFilter === 'All'
                  ? 'bg-gradient-to-r from-teal to-cyan-400 text-white shadow-lg shadow-teal-glow'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              All
            </button>
            {getAllCategories().map((c) => (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                  categoryFilter === c
                    ? 'bg-gradient-to-r from-teal to-cyan-400 text-white shadow-lg shadow-teal-glow'
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={onCreate} className="btn-teal px-4 py-2 rounded-2xl text-sm">
              + New
            </button>
            <button onClick={onExport} className="px-3 py-2 glass rounded-2xl text-sm text-white/70 hover:text-white hover:bg-white/15 transition" title="Export JSON">
              ↓ Export
            </button>
          </div>
        </div>

        {/* ── Empty State ── */}
        {templates.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-60">📭</p>
            <p className="text-lg font-medium text-white/60">No templates found</p>
            <p className="text-sm mt-2 text-white/30">Create your first template or adjust your search</p>
          </div>
        ) : (
          /* ── Card Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="glass rounded-2xl p-5 cursor-pointer hover:bg-white/12 hover:shadow-lg hover:shadow-teal-glow/10 transition-all duration-300 group relative"
              >

                <div className="mb-3">
                  <h3 className="font-semibold text-white truncate text-[15px] mb-2">{t.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="token-pill">{t.category}</span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        t.kind === 'prompt'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {t.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/40 line-clamp-3 leading-relaxed mb-4">
                  {t.body.slice(0, 180)}
                </p>

                {/* Hover actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-3 border-t border-white/8">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(t.id); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-xs text-white/50 hover:text-white transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                    className="p-1.5 hover:bg-red-500/15 rounded-lg text-xs text-red-400/70 hover:text-red-400 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
