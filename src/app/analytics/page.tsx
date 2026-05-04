'use client';

import { useState, useEffect } from 'react';
import { STARTER_TEMPLATES } from '@/lib/data';
import { useAllStarters } from '@/lib/useAllStarters';
import { loadViewCounts, loadTemplates } from '@/lib/utils';

const PASSCODE = 'airt2026';

export default function AnalyticsPage() {
  const { allStarters } = useAllStarters();
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [templates, setTemplates] = useState<typeof STARTER_TEMPLATES>([]);

  useEffect(() => {
    if (authenticated) {
      setViewCounts(loadViewCounts());
      setTemplates(loadTemplates(allStarters));
    }
  }, [authenticated, allStarters]);

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2">🔒 Analytics</h1>
          <p className="text-sm text-text-muted mb-6">Enter passcode to view dashboard</p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && code === PASSCODE) setAuthenticated(true); }}
            placeholder="Passcode"
            className="input-field mb-4"
          />
          <button
            onClick={() => { if (code === PASSCODE) setAuthenticated(true); }}
            className="btn-primary w-full py-2.5 text-sm font-semibold"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalViews = Object.values(viewCounts).reduce((a, b) => a + b, 0);
  const totalTemplates = templates.length;
  const viewedTemplates = Object.keys(viewCounts).filter(k => viewCounts[k] > 0).length;

  const topTemplates = templates
    .map(t => ({ ...t, views: viewCounts[t.id] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const categoryStats = templates.reduce((acc, t) => {
    const cat = t.category;
    if (!acc[cat]) acc[cat] = { views: 0, count: 0 };
    acc[cat].views += viewCounts[t.id] || 0;
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { views: number; count: number }>);

  const kindStats = templates.reduce((acc, t) => {
    const kind = t.kind;
    if (!acc[kind]) acc[kind] = { views: 0, count: 0 };
    acc[kind].views += viewCounts[t.id] || 0;
    acc[kind].count += 1;
    return acc;
  }, {} as Record<string, { views: number; count: number }>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-text-primary">📊 Analytics Dashboard</h1>
        <span className="text-xs text-text-muted bg-surface-alt px-3 py-1.5 rounded-lg">Local device data</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalViews}</div>
          <div className="text-xs text-text-muted mt-1">Total Views</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalTemplates}</div>
          <div className="text-xs text-text-muted mt-1">Total Templates</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{viewedTemplates}</div>
          <div className="text-xs text-text-muted mt-1">Templates Viewed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalTemplates > 0 ? Math.round((viewedTemplates / totalTemplates) * 100) : 0}%</div>
          <div className="text-xs text-text-muted mt-1">Coverage</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates */}
        <div className="card p-5">
          <h2 className="font-bold text-text-primary mb-4">🔥 Top 10 Most Viewed</h2>
          <div className="space-y-2">
            {topTemplates.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs font-bold text-text-muted w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{t.title}</div>
                  <div className="text-[10px] text-text-muted">{t.category} • {t.kind}</div>
                </div>
                <span className="text-sm font-bold text-primary">{t.views}</span>
              </div>
            ))}
            {topTemplates.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">No views yet</p>
            )}
          </div>
        </div>

        {/* Category & Kind breakdown */}
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-bold text-text-primary mb-4">📁 Views by Category</h2>
            <div className="space-y-2">
              {Object.entries(categoryStats)
                .sort((a, b) => b[1].views - a[1].views)
                .map(([cat, stats]) => (
                  <div key={cat} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-text-primary">{cat}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{stats.count} items</span>
                      <span className="text-sm font-bold text-primary w-10 text-right">{stats.views}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-text-primary mb-4">📋 Views by Type</h2>
            <div className="space-y-2">
              {Object.entries(kindStats)
                .sort((a, b) => b[1].views - a[1].views)
                .map(([kind, stats]) => (
                  <div key={kind} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-text-primary">
                      {kind === 'prompt' ? '💡 Prompts' : kind === 'copywriting' ? '📝 Job Posts' : '✉️ Email Templates'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{stats.count} items</span>
                      <span className="text-sm font-bold text-primary w-10 text-right">{stats.views}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-8 card p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Note:</strong> This shows usage data from this device/browser. For real visitor analytics (unique visitors, countries, devices),
          check your <a href="https://vercel.com/masacowork-9507s-projects/prompt-library-site/analytics" target="_blank" className="underline font-semibold">Vercel Analytics dashboard</a>.
        </p>
      </div>
    </div>
  );
}
