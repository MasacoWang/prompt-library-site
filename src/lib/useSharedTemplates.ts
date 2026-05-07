'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Template } from './types';

export function useSharedTemplates() {
  const [sharedTemplates, setSharedTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShared = useCallback(async () => {
    try {
      const res = await fetch('/api/templates', { cache: 'no-store' });
      const data = await res.json();
      setSharedTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch {
      setSharedTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShared();
  }, [fetchShared]);

  const addSharedTemplate = async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await fetchShared();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to add template' };
    }
  };

  const deleteSharedTemplate = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await fetchShared();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to delete template' };
    }
  };

  const updateSharedTemplate = async (template: Partial<Template> & { id: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await fetchShared();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to update template' };
    }
  };

  return { sharedTemplates, loading, fetchShared, addSharedTemplate, updateSharedTemplate, deleteSharedTemplate };
}
