export function extractVariables(body: string): string[] {
  const regex = /\[([^\]]+)\]/g;
  const vars = new Set<string>();
  let match;
  while ((match = regex.exec(body)) !== null) {
    vars.add(match[1]);
  }
  return Array.from(vars);
}

export function substituteVariables(body: string, values: Record<string, string>): string {
  let result = body;
  for (const [key, value] of Object.entries(values)) {
    if (value) result = result.replaceAll(`[${key}]`, value);
  }
  return result;
}

const COPILOT_URL = 'https://m365.cloud.microsoft/chat';

export async function copyToCopilot(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
  window.open(COPILOT_URL, '_blank');
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function openInOutlook(subject: string, body: string): void {
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}

export function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

import type { Template } from './types';

const STORAGE_KEY = 'recruiter-vault-templates';

export function loadTemplates(starters: Template[]): Template[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge: always keep starter templates up-to-date, preserve user additions
        const starterIds = new Set(starters.map((s) => s.id));
        const starterTitles = new Set(starters.map((s) => s.title.toLowerCase()));
        // Filter out old stored copies of starters (by id OR title match)
        const userAdded = parsed.filter((t: Template) =>
          !starterIds.has(t.id) && !starterTitles.has(t.title.toLowerCase())
        );
        // Deduplicate user-added by title
        const seenTitles = new Set(starters.map((s) => s.title.toLowerCase()));
        const uniqueUserAdded = userAdded.filter((t: Template) => {
          const key = t.title.toLowerCase();
          if (seenTitles.has(key)) return false;
          seenTitles.add(key);
          return true;
        });
        const merged = [...starters, ...uniqueUserAdded];
        saveTemplates(merged);
        return merged;
      }
    } catch { /* fall through */ }
  }
  saveTemplates(starters);
  return starters;
}

export function saveTemplates(templates: Template[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export async function exportTemplates(templates: Template[]): Promise<void> {
  const XLSX = await import('xlsx');

  const rows = templates.map((t, i) => ({
    '#': i + 1,
    'Title': t.title,
    'Category': t.category,
    'Type': t.kind,
    'Body': t.body,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto-width columns
  ws['!cols'] = [
    { wch: 4 },   // #
    { wch: 35 },  // Title
    { wch: 15 },  // Category
    { wch: 10 },  // Type
    { wch: 80 },  // Body
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Templates');
  XLSX.writeFile(wb, 'recruiter-toolkit-export.xlsx');
}

// ── Favorites ──
const FAVORITES_KEY = 'recruiter-vault-favorites';

export function loadFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

export function saveFavorites(favorites: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
}

export function toggleFavorite(favorites: Set<string>, id: string): Set<string> {
  const next = new Set(favorites);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveFavorites(next);
  return next;
}

// ── View Counts ──
const VIEWS_KEY = 'recruiter-vault-views';

export function loadViewCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(VIEWS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {};
}

export function incrementViewCount(id: string): Record<string, number> {
  const counts = loadViewCounts();
  counts[id] = (counts[id] || 0) + 1;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(counts));
  return counts;
}

export function importTemplates(file: File): Promise<Template[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) resolve(data);
        else reject(new Error('Invalid format'));
      } catch { reject(new Error('Invalid JSON')); }
    };
    reader.readAsText(file);
  });
}
