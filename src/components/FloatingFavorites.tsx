'use client';

import { useState, useEffect } from 'react';
import type { Template } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { loadTemplates, loadFavorites, copyToCopilot, copyToClipboard, openInOutlook } from '@/lib/utils';

export default function FloatingFavorites() {
  const [open, setOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Template[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
    setItems(loadTemplates(STARTER_TEMPLATES));
  }, []);

  // Refresh on open
  useEffect(() => {
    if (open) {
      setFavorites(loadFavorites());
      setItems(loadTemplates(STARTER_TEMPLATES));
    }
  }, [open]);

  const favoriteItems = items.filter((t) => favorites.has(t.id));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center text-xl"
        title="Quick Favorites"
      >
        {open ? '✕' : '❤️'}
      </button>

      {/* Favorites panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[70vh] bg-white rounded-2xl border border-border shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border bg-surface-alt">
            <h3 className="font-bold text-sm text-text-primary">❤️ Quick Favorites</h3>
            <p className="text-xs text-text-muted mt-0.5">{favoriteItems.length} items</p>
          </div>

          <div className="overflow-y-auto max-h-[50vh] p-3 space-y-2">
            {favoriteItems.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No favorites yet.<br />Click ❤️ on any template to add it here.</p>
            ) : (
              favoriteItems.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-border hover:border-primary/30 hover:shadow-sm transition">
                  <h4 className="font-semibold text-xs text-text-primary truncate mb-1">{t.title}</h4>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-alt text-text-muted">{t.category}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-alt text-text-muted">{t.kind === 'prompt' ? '💡' : '✉️'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={async () => { await copyToCopilot(t.body); showToast('Copied & opened Copilot ✓'); }}
                      className="text-[10px] px-2 py-1 rounded-lg bg-surface-alt hover:bg-primary/10 text-text-secondary hover:text-primary transition"
                    >
                      🤖 Copilot
                    </button>
                    <button
                      onClick={async () => { await copyToClipboard(t.body); showToast('Copied ✓'); }}
                      className="text-[10px] px-2 py-1 rounded-lg bg-surface-alt hover:bg-primary/10 text-text-secondary hover:text-primary transition"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => openInOutlook(t.title, t.body)}
                      className="text-[10px] px-2 py-1 rounded-lg bg-surface-alt hover:bg-primary/10 text-text-secondary hover:text-primary transition"
                    >
                      ✉️ Outlook
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-text-primary text-white px-4 py-2 rounded-xl shadow-lg text-xs font-medium z-[60] animate-toast">
          {toast}
        </div>
      )}
    </>
  );
}
