'use client';

import { useState, useEffect } from 'react';
import type { Template } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { loadTemplates, loadViewCounts, loadSharedFavCounts, loadFavorites, toggleFavorite, incrementViewCount, copyToCopilot, copyToClipboard, openInOutlook } from '@/lib/utils';
import Swal from 'sweetalert2';

export default function TopPopular() {
  const [items, setItems] = useState<Template[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [favCounts, setFavCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedDetail, setSelectedDetail] = useState<Template | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setItems(loadTemplates(STARTER_TEMPLATES));
    setViewCounts(loadViewCounts());
    setFavCounts(loadSharedFavCounts());
    setFavorites(loadFavorites());
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Rank by combined score: views + (favCount * 3) to weight favorites higher
  const ranked = [...items]
    .map((t) => ({
      ...t,
      score: (viewCounts[t.id] || 0) + (favCounts[t.id] || 0) * 3,
      views: viewCounts[t.id] || 0,
      favs: favCounts[t.id] || 0,
    }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (ranked.length === 0) return null;

  return (
    <>
      <section className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">🔥 Top 10 Popular</h2>
            <p className="text-sm text-text-secondary">Most viewed and favorited templates &amp; prompts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ranked.map((t, i) => (
              <div
                key={t.id}
                onClick={() => { setSelectedDetail(t); incrementViewCount(t.id); setViewCounts(loadViewCounts()); }}
                className="card p-4 group card-enter cursor-pointer relative"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {/* Rank badge */}
                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="mb-2 pl-4">
                  <h4 className="font-semibold text-sm text-text-primary truncate">{t.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="token-pill">{t.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  {t.views > 0 && <span>👁 {t.views}</span>}
                  {t.favs > 0 && <span className="text-red-400">❤️ {t.favs}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail overlay */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedDetail(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-lg">✕</button>
            <h2 className="text-lg font-bold text-text-primary mb-2 pr-8">{selectedDetail.title}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="token-pill">{selectedDetail.category}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedDetail.kind === 'prompt' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                {selectedDetail.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
              </span>
              {(viewCounts[selectedDetail.id] || 0) > 0 && <span className="text-[10px] text-text-muted">👁 {viewCounts[selectedDetail.id]}</span>}
              {(favCounts[selectedDetail.id] || 0) > 0 && <span className="text-[10px] text-red-400">❤️ {favCounts[selectedDetail.id]}</span>}
            </div>
            <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed mb-6">{selectedDetail.body}</div>
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border">
              <button onClick={() => { setFavorites((prev) => toggleFavorite(prev, selectedDetail.id)); setTimeout(() => setFavCounts(loadSharedFavCounts()), 500); }} className={`btn-ghost px-3 py-1.5 text-xs ${favorites.has(selectedDetail.id) ? 'text-red-500' : ''}`}>
                {favorites.has(selectedDetail.id) ? '❤️ Favorited' : '🤍 Favorite'}
              </button>
              <button onClick={async () => { await copyToCopilot(selectedDetail.body); showToast('✅ Copied! Paste (Ctrl+V) in Copilot chat'); }} className="btn-ghost px-3 py-1.5 text-xs">🤖 Copilot</button>
              <button onClick={async () => { await copyToClipboard(selectedDetail.body); showToast('Copied ✓'); }} className="btn-ghost px-3 py-1.5 text-xs">📋 Copy</button>
              <button onClick={() => openInOutlook(selectedDetail.title, selectedDetail.body)} className="btn-ghost px-3 py-1.5 text-xs">✉️ Outlook</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </>
  );
}
