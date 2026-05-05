export interface Template {
  id: string;
  title: string;
  category: string;
  kind: 'prompt' | 'template';
  kinds?: string[];
  body: string;
  casualBody?: string;
  pinned: boolean;
  scenario?: string[];
  phase?: string[];
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

export const SCENARIOS = [
  { key: 'outreach', label: 'Candidate Outreach', icon: '📨', desc: 'Cold outreach, follow-ups, and referral messages' },
  { key: 'interview-prep', label: 'Interview Preparation', icon: '🎯', desc: 'Scheduling, prep notes, and question banks' },
  { key: 'candidate-eval', label: 'Candidate Evaluation', icon: '📊', desc: 'Profile summaries, JD matching, and fit scoring' },
  { key: 'hm-communication', label: 'Hiring Manager Communication', icon: '📋', desc: 'Status reports, updates, and pipeline summaries' },
  { key: 'job-post', label: 'Create a Job Post', icon: '📝', desc: 'Job posting templates and prompts for any role' },
] as const;

export const PHASES = [
  { key: 'strategy', label: 'Strategy', icon: '🧭' },
  { key: 'sourcing', label: 'Sourcing', icon: '🔍' },
  { key: 'screening', label: 'Screening', icon: '📋' },
  { key: 'interview', label: 'Interview', icon: '🎤' },
  { key: 'offer', label: 'Offer', icon: '🤝' },
] as const;
