import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, TrendingDown, TrendingUp, AlertTriangle,
  BarChart3, Flag, Activity, Calendar,
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '../components/ui/button';
import { PageShell } from '../components/ui/PageShell';
import { useApp } from '../context/AppContext';
import { KPICard } from '../components/dashboard/KPICard';
import { AccordionSection } from '../components/dashboard/AccordionSection';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { useChartTheme } from '../components/ui/useChartTheme';
import {
  userTransactions,
  userYearlySummary,
  getUserMonthlySummary,
  getUserExpenseCategories,
  getUserKpiForYear,
  getUserTransactionsForYear,
  formatCurrency,
  formatPct,
} from '../data/userData';

// ─── User Transaction List Component ─────────────────────────────────────────────
function UserTransactionList({ transactions, maxItems = 10 }: { transactions: any[]; maxItems?: number }) {
  return (
    <div className="space-y-2">
      {transactions.slice(0, maxItems).map(t => (
        <div key={t.transaction_id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{t.description}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.date}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {t.category}
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
              <p className={`text-sm font-semibold ${
                t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </p>
              {t.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.notes}</p>
              )}
            </div>
          </div>
        </div>
      ))}
      {transactions.length > maxItems && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" className="text-xs">
            View All {transactions.length} Transactions
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── User Dashboard Component ─────────────────────────────────────────────────────
export default function UserDashboard() {
  const ct = useChartTheme();
  const { dataVersion, dataSource } = useApp();
  const [selectedYear, setSelectedYear] = useState(() => userYearlySummary.at(-1)?.year ?? new Date().getFullYear());
  const [showTransactions, setShowTransactions] = useState(false);

  // Get available years from user data
  const availableYears = useMemo(() =>
    userYearlySummary.map(y => y.year).sort((a, b) => b - a),
    [dataVersion]
  );

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const yearKpi = useMemo(() => getUserKpiForYear(selectedYear), [selectedYear, dataVersion]);
  const yearMonthly = useMemo(() => getUserMonthlySummary(selectedYear), [selectedYear, dataVersion]);
  const yearExpCats = useMemo(() => getUserExpenseCategories(selectedYear), [selectedYear, dataVersion]);
  const yearTxns = useMemo(() => getUserTransactionsForYear(selectedYear), [selectedYear, dataVersion]);

  const COLORS = yearExpCats.slice(0, 5).map(c => c.color);

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
          <h1 className="text-slate-900 dark:text-white">Your Financial Dashboard</h1>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Personal Transaction Data · {userTransactions.length} total records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>FY {year}</option>
            ))}
          </select>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${dataSource === 'google-sheets' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'google-sheets' ? 'bg-emerald-600' : 'bg-slate-500'}`} aria-hidden="true" />
            {dataSource === 'google-sheets' ? 'Google Sheets' : 'Local Backup'}
          </span>
        </div>
      </motion.div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <KPICard
            title="Total Income"
            value={formatCurrency(yearKpi.totalIncome, true)}
            change={yearKpi.yoyGrowth}
            changeLabel={`vs FY${selectedYear - 1}`}
            trend="up" color="blue"
            icon={<DollarSign className="w-4 h-4" />}
            secondaryLabel="Transactions" secondaryValue={yearTxns.filter(t => t.type === 'income').length.toString()}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
        >
          <KPICard
            title="Total Expenses"
            value={formatCurrency(yearKpi.totalExpenses, true)}
            change={15.3}
            changeLabel={`vs FY${selectedYear - 1}`}
            trend="up" color="red"
            icon={<TrendingDown className="w-4 h-4" />}
            secondaryLabel="Largest Category" secondaryValue={yearKpi.largestCategory}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
        >
          <KPICard
            title="Net Profit"
            value={formatCurrency(yearKpi.netProfit, true)}
            change={19.9}
            changeLabel={`vs FY${selectedYear - 1}`}
            trend="up" color="green"
            icon={<TrendingUp className="w-4 h-4" />}
            secondaryLabel="Expense Ratio" secondaryValue={`${yearKpi.expenseRatio.toFixed(1)}%`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
        >
          <KPICard
            title="Total Transactions"
            value={yearTxns.length.toString()}
            change={12.4}
            changeLabel="this year"
            trend="up" color="purple"
            icon={<BarChart3 className="w-4 h-4" />}
            secondaryLabel="Period" secondaryValue={`FY${selectedYear}`}
          />
        </motion.div>
      </div>

      {/* ── Main Content Sections ───────────────────────────────────────────── */}
      <div className="space-y-3">

        {/* Financial Overview */}
        <AccordionSection
          id="financial-overview"
          title="Financial Overview"
          subtitle={`FY${selectedYear} monthly performance and expense breakdown`}
          defaultExpanded={true}
        >
          <ErrorBoundary fallbackTitle="Failed to load financial overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Monthly Line Chart */}
              <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Monthly — FY{selectedYear}</p>
                  <span className="text-xs text-slate-700 dark:text-slate-300">₹</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={yearMonthly} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} axisLine={false} tickLine={false} width={42} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), '']} contentStyle={ct.tooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} iconSize={8} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
                    <Line type="monotone" dataKey="netProfit" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Net Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expense Categories */}
              {yearExpCats.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">Expense Categories — FY{selectedYear}</p>
                  <div className="flex justify-center">
                    <RechartsPie width={160} height={160}>
                      <Pie data={yearExpCats.slice(0, 5)} cx={80} cy={80} innerRadius={42} outerRadius={70} dataKey="amount">
                        {yearExpCats.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), '']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </RechartsPie>
                  </div>
                  <div className="space-y-1.5 mt-1">
                    {yearExpCats.slice(0, 4).map(cat => (
                      <div key={cat.category} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} aria-hidden="true" />
                          <span className="text-slate-800 dark:text-slate-200 truncate max-w-28">{cat.category.split(' ')[0]}</span>
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white">{cat.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Year Summary Table */}
            <div className="mt-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">Yearly Summary</p>
              <div className="overflow-auto">
                <table className="w-full text-xs min-w-[400px]" aria-label="Yearly financial summary">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Year</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Income</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Expenses</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Net Profit</th>
                      <th className="text-right py-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userYearlySummary.map(y => (
                      <tr key={y.year} className={`border-b border-slate-100 dark:border-slate-700/40 ${y.year === selectedYear ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-white dark:hover:bg-slate-800'}`}>
                        <td className={`py-1.5 font-medium text-xs ${y.year === selectedYear ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {y.year === selectedYear ? '▶ ' : ''}{y.year}
                        </td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(y.income)}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(y.expenses)}</td>
                        <td className="py-1.5 text-right font-semibold text-emerald-800 dark:text-emerald-300 text-xs">{formatCurrency(y.netProfit)}</td>
                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-300 text-xs">{y.expenseRatio.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ErrorBoundary>
        </AccordionSection>

        {/* Transactions List */}
        <AccordionSection
          id="transactions"
          title="Transaction Details"
          subtitle={`All transactions for FY${selectedYear} · Click to expand`}
        >
          <ErrorBoundary fallbackTitle="Failed to load transactions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                  Income Transactions ({yearTxns.filter(t => t.type === 'income').length})
                </p>
                <UserTransactionList transactions={yearTxns.filter(t => t.type === 'income')} maxItems={5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                  Expense Transactions ({yearTxns.filter(t => t.type === 'expense').length})
                </p>
                <UserTransactionList transactions={yearTxns.filter(t => t.type === 'expense')} maxItems={5} />
              </div>
            </div>
          </ErrorBoundary>
        </AccordionSection>

      </div>
    </PageShell>
  );
}
