import { useState } from 'react';
import {
  Lightbulb, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Search, Eye, ArrowRight, Zap
} from 'lucide-react';
import { insights } from '../data/userData';
import type { Insight } from '../data/types';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageShell, PageHeader } from '../components/ui/PageShell';

const severityConfig = {
  high:   { label: 'High Risk',   bg: 'bg-red-50 dark:bg-red-950/30',     border: 'border-red-200 dark:border-red-900/50',     badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',     icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />,   dot: 'bg-red-500' },
  medium: { label: 'Medium Risk', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300', icon: <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden="true" />,              dot: 'bg-amber-500' },
  low:    { label: 'Low Risk',    bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900/50', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300', icon: <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />, dot: 'bg-emerald-500' },
};

const actionConfig = {
  Review: { color: 'bg-blue-600 hover:bg-blue-700 text-white', icon: <Eye className="w-3.5 h-3.5" aria-hidden="true" /> },
  Optimize: { color: 'bg-teal-600 hover:bg-teal-700 text-white', icon: <Zap className="w-3.5 h-3.5" aria-hidden="true" /> },
  Reclassify: { color: 'bg-purple-600 hover:bg-purple-700 text-white', icon: <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> },
  Investigate: { color: 'bg-red-600 hover:bg-red-700 text-white', icon: <Search className="w-3.5 h-3.5" aria-hidden="true" /> },
};

const trendIcon = {
  up: <TrendingUp className="w-4 h-4 text-red-700 dark:text-red-300" aria-hidden="true" />,
  down: <TrendingDown className="w-4 h-4 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />,
  stable: <Minus className="w-4 h-4 text-blue-700 dark:text-blue-300" aria-hidden="true" />,
};

function InsightCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[insight.severity];
  const act = actionConfig[insight.action];

  return (
    <article
      className={`rounded-xl border ${cfg.bg} ${cfg.border} overflow-hidden transition-all duration-200`}
      aria-label={`${insight.title} — ${cfg.label}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.badge}`} aria-hidden="true">
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-semibold mb-1 ${cfg.badge}`}>{cfg.label}</span>
                <h2 className="text-slate-900 dark:text-white">{insight.title}</h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {trendIcon[insight.trend]}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                {trendIcon[insight.trend]}
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{insight.metric}</span>
              </div>
              <span className="text-xs text-slate-700 dark:text-slate-300">Category: {insight.category}</span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{insight.description}</p>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">AI Analysis</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{insight.aiExplanation}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Impact Assessment</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{insight.impact}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Severity</p>
                <p className={`text-xs font-semibold ${cfg.badge.split(' ')[1]}`}>{cfg.label}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{insight.category}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Trend</p>
                <div className="flex items-center justify-center">{trendIcon[insight.trend]}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Key Metric</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{insight.metric}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Recommended Action</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{insight.action} — {insight.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-3 bg-white/60 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
          aria-expanded={expanded}
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />Collapse</> : <><ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />Expand details</>}
        </button>
        <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${act.color}`}
          aria-label={`${insight.action} — ${insight.title}`}
        >
          {act.icon}
          {insight.action}
        </button>
      </div>
    </article>
  );
}

export default function Insights() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = insights.filter(ins => {
    if (severityFilter !== 'all' && ins.severity !== severityFilter) return false;
    if (categoryFilter !== 'All' && ins.category !== categoryFilter) return false;
    if (search && !ins.title.toLowerCase().includes(search.toLowerCase()) && !ins.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const highCount = insights.filter(i => i.severity === 'high').length;
  const medCount = insights.filter(i => i.severity === 'medium').length;
  const lowCount = insights.filter(i => i.severity === 'low').length;

  return (
    <PageShell>
      <PageHeader title="AI Financial Insights" description={`${filtered.length} insights · Powered by anomaly detection`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" aria-hidden="true" />
          Auto-refreshed daily
        </div>
      </PageHeader>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'High Risk', count: highCount, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
          { label: 'Medium Risk', count: medCount, color: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' },
          { label: 'Low Risk', count: lowCount, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
            <p className="text-3xl font-bold">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border elevation-1 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input type="search" placeholder="Search insights…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" aria-label="Search insights" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as const).map(s => (
            <Button key={s} variant={severityFilter === s ? 'blue' : 'outline'} size="xs" onClick={() => setSeverityFilter(s)} aria-pressed={severityFilter === s} className="capitalize">{s === 'all' ? 'All' : s}</Button>
          ))}
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="text-sm px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Filter by category">
          {['All', ...Array.from(new Set(insights.map(i => i.category)))].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Insight Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 font-medium">No insights match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the severity or action filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* High Risk First */}
          {filtered.filter(i => i.severity === 'high').length > 0 && (
            <section aria-labelledby="high-risk-section">
              <h2 id="high-risk-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                High Risk — Immediate Action Required
              </h2>
              <div className="space-y-3">
                {filtered.filter(i => i.severity === 'high').map(ins => <InsightCard key={ins.id} insight={ins} />)}
              </div>
            </section>
          )}
          {filtered.filter(i => i.severity === 'medium').length > 0 && (
            <section aria-labelledby="med-risk-section">
              <h2 id="med-risk-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                Medium Risk — Review Recommended
              </h2>
              <div className="space-y-3">
                {filtered.filter(i => i.severity === 'medium').map(ins => <InsightCard key={ins.id} insight={ins} />)}
              </div>
            </section>
          )}
          {filtered.filter(i => i.severity === 'low').length > 0 && (
            <section aria-labelledby="low-risk-section">
              <h2 id="low-risk-section" className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                Low Risk — Informational
              </h2>
              <div className="space-y-3">
                {filtered.filter(i => i.severity === 'low').map(ins => <InsightCard key={ins.id} insight={ins} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}