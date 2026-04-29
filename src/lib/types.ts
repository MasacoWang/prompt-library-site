export interface Template {
  id: string;
  title: string;
  category: string;
  kind: 'prompt' | 'template';
  body: string;
  casualBody?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'dashboard' | 'editor';
export type Tone = 'professional' | 'casual';
export type EditorMode = 'use' | 'edit';

export const CATEGORIES = [
  'Strategy',
  'Sourcing',
  'Screening',
  'Interview',
  'Offer',
] as const;
