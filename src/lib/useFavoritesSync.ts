'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useRef } from 'react';
import type { Template } from './types';

interface UserData {
  favorites: string[];
  userTemplates: Template[];
  customCategories: string[];
  deletedTemplateIds: string[];
}

/**
 * Hook that syncs ALL user data with the server when logged in.
 * Syncs: favorites, user-added/edited templates, custom categories, deleted template IDs.
 */
export function useFavoritesSync(
  favorites: Set<string>,
  setFavorites: (fn: (prev: Set<string>) => Set<string>) => void,
  options?: {
    templates?: Template[];
    starterTemplateIds?: Set<string>;
    setTemplates?: (fn: (prev: Template[]) => Template[]) => void;
    customCategories?: string[];
    setCustomCategories?: (cats: string[]) => void;
    deletedTemplateIds?: string[];
    setDeletedTemplateIds?: (ids: string[]) => void;
  }
) {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all user data from server on login
  useEffect(() => {
    if (status !== 'authenticated' || hasSynced.current) return;
    hasSynced.current = true;

    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data: UserData) => {
        // Merge favorites
        if (data.favorites && Array.isArray(data.favorites)) {
          setFavorites((prev) => new Set([...prev, ...data.favorites]));
        }
        // Merge user templates
        if (data.userTemplates && Array.isArray(data.userTemplates) && options?.setTemplates) {
          options.setTemplates((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newOnes = data.userTemplates.filter((t: Template) => !existingIds.has(t.id));
            // Also overwrite edited starter templates
            const edited = data.userTemplates.filter((t: Template) => existingIds.has(t.id));
            let merged = [...prev, ...newOnes];
            for (const edit of edited) {
              merged = merged.map((t) => (t.id === edit.id ? edit : t));
            }
            return merged;
          });
        }
        // Merge custom categories
        if (data.customCategories && Array.isArray(data.customCategories) && options?.setCustomCategories) {
          options.setCustomCategories(data.customCategories);
        }
        // Merge deleted template IDs
        if (data.deletedTemplateIds && Array.isArray(data.deletedTemplateIds) && options?.setDeletedTemplateIds) {
          options.setDeletedTemplateIds(data.deletedTemplateIds);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Debounced save to server
  const saveToServer = useCallback(() => {
    if (status !== 'authenticated') return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      const starterIds = options?.starterTemplateIds || new Set<string>();
      // Only save user-added or user-edited templates (not untouched starters)
      const userTemplates = (options?.templates || []).filter((t) => !starterIds.has(t.id));

      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favorites: Array.from(favorites),
          userTemplates,
          customCategories: options?.customCategories || [],
          deletedTemplateIds: options?.deletedTemplateIds || [],
        }),
      }).catch(() => {});
    }, 1000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, favorites, options?.templates, options?.customCategories, options?.deletedTemplateIds]);

  // Trigger save when any synced data changes
  useEffect(() => {
    if (status === 'authenticated' && hasSynced.current) {
      saveToServer();
    }
  }, [favorites, status, saveToServer]);

  return { isLoggedIn: status === 'authenticated', userName: session?.user?.name };
}
