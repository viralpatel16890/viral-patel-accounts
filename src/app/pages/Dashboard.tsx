import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, TrendingDown, TrendingUp, AlertTriangle,
  BarChart3, Flag, Activity, GitCompareArrows,
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '../components/ui/button';
import { PageShell } from '../components/ui/PageShell';
import { KPICard } from '../components/dashboard/KPICard';
import { AccordionSection } from '../components/dashboard/AccordionSection';
import { MonthlyLineChart } from '../components/dashboard/MonthlyLineChart';
import { TenYearBarChart } from '../components/dashboard/TenYearBarChart';
import { ReportIncomeExpense } from '../components/dashboard/ReportIncomeExpense';
import { ReportCategory } from '../components/dashboard/ReportCategory';
import { ReportTrend } from '../components/dashboard/ReportTrend';
import { ReportBudget } from '../components/dashboard/ReportBudget';
import { ReportExportButton } from '../components/dashboard/ReportExport';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useApp } from '../context/AppContext';
import { useChartTheme } from '../components/ui/useChartTheme';
import {
  userYearlySummary, formatCurrency, formatPct,
  getUserKpiForYear, getUserMonthlySummary,
  getUserExpenseCategories, getUserTransactionsForYear,
  getAllUserKpi, getAllUserMonthlySummary,
  getAllUserExpenseCategories, getAllUserTransactions,
} from '../data/userData';

// ─── Mini stat pill ───────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${color}`}>
      <span className="text-current opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

