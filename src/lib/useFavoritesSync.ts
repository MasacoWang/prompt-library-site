'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook that syncs favorites with the server when user is logged in.
 * - On login: loads server favorites and merges with local
 * - On favorite change: saves to server
 */
export function useFavoritesSync(
  favorites: Set<string>,
  setFavorites: (fn: (prev: Set<string>) => Set<string>) => void
) {
  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  // Load favorites from server on login
  useEffect(() => {
    if (status !== 'authenticated' || hasSynced.current) return;
    hasSynced.current = true;

    fetch('/api/favorites')
      .then((res) => res.json())
      .then((data) => {
        if (data.favorites && Array.isArray(data.favorites)) {
          setFavorites((prev) => {
            const merged = new Set([...prev, ...data.favorites]);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [status, setFavorites]);

  // Save favorites to server when they change (debounced)
  const saveToServer = useCallback(
    (favs: Set<string>) => {
      if (status !== 'authenticated') return;
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: Array.from(favs) }),
      }).catch(() => {});
    },
    [status]
  );

  // Save when favorites change and user is logged in
  useEffect(() => {
    if (status === 'authenticated' && hasSynced.current) {
      saveToServer(favorites);
    }
  }, [favorites, status, saveToServer]);

  return { isLoggedIn: status === 'authenticated', userName: session?.user?.name };
}
