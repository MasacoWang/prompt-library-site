'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Template } from '@/lib/types';
import { SCENARIOS, PHASES } from '@/lib/types';
import { STARTER_TEMPLATES } from '@/lib/data';
import { copyToCopilot, copyToClipboard, openInOutlook } from '@/lib/utils';

type TabKey = 'templates' | 'prompts' | 'scenarios' | 'phases';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'templates', label: 'Email Templates', icon: '✉️' },
  { key: 'prompts', label: 'Prompt Library', icon: '💡' },
  { key: 'scenarios', label: 'Scenarios', icon: '🎯' },
  { key: 'phases', label: 'Recruiting Phases', icon: '📊' },
];

function ItemCard({ item, onToast }: { item: Template; onToast: (msg: string) => void }) {
  return (
    <div className="card p-4 group card-enter">
      <div className="mb-2">
        <h4 className="font-semibold text-sm text-text-primary truncate">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="token-pill">{item.category}</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              item.kind === 'prompt'
                ? 'bg-purple-50 text-purple-600 border border-purple-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {item.kind === 'prompt' ? '💡 Prompt' : '✉️ Template'}
          </span>
        </div>
      </div>
      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3">
        {item.body.slice(0, 120)}
      </p>
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <button
          onClick={async () => { await copyToCopilot(item.body); onToast('Copied & opened Copilot ✓'); }}
          className="btn-ghost px-2 py-1 text-xs"
        >
          🤖 Copilot
        </button>
        <button
          onClick={async () => { await copyToClipboard(item.body); onToast('Copied ✓'); }}
          className="btn-ghost px-2 py-1 text-xs"
        >
          📋 Copy
        </button>
        <button
          onClick={() => openInOutlook(item.title, item.body)}
          className="btn-ghost px-2 py-1 text-xs"
        >
          ✉️ Outlook
        </button>
      </div>
    </div>
  );
}

function SplitList({ items, onToast, emptyLabel }: { items: Template[]; onToast: (msg: string) => void; emptyLabel: string }) {
  const templates = items.filter((i) => i.kind === 'template');
  const prompts = items.filter((i) => i.kind === 'prompt');

  return (
    <div className="mt-4 pl-2 sm:pl-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <div>
        <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">✉️ Email Templates</h5>
        {templates.length > 0 ? (
          <div className="space-y-3">{templates.map((t) => <ItemCard key={t.id} item={t} onToast={onToast} />)}</div>
        ) : (
          <p className="text-xs text-text-muted italic py-3">No templates for this {emptyLabel}</p>
        )}
      </div>
      <div>
        <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">💡 Prompts</h5>
        {prompts.length > 0 ? (
          <div className="space-y-3">{prompts.map((t) => <ItemCard key={t.id} item={t} onToast={onToast} />)}</div>
        ) : (
          <p className="text-xs text-text-muted italic py-3">No prompts for this {emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('templates');
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Switch tab based on URL hash (e.g. /#scenarios, /#phases)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'scenarios') setActiveTab('scenarios');
    else if (hash === 'phases') setActiveTab('phases');

    const onHash = () => {
      const h = window.location.hash.replace('#', '');
      if (h === 'scenarios') setActiveTab('scenarios');
      else if (h === 'phases') setActiveTab('phases');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const items = STARTER_TEMPLATES;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const emailTemplates = items.filter((t) => t.kind === 'template');
  const prompts = items.filter((t) => t.kind === 'prompt');
  const getByScenario = (key: string) => items.filter((t) => t.scenario?.includes(key));
  const getByPhase = (key: string) => items.filter((t) => t.phase?.includes(key));

  return (
    <div>
      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-2xl border border-border mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* ── Email Templates tab ── */}
      {activeTab === 'templates' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {emailTemplates.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} />
            ))}
          </div>
          {emailTemplates.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/templates" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {emailTemplates.length} Email Templates →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Prompt Library tab ── */}
      {activeTab === 'prompts' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prompts.slice(0, 6).map((t) => (
              <ItemCard key={t.id} item={t} onToast={showToast} />
            ))}
          </div>
          {prompts.length > 6 && (
            <div className="text-center mt-8">
              <Link href="/prompts" className="btn-secondary px-6 py-2.5 text-sm inline-flex items-center gap-1.5">
                View All {prompts.length} Prompts →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Scenarios tab ── */}
      {activeTab === 'scenarios' && (
        <div className="space-y-3 animate-fade-in">
          {SCENARIOS.map((sc) => {
            const matched = getByScenario(sc.key);
            const isExpanded = expandedScenario === sc.key;
            return (
              <div key={sc.key}>
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : sc.key)}
                  className={`w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all ${
                    isExpanded
                      ? 'bg-white border-2 border-primary shadow-md'
                      : 'card hover:border-primary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                    {sc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[15px] text-text-primary">{sc.label}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{sc.desc}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-text-muted bg-surface-alt px-2.5 py-1 rounded-full">
                      {matched.length} items
                    </span>
                    <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </div>
                </button>
                {isExpanded && (
                  <SplitList items={matched} onToast={showToast} emptyLabel="scenario" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Recruiting Phases tab ── */}
      {activeTab === 'phases' && (
        <div className="space-y-3 animate-fade-in">
          {PHASES.map((ph) => {
            const matched = getByPhase(ph.key);
            const isExpanded = expandedPhase === ph.key;
            return (
              <div key={ph.key}>
                <button
                  onClick={() => setExpandedPhase(isExpanded ? null : ph.key)}
                  className={`w-full text-left rounded-2xl p-5 flex items-center gap-4 transition-all ${
                    isExpanded
                      ? 'bg-white border-2 border-primary shadow-md'
                      : 'card hover:border-primary/30'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl shrink-0">
                    {ph.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[15px] text-text-primary">{ph.label}</h4>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-text-muted bg-surface-alt px-2.5 py-1 rounded-full">
                      {matched.length} items
                    </span>
                    <span className={`text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
                  </div>
                </button>
                {isExpanded && (
                  <SplitList items={matched} onToast={showToast} emptyLabel="phase" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium animate-toast z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
