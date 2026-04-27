import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import type { ChartTheme } from '../ui/useChartTheme';
import { getBudgetDataForYear, formatCurrency } from '../../data/mockData';

/* ── AAA contrast notes ─────────────────────────────────────────────────────
 * Table header text:  slate-700 on slate-100 = 6.7:1 (semibold uppercase → enhanced AA)
 * Table body text:    slate-800 on white = 10.7:1 ✓ AAA
 * Secondary values:   slate-700 on white = 8.2:1 ✓ AAA
 * Variance positive:  emerald-800 on white = 7.2:1 ✓ AAA
 * Variance negative:  red-800 on white = 8.0:1 ✓ AAA
 * Status badges: emerald-900/amber-900/red-900 on respective 50 bg ≥ 7:1 ✓
 * Chart fills:   #475569 (slate-600) for budgeted, #065F46/#991B1B for actual
 * ─────────────────────────────────────────────────────────────────────────── */

export function ReportBudget({ year, ct }: { year: number; ct: ChartTheme }) {
  const yearBudget = getBudgetDataForYear(year);

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">Budget vs Actual — FY{year}</p>
        <figure role="img" aria-label={`Grouped bar chart comparing budgeted versus actual spending across categories for fiscal year ${year}`}>
          <table className="sr-only">
            <caption>Budget vs Actual — FY{year}</caption>
            <thead><tr><th scope="col">Category</th><th scope="col">Budgeted (₹M)</th><th scope="col">Actual (₹M)</th><th scope="col">Variance (%)</th></tr></thead>
            <tbody>{yearBudget.map(b => <tr key={b.category}><td>{b.category}</td><td>{(b.budgeted / 1_000_000).toFixed(1)}</td><td>{(b.actual / 1_000_000).toFixed(1)}</td><td>{b.variancePct.toFixed(1)}%</td></tr>)}</tbody>
          </table>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearBudget.map(b => ({ name: b.category.split(' ')[0], Budgeted: b.budgeted / 1_000_000, Actual: b.actual / 1_000_000 }))} barSize={16} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid key="bva-grid" strokeDasharray="3 3" stroke={ct.grid} />
              <XAxis key="bva-x" dataKey="name" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
              <YAxis key="bva-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `₹${v}M`} axisLine={false} tickLine={false} width={42} />
              <Tooltip key="bva-tip" formatter={(v: number) => [`₹${v.toFixed(1)}M`, '']} contentStyle={ct.tooltip} />
              <Legend key="bva-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
              <Bar key="bva-budgeted" dataKey="Budgeted" fill="#475569" radius={[2,2,0,0]} />
              <Bar key="budget-actual" dataKey="Actual" radius={[2,2,0,0]}>
                {yearBudget.map((b, i) => <Cell key={i} fill={b.variance >= 0 ? '#065F46' : '#991B1B'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </figure>
      </div>

      {/* Data table — fully accessible */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-xs" aria-label={`Budget versus actual breakdown for FY${year}`}>
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th scope="col" className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Category</th>
                <th scope="col" className="px-3 py-2 text-right text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Budgeted</th>
                <th scope="col" className="px-3 py-2 text-right text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Actual</th>
                <th scope="col" className="px-3 py-2 text-right text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Variance</th>
                <th scope="col" className="px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {yearBudget.map(b => {
                const statusText = b.variance >= 0 ? 'Under budget' : Math.abs(b.variancePct) > 8 ? 'Over budget — attention needed' : 'Slightly over budget';
                return (
                  <tr key={b.category} className="hover:bg-white dark:hover:bg-slate-700/30">
                    <th scope="row" className="px-3 py-2 font-medium text-left text-slate-800 dark:text-slate-200">{b.category}</th>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(b.budgeted, true)}</td>
                    <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-300">{formatCurrency(b.actual, true)}</td>
                    <td className={`px-3 py-2 text-right font-semibold ${b.variance >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                      {b.variance >= 0 ? '+' : ''}{b.variancePct.toFixed(1)}%
                      <span className="sr-only"> — {statusText}</span>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        b.variance >= 0
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300'
                          : Math.abs(b.variancePct) > 8
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-300'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300'
                      }`}>
                        {b.variance >= 0 ? 'Under' : Math.abs(b.variancePct) > 8 ? 'Over !' : '~Over'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}