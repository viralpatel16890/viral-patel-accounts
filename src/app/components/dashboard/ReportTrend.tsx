import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import type { ChartTheme } from '../ui/useChartTheme';
import { userYearlySummary } from '../../data/userData';

/* ── AAA contrast colors for chart lines/fills ─────────────────────────────
 * Revenue line:   #1E40AF (blue-800) — 8.3:1 on white ✓
 * Expense line:   #991B1B (red-800)  — 7.9:1 on white ✓
 * Profit area:    #065F46 (emerald-800) — 7.7:1 on white ✓
 * Pink line:      #9D174D (pink-800) — 7.5:1 on white ✓
 * Bar positive:   #065F46 ✓  |  Bar negative: #991B1B ✓
 * ─────────────────────────────────────────────────────────────────────────── */

export function ReportTrend({ ct }: { ct: ChartTheme }) {
  const yoyData = userYearlySummary.slice(1).map((y: any) => ({ year: y.year, 'YoY Growth': y.yoyGrowth }));
  const erData  = userYearlySummary.map((y: any) => ({ year: y.year, 'Expense Ratio': y.expenseRatio }));

  return (
    <div className="space-y-3">
      {/* 15-Year Revenue Trend */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">11-Year Revenue Trend</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">2015–2026 · Based on actual data</p>
          </div>
        </div>
        <figure role="img" aria-label="Area chart showing 15-year revenue, expenses, and net profit trend from 2010 to 2024">
          <table className="sr-only">
            <caption>15-Year Revenue Trend</caption>
            <thead><tr><th>Year</th><th>Income (₹)</th><th>Expenses (₹)</th><th>Net Profit (₹)</th></tr></thead>
            <tbody>{userYearlySummary.map((y: any) => <tr key={y.year}><td>{y.year}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(y.income)}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(y.expenses)}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(y.netProfit)}</td></tr>)}</tbody>
          </table>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userYearlySummary.map((y: any) => ({ year: y.year, Income: y.income, Expenses: y.expenses, Profit: y.netProfit }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rIG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1E40AF" stopOpacity={0.15} /><stop offset="95%" stopColor="#1E40AF" stopOpacity={0} /></linearGradient>
                <linearGradient id="rPG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#065F46" stopOpacity={0.15} /><stop offset="95%" stopColor="#065F46" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid key="rt-grid" strokeDasharray="3 3" stroke={ct.grid} />
              <XAxis key="rt-x" dataKey="year" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
              <YAxis key="rt-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} axisLine={false} tickLine={false} width={60} />
              <Tooltip key="rt-tip" formatter={(v: number) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v), '']} contentStyle={ct.tooltip} />
              <Legend key="rt-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
              <Area key="rt-area-income" type="monotone" dataKey="Income" stroke="#1E40AF" strokeWidth={2} fill="url(#rIG)" name="Income" />
              <Area key="rt-area-profit" type="monotone" dataKey="Profit" stroke="#065F46" strokeWidth={2} fill="url(#rPG)" name="Net Profit" />
              <Line key="rt-line-expenses" type="monotone" dataKey="Expenses" stroke="#991B1B" strokeWidth={1.5} dot={false} name="Expenses" strokeDasharray="6 3" />
            </AreaChart>
          </ResponsiveContainer>
        </figure>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* YoY Revenue Growth */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">YoY Revenue Growth (%)</p>
          <figure role="img" aria-label="Bar chart showing year-over-year revenue growth percentage">
            <table className="sr-only">
              <caption>YoY Revenue Growth</caption>
              <thead><tr><th>Year</th><th>Growth (%)</th></tr></thead>
              <tbody>{yoyData.map(d => <tr key={d.year}><td>{d.year}</td><td>{d['YoY Growth'].toFixed(1)}%</td></tr>)}</tbody>
            </table>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={yoyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid key="yoy-grid" strokeDasharray="3 3" stroke={ct.grid} />
                <XAxis key="yoy-x" dataKey="year" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
                <YAxis key="yoy-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={32} />
                <Tooltip key="yoy-tip" formatter={(v: number) => [`${v.toFixed(1)}%`, 'YoY']} contentStyle={ct.tooltip} />
                <Bar key="yoy-bar" dataKey="YoY Growth" radius={[2,2,0,0]}>
                  {userYearlySummary.slice(1).map((y: any, i: any) => <Cell key={i} fill={y.yoyGrowth >= 0 ? '#065F46' : '#991B1B'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </figure>
        </div>

        {/* Expense Ratio Trend */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3">Expense Ratio Trend (%)</p>
          <figure role="img" aria-label="Line chart showing expense ratio trend over 15 years">
            <table className="sr-only">
              <caption>Expense Ratio by Year</caption>
              <thead><tr><th>Year</th><th>Expense Ratio (%)</th></tr></thead>
              <tbody>{erData.map(d => <tr key={d.year}><td>{d.year}</td><td>{d['Expense Ratio'].toFixed(1)}%</td></tr>)}</tbody>
            </table>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={erData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid key="er-grid" strokeDasharray="3 3" stroke={ct.grid} />
                <XAxis key="er-x" dataKey="year" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
                <YAxis key="er-y" domain={[60, 80]} tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} width={32} />
                <Tooltip key="er-tip" formatter={(v: number) => [`${v.toFixed(1)}%`, 'Expense Ratio']} contentStyle={ct.tooltip} />
                <Line key="er-line" type="monotone" dataKey="Expense Ratio" stroke="#9D174D" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </figure>
        </div>
      </div>
    </div>
  );
}