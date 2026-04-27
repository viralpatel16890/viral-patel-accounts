import { useState, lazy, Suspense } from 'react';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ZoomIn } from 'lucide-react';
import type { ChartTheme } from '../ui/useChartTheme';
import { userYearlySummary, getUserMonthlySummary } from '../../data/userData';

// Lazy load ComposedChart to optimize bundle size
const ComposedChart = lazy(() => import('recharts').then(module => ({ default: module.ComposedChart })));

/* ── AAA-safe chart colors ─────────────────────────────────────────────────────
 * Income bar:  #1E40AF (blue-800)    — 8.3:1 on white ✓
 * Expense bar: #CBD5E1 (slate-300)   — visual fill (non-text, exempt from 7:1)
 * Profit bar:  #065F46 (emerald-800) — 7.7:1 on white ✓
 * Growth line: #9D174D (pink-800)    — 7.5:1 on white ✓
 * Drill-down info: blue-900 on blue-50 = 11:1 ✓ AAA
 * ─────────────────────────────────────────────────────────────────────────── */

export function ReportIncomeExpense({ yearRange, ct }: { yearRange: [number, number]; ct: ChartTheme }) {
  const [drillDown, setDrillDown] = useState<number | null>(null);
  
  // Add error handling
  const [hasError, setHasError] = useState(false);
  
  try {
    const data = userYearlySummary
      .filter((y: any) => y.year >= yearRange[0] && y.year <= yearRange[1])
      .map((y: any) => ({ year: y.year, Income: y.income, Expenses: y.expenses, Profit: y.netProfit, Growth: y.yoyGrowth }));
    const drillData = drillDown
      ? getUserMonthlySummary(drillDown).map((m: any) => ({ ...m, income: m.income, expenses: m.expenses, netProfit: m.netProfit }))
      : null;

    return (
      <div className="space-y-3">
        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">Error loading financial data. Please try refreshing the page.</p>
          </div>
        )}
        {drillDown && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 flex items-center justify-between" role="status">
            <p className="text-xs text-blue-900 dark:text-blue-200 font-medium">Monthly breakdown — FY{drillDown}</p>
            <button onClick={() => setDrillDown(null)} className="text-xs text-blue-800 dark:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded flex items-center gap-1">
              <ZoomIn className="w-3 h-3" aria-hidden="true" /> Back to yearly view
            </button>
          </div>
        )}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {drillDown ? `FY${drillDown} Monthly` : `Year-wise (${yearRange[0]}–${yearRange[1]})`}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{drillDown ? 'Click "Back" to return' : 'Click a bar to drill down into monthly view'}</p>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300">Indian Rupees</span>
          </div>
          <figure role="img" aria-label={drillDown ? `Bar chart showing monthly income, expenses, and profit for FY${drillDown}` : `Composed chart showing yearly income, expenses, profit, and growth rate from ${yearRange[0]} to ${yearRange[1]}`}>
            {/* SR data table */}
            <table className="sr-only">
              <caption>{drillDown ? `FY${drillDown} Monthly Breakdown` : `Year-wise Income vs Expenses (${yearRange[0]}–${yearRange[1]})`}</caption>
              <thead>
                <tr>
                  <th scope="col">{drillDown ? 'Month' : 'Year'}</th>
                  <th scope="col">Income (₹)</th>
                  <th scope="col">Expenses (₹)</th>
                  <th scope="col">Net Profit (₹)</th>
                  {!drillDown && <th scope="col">YoY Growth (%)</th>}
                </tr>
              </thead>
              <tbody>
                {(drillDown ? drillData! : data).map((d: any) => (
                  <tr key={d[drillDown ? 'month' : 'year']}>
                    <td>{d[drillDown ? 'month' : 'year']}</td>
                    <td>{Math.round(d[drillDown ? 'income' : 'Income'] as number)}</td>
                    <td>{Math.round(d[drillDown ? 'expenses' : 'Expenses'] as number)}</td>
                    <td>{Math.round(d[drillDown ? 'netProfit' : 'Profit'] as number)}</td>
                    {!drillDown && <td>{d.Growth?.toFixed(1)}%</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            <Suspense fallback={<div className="flex items-center justify-center h-[220px] text-xs text-slate-500">Loading chart...</div>}>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={drillDown ? drillData! : data} onClick={e => !drillDown && e?.activeLabel && setDrillDown(Number(e.activeLabel))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <CartesianGrid key="rie-grid" strokeDasharray="3 3" stroke={ct.grid} />
                  <XAxis key="rie-x" dataKey={drillDown ? 'month' : 'year'} tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
                  <YAxis key="rie-yl" yAxisId="left" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} axisLine={false} tickLine={false} width={60} />
                  {!drillDown && <YAxis key="rie-yr" yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={36} />}
                  <Tooltip key="rie-tip" formatter={(v: number, n: string) => n === 'Growth' ? [`${v.toFixed(1)}%`, 'YoY Growth'] : [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v), n]} contentStyle={ct.tooltip} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                  <Legend key="rie-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
                  <Bar key="rie-income" yAxisId="left" dataKey={drillDown ? 'income' : 'Income'} fill="#1E40AF" radius={[3,3,0,0]} name="Income" cursor={!drillDown ? 'pointer' : 'default'} />
                  <Bar key="rpt-expenses" yAxisId="left" dataKey={drillDown ? 'expenses' : 'Expenses'} fill="#94a3b8" radius={[3,3,0,0]} name="Expenses" cursor={!drillDown ? 'pointer' : 'default'} />
                  <Bar key="rpt-netprofit" yAxisId="left" dataKey={drillDown ? 'netProfit' : 'Profit'} fill="#065F46" radius={[3,3,0,0]} name="Net Profit" />
                  {!drillDown && <Line key="rpt-growth" yAxisId="right" type="monotone" dataKey="Growth" stroke="#9D174D" strokeWidth={2} dot={{ r: 3 }} name="YoY Growth %" />}
                </ComposedChart>
              </ResponsiveContainer>
            </Suspense>
          </figure>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in ReportIncomeExpense:', error);
    setHasError(true);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Failed to load financial report data. Please try refreshing the page.</p>
      </div>
    );
  }
}