// ─── Comparison Overlay Chart ─────────────────────────────────────────────────
function ComparisonChart({ year, compareYear }: { year: number; compareYear: number }) {
  const ct = useChartTheme();
  const currentMonthly = getUserMonthlySummary(year);
  const prevMonthly = getUserMonthlySummary(compareYear);

  const data = currentMonthly.map((m, i) => ({
    month: m.month,
    [`Revenue FY${year}`]: m.income / 1_000_000,
    [`Revenue FY${compareYear}`]: prevMonthly[i].income / 1_000_000,
    [`Profit FY${year}`]: m.netProfit / 1_000_000,
    [`Profit FY${compareYear}`]: prevMonthly[i].netProfit / 1_000_000,
  }));

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-300" aria-hidden="true" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            FY{year} vs FY{compareYear} — Monthly Comparison
          </p>
        </div>
        <span className="text-xs text-slate-700 dark:text-slate-300">₹ Millions</span>
      </div>
      <figure role="img" aria-label={`Line chart comparing monthly revenue and profit between FY${year} and FY${compareYear}`}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid key="cmp-grid" strokeDasharray="3 3" stroke={ct.grid} />
            <XAxis key="cmp-x" dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
            <YAxis key="cmp-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `₹${v}M`} axisLine={false} tickLine={false} width={42} />
            <Tooltip key="cmp-tip" formatter={(v: number) => [`₹${v.toFixed(2)}M`, '']} contentStyle={ct.tooltip} />
            <Legend key="cmp-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
            <Line key="cmp-rev-cur" type="monotone" dataKey={`Revenue FY${year}`} stroke="#1E40AF" strokeWidth={2} dot={false} />
            <Line key="cmp-rev-prev" type="monotone" dataKey={`Revenue FY${compareYear}`} stroke="#1E40AF" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.5} />
            <Line key="cmp-prof-cur" type="monotone" dataKey={`Profit FY${year}`} stroke="#065F46" strokeWidth={2} dot={false} />
            <Line key="cmp-prof-prev" type="monotone" dataKey={`Profit FY${compareYear}`} stroke="#065F46" strokeWidth={1.5} strokeDasharray="5 3" dot={false} opacity={0.5} />
          </LineChart>
        </ResponsiveContainer>
      </figure>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { selectedYear, compareMode, compareYear, showAllData, dataVersion, dataSource } = useApp();
  const ct = useChartTheme();
  const [activeInsights, setActiveInsights] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState(2015);
  const [yearTo,   setYearTo]   = useState(2026);

  const yearKpi     = useMemo(() => showAllData ? getAllUserKpi() : getUserKpiForYear(selectedYear), [selectedYear, showAllData, dataVersion]);
  const yearMonthly = useMemo(() => showAllData ? getAllUserMonthlySummary() : getUserMonthlySummary(selectedYear), [selectedYear, showAllData, dataVersion]);
  const yearExpCats = useMemo(() => showAllData ? getAllUserExpenseCategories() : getUserExpenseCategories(selectedYear), [selectedYear, showAllData, dataVersion]);
  const yearTxns    = useMemo(() => showAllData ? getAllUserTransactions() : getUserTransactionsForYear(selectedYear), [selectedYear, showAllData, dataVersion]);

  // Comparison data
  const compKpi = useMemo(() => compareMode ? getUserKpiForYear(compareYear) : null, [compareMode, compareYear, dataVersion]);

  const flaggedTxns  = yearTxns.filter(t => t.status === 'flagged');
  const highInsights: any[] = [];
  const COLORS       = yearExpCats.slice(0, 5).map(c => c.color);

  const toggle = (id: string) => setActiveInsights(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  return (
    <PageShell className="max-w-[1600px]">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4"
      >
        <div>
          <h1 className="text-slate-900 dark:text-white">Dashboard</h1>
          {/* slate-700 on white = 8.2:1 ✓ AAA */}
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            {showAllData ? `All Years (2015-2026)` : `FY ${selectedYear}`}{compareMode ? ` vs FY ${compareYear}` : ''} · Last updated 15 min ago
          </p>
        </div>
        <div className="flex items-center gap-2">
          {compareMode && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-800">
              <GitCompareArrows className="w-3 h-3" aria-hidden="true" />
              Comparing
            </span>
          )}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${dataSource === 'google-sheets' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'google-sheets' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-500'}`} aria-hidden="true" />
            {dataSource === 'google-sheets' ? 'Google Sheets' : 'Local Backup'}
          </span>
        </div>
      </motion.div>

      {/* ── Alert strip ──────────────────────────────────────────────────── */}
      {(flaggedTxns.length > 0 || highInsights.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40" role="alert"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-700 dark:text-red-300 shrink-0" aria-hidden="true" />
          <span className="text-xs font-semibold text-red-900 dark:text-red-200">Action Required:</span>
          {flaggedTxns.length > 0 && (
            <StatPill label="Flagged" value={`${flaggedTxns.length} txns`} color="bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800" />
          )}
          {highInsights.length > 0 && (
            <StatPill label="Risk" value={`${highInsights.length} high-severity`} color="bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200 border-orange-200 dark:border-orange-800" />
          )}
        </motion.div>
      )}

      {/* ── KPI Cards — 2 rows of 4 ───────────────────────────────────────── */}
      <div className="space-y-3 mb-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard
              title="Total Revenue"
              value={formatCurrency(yearKpi.totalIncome, true)}
              change={yearKpi.yoyGrowth}
              changeLabel={`vs FY${selectedYear - 1}`}
              trend="up" color="blue"
              icon={<DollarSign className="w-4 h-4" />}
              secondaryLabel="15Y CAGR" secondaryValue="17.8%"
              compareValue={compKpi ? formatCurrency(compKpi.totalIncome, true) : undefined}
              compareLabel={compKpi ? `FY${compareYear}` : undefined}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard
              title="Total Expenses"
              value={formatCurrency(yearKpi.totalExpenses, true)}
              change={15.3}
              changeLabel={`vs FY${selectedYear - 1}`}
              trend="up" color="red"
              icon={<TrendingDown className="w-4 h-4" />}
              secondaryLabel="Largest Spend" secondaryValue={formatCurrency(yearKpi.largestCategorySpend, true)}
              compareValue={compKpi ? formatCurrency(compKpi.totalExpenses, true) : undefined}
              compareLabel={compKpi ? `FY${compareYear}` : undefined}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard
              title="Net Profit"
              value={formatCurrency(yearKpi.netProfit, true)}
              change={19.9}
              changeLabel={`vs FY${selectedYear - 1}`}
              trend="up" color="green"
              icon={<TrendingUp className="w-4 h-4" />}
              secondaryLabel="Exp. Ratio" secondaryValue={`${yearKpi.expenseRatio}%`}
              compareValue={compKpi ? formatCurrency(compKpi.netProfit, true) : undefined}
              compareLabel={compKpi ? `FY${compareYear}` : undefined}
            />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard
              title="YoY Growth"
              value={formatPct(yearKpi.yoyGrowth)}
              change={yearKpi.yoyGrowth}
              changeLabel="revenue CAGR"
              trend="up" color="purple"
              icon={<Activity className="w-4 h-4" />}
              secondaryLabel="Efficiency" secondaryValue="Improving"
              compareValue={compKpi ? formatPct(compKpi.yoyGrowth) : undefined}
              compareLabel={compKpi ? `FY${compareYear}` : undefined}
            />
          </motion.div>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.24 } } }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard title="Transactions" value="120" change={12.4} changeLabel="vs last year" trend="up" color="blue" icon={<BarChart3 className="w-4 h-4" />} secondaryLabel="Validated" secondaryValue="34 today" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard title="Flagged" value={String(flaggedTxns.length)} change={-15} changeLabel="vs last week" trend="down" color="red" icon={<Flag className="w-4 h-4" />} secondaryLabel="Resolved" secondaryValue="91%" />
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } } }}>
            <KPICard title="Risk Alerts" value={String(yearKpi.riskAlerts)} change={-25.0} changeLabel="vs last quarter" trend="down" color="amber" icon={<AlertTriangle className="w-4 h-4" />} secondaryLabel="High Sev." secondaryValue={String(highInsights.length)} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Comparison Chart (shown when compare mode is active) ───────────── */}
      {compareMode && (
        <div className="mb-4">
          <ErrorBoundary fallbackTitle="Comparison chart error">
            <ComparisonChart year={selectedYear} compareYear={compareYear} />
          </ErrorBoundary>
        </div>
      )}

      {/* ── Accordion Sections ────────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* 1. Flagged Inconsistencies */}
        <AccordionSection
          id="data-entry"
          title="Flagged Inconsistencies"
          subtitle="Transactions requiring review"
          badge={flaggedTxns.length > 0 ? <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">{flaggedTxns.length}</span> : undefined}
        >
          <ErrorBoundary fallbackTitle="Failed to load flagged transactions">
            {flaggedTxns.length > 0 ? (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/40 p-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
                  <Flag className="w-3.5 h-3.5 text-red-500" aria-hidden="true" /> Flagged Inconsistencies ({flaggedTxns.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {flaggedTxns.slice(0, 4).map(t => (
                    <div key={t.transaction_id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-900/40">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400">{t.transaction_id}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">{t.description}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-slate-700 dark:text-slate-300">{t.date}</span>
                        <span className="text-xs font-semibold text-red-800 dark:text-red-300">{formatCurrency(t.amount, true)}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <Button variant="red" size="xs" className="flex-1">Review</Button>
                        <Button variant="outline" size="xs" className="flex-1">Dismiss</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 text-center py-6">No flagged transactions for FY{selectedYear}.</p>
            )}
          </ErrorBoundary>
        </AccordionSection>

        {/* 2. Financial Performance */}
        <AccordionSection
          id="financial-performance"
          title="Financial Performance"
          subtitle={`FY${selectedYear} monthly analysis · expense breakdown · profitability`}
        >
          <ErrorBoundary fallbackTitle="Failed to load financial performance charts">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Monthly Line Chart — primary view */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Monthly — FY{selectedYear}</p>
                  <span className="text-xs text-slate-700 dark:text-slate-300">₹M</span>
                </div>
                <MonthlyLineChart data={yearMonthly} />
              </div>

              {/* Expense Pie */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">Expense Mix — FY{selectedYear}</p>
                <div className="flex justify-center">
                  <RechartsPie width={160} height={160}>
                    <Pie data={yearExpCats.slice(0, 5)} cx={80} cy={80} innerRadius={42} outerRadius={70} dataKey="amount">
                      {yearExpCats.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v, true), '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </RechartsPie>
                </div>
                <div className="space-y-1.5 mt-1">
                  {yearExpCats.slice(0, 4).map(cat => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-28">{cat.category.split(' ')[0]}</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profitability table — full width */}
            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">Profitability by Year</p>
              <div className="overflow-auto max-h-[220px]">
                <table className="w-full text-xs min-w-[480px]" aria-label="Profitability by year">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Year</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Revenue</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Expenses</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Profit</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Margin</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">YoY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userYearlySummary.slice(-8).reverse().map(y => (
                      <tr key={y.year} className={`border-b border-slate-100 dark:border-slate-700/40 ${y.year === selectedYear ? 'bg-blue-50 dark:bg-blue-900/20' : y.year === compareYear && compareMode ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-white dark:hover:bg-slate-800'}`}>
                        <td className={`py-1.5 font-medium text-xs ${y.year === selectedYear ? 'text-blue-700 dark:text-blue-400' : y.year === compareYear && compareMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {y.year === selectedYear ? '▶ ' : y.year === compareYear && compareMode ? '◆ ' : ''}{y.year}
                        </td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(y.income, true)}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(y.expenses, true)}</td>
                        <td className="py-1.5 text-right font-semibold text-emerald-800 dark:text-emerald-300 text-xs">{formatCurrency(y.netProfit, true)}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{((y.netProfit / y.income) * 100).toFixed(1)}%</td>
                        <td className={`py-1.5 text-right font-semibold text-xs ${y.yoyGrowth >= 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>{formatPct(y.yoyGrowth)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ErrorBoundary>
        </AccordionSection>

        {/* 3. Strategic Analysis & Risk */}
        <AccordionSection
          id="strategic-analysis"
          title="Strategic Analysis & Risk"
          subtitle="10-year trends, risk alerts, operational insights"
          badge={highInsights.length > 0 ? <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">{highInsights.length} HIGH</span> : undefined}
        >
          <ErrorBoundary fallbackTitle="Failed to load strategic analysis">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* 10Y bar */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">10-Year Revenue vs Expenses</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300">2015–2024</p>
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-300">₹M</span>
                </div>
                <TenYearBarChart />
              </div>

              {/* Risk Alerts */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex flex-col">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-700 dark:text-red-300" aria-hidden="true" /> Active Risk Alerts
                </p>
                <div className="space-y-2 overflow-y-auto flex-1 max-h-52">
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No risk alerts for your actual data</p>
                </div>
              </div>
            </div>
          </ErrorBoundary>
        </AccordionSection>

        {/* 4. Financial Reports (collapsed by default, with PDF export) */}
        <AccordionSection
          id="financial-reports"
          title="Financial Reports"
          subtitle="Income vs expenses, category breakdown, trend analysis, budget vs actual"
          defaultExpanded={false}
          headerRight={<ReportExportButton targetId="financial-reports-content" fileName="FinanceOS-Financial-Reports" />}
        >
          <ErrorBoundary fallbackTitle="Failed to load financial reports">
            {/* Year range + quick presets */}
            <div className="flex items-center gap-3 flex-wrap mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-xs">
                <label htmlFor="rpt-from" className="text-slate-700 dark:text-slate-300">From</label>
                <select id="rpt-from" value={yearFrom} onChange={e => setYearFrom(Number(e.target.value))} className="px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs">
                  {userYearlySummary.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                </select>
                <span className="text-slate-700 dark:text-slate-300">→</span>
                <label htmlFor="rpt-to" className="text-slate-700 dark:text-slate-300">To</label>
                <select id="rpt-to" value={yearTo} onChange={e => setYearTo(Number(e.target.value))} className="px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs">
                  {userYearlySummary.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                </select>
              </div>
              <div className="flex gap-1.5 ml-auto">
                {['5Y','10Y','ALL'].map(r => (
                  <Button key={r} variant="outline" size="sm" onClick={() => { 
                    if (r === 'ALL') { 
                      setYearFrom(2015); setYearTo(2026); 
                    } else { 
                      const n = parseInt(r); setYearFrom(2026 - n + 1); setYearTo(2026); 
                    } 
                  }}>{r}</Button>
                ))}
              </div>
            </div>

            {/* All report sections stacked — wrapped in an ID for PDF export */}
            <div id="financial-reports-content" className="space-y-6">
              {/* Income vs Expenses */}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" aria-hidden="true" /> Income vs Expenses
                </p>
                <ReportIncomeExpense yearRange={[yearFrom, yearTo]} ct={ct} />
              </div>

              {/* Category Analysis */}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" aria-hidden="true" /> Category Analysis — FY{selectedYear}
                </p>
                <ReportCategory year={selectedYear} ct={ct} />
              </div>

              {/* Trend Analysis */}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" /> Trend Analysis
                </p>
                <ReportTrend ct={ct} />
              </div>

              {/* Budget vs Actual */}
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" /> Budget vs Actual — FY{selectedYear}
                </p>
                <ReportBudget year={selectedYear} ct={ct} />
              </div>
            </div>
          </ErrorBoundary>
        </AccordionSection>

      </div>
    </PageShell>
  );
}