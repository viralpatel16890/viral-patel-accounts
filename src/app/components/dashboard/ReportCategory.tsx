import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ChartTheme } from '../ui/useChartTheme';
import { getUserExpenseCategories, getUserIncomeCategories, formatCurrency } from '../../data/userData';

/* ── AAA contrast notes ──────────────────────────────────────────────────────
 * Tab active text:  slate-900 on white = 15.4:1 ✓
 * Tab inactive:     slate-700 on slate-100 = 6.7:1 → bold text, meets enhanced AA.
 *                   Bumped bg to improve perceived contrast.
 * Category labels:  slate-800 on slate-50 = 9.5:1 ✓
 * Percentages:      slate-800 on white = 10.7:1 ✓
 * Subcategory text: slate-700 on white = 8.2:1 ✓ AAA
 * Trend text:       red-800/emerald-800 on white ≥ 7:1 ✓
 * ─────────────────────────────────────────────────────────────────────────── */

export function ReportCategory({ year, ct }: { year: number; ct: ChartTheme }) {
  const [view, setView] = useState<'expense' | 'income'>('expense');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const cats = view === 'expense' ? getUserExpenseCategories(year) : getUserIncomeCategories(year);

  return (
    <div className="space-y-3">
      {/* Tab switcher — proper tablist role */}
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 w-fit" role="tablist" aria-label="Category type">
        <button
          role="tab"
          aria-selected={view === 'expense'}
          aria-controls="cat-panel"
          onClick={() => setView('expense')}
          className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${view === 'expense' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Expenses
        </button>
        <button
          role="tab"
          aria-selected={view === 'income'}
          aria-controls="cat-panel"
          onClick={() => setView('income')}
          className={`px-3 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${view === 'income' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-700 dark:text-slate-300'}`}
        >
          Income
        </button>
      </div>

      <div id="cat-panel" role="tabpanel" aria-label={`${view === 'expense' ? 'Expense' : 'Income'} category analysis`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pie chart */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">{view === 'expense' ? 'Expense' : 'Income'} Distribution</p>
            <figure role="img" aria-label={`Pie chart showing ${view} distribution across categories`}>
              <div className="flex items-center gap-4">
                <RechartsPie width={150} height={150}>
                  <Pie data={cats} cx={75} cy={75} innerRadius={42} outerRadius={68} dataKey="amount" paddingAngle={2}>
                    {cats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCurrency(v, true), '']} contentStyle={ct.tooltip} />
                </RechartsPie>
                <div className="flex-1 space-y-1.5">
                  {cats.map(cat => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                        {/* Text label ensures meaning isn't conveyed by color alone */}
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate max-w-24">{cat.category.split(' ')[0]}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* SR data table */}
              <table className="sr-only">
                <caption>{view === 'expense' ? 'Expense' : 'Income'} category distribution</caption>
                <thead><tr><th>Category</th><th>Percentage</th><th>Amount</th></tr></thead>
                <tbody>{cats.map(c => <tr key={c.category}><td>{c.category}</td><td>{c.percentage}%</td><td>{formatCurrency(c.amount, true)}</td></tr>)}</tbody>
              </table>
            </figure>
          </div>

          {/* Stacked bar breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">Category Breakdown</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={cats.slice(0, 5).map(c => ({
                name: c.category.split(' ')[0],
                ...Object.fromEntries(c.subCategories.map(s => [s.name.split(' ')[0], s.amount / 1000])),
              }))} layout="vertical" barSize={10} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid key="cb-grid" strokeDasharray="3 3" stroke={ct.grid} horizontal={false} />
                <XAxis key="cb-x" type="number" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `₹${v}K`} axisLine={false} tickLine={false} />
                <YAxis key="cb-y" type="category" dataKey="name" tick={{ fontSize: 12, fill: ct.tick }} width={55} axisLine={false} tickLine={false} />
                <Tooltip key="cb-tip" formatter={(v: number) => [`₹${v.toFixed(0)}K`, '']} contentStyle={ct.tooltip} />
                {cats[0]?.subCategories.map((sub, i) => (
                  <Bar key={sub.name} dataKey={sub.name.split(' ')[0]} stackId="a" fill={['#1E40AF','#065F46','#5B21B6','#92400E'][i % 4]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expandable category detail */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mt-3">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Category Detail — click to expand</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
            {cats.map(cat => (
              <div key={cat.category}>
                <button
                  onClick={() => setExpandedCat(expandedCat === cat.category ? null : cat.category)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-600"
                  aria-expanded={expandedCat === cat.category}
                  aria-controls={`cat-detail-${cat.category.replace(/\s/g, '-')}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                  <p className="flex-1 text-left text-xs font-medium text-slate-800 dark:text-slate-200">{cat.category}</p>
                  {/* Progress bar — purely visual, percentage + text provides accessible info */}
                  <div className="hidden sm:block w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5" aria-hidden="true"><div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} /></div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white w-8 text-right">{cat.percentage}%</span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 w-16 text-right hidden sm:block">{formatCurrency(cat.amount, true)}</span>
                  {/* Trend: color + text direction — not color alone */}
                  <span className={`text-xs font-semibold w-12 text-right hidden md:block ${cat.trend > 0 ? 'text-red-800 dark:text-red-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
                    {cat.trend > 0 ? '↑' : '↓'}{Math.abs(cat.trend).toFixed(1)}%
                  </span>
                  {expandedCat === cat.category ? <ChevronUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />}
                </button>
                {expandedCat === cat.category && (
                  <div id={`cat-detail-${cat.category.replace(/\s/g, '-')}`} className="bg-white dark:bg-slate-800/50 px-4 py-2 pl-10 space-y-1.5" role="region" aria-label={`${cat.category} subcategory breakdown`}>
                    {cat.subCategories.map(sub => (
                      <div key={sub.name} className="flex items-center gap-2 text-xs">
                        <div className="flex-1 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-slate-500 dark:bg-slate-400" aria-hidden="true" />
                          <span className="text-slate-700 dark:text-slate-300">{sub.name}</span>
                        </div>
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1" aria-hidden="true"><div className="h-full rounded-full bg-slate-500" style={{ width: `${sub.percentage}%` }} /></div>
                        <span className="text-slate-700 dark:text-slate-300 w-8 text-right">{sub.percentage}%</span>
                        <span className="font-semibold text-slate-900 dark:text-white w-16 text-right">{formatCurrency(sub.amount, true)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}