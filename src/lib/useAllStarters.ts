'use client';

import { useMemo } from 'react';
import type { Template } from './types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { useSharedTemplates } from './useSharedTemplates';

/**
 * Returns all "base" templates: hardcoded starters + admin-shared from KV.
 * Use this instead of STARTER_TEMPLATES directly.
 */
export function useAllStarters() {
  const { sharedTemplates, loading, fetchShared, addSharedTemplate, deleteSharedTemplate } = useSharedTemplates();
  const starterIds = useMemo(() => new Set(STARTER_TEMPLATES.map(t => t.id)), []);

  const allStarters: Template[] = useMemo(() => {
    const shared = sharedTemplates.filter(st => !starterIds.has(st.id));
    return [...STARTER_TEMPLATES, ...shared];
  }, [sharedTemplates, starterIds]);

  return { allStarters, sharedTemplates, loading, fetchShared, addSharedTemplate, deleteSharedTemplate };
}
