import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { Target, Plus, TrendingDown, TrendingUp, Edit3, Check, X } from 'lucide-react';
import { getExpenseCategoriesForYear, getBudgetDataForYear, formatCurrency } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useChartTheme } from '../components/ui/useChartTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PageShell, PageHeader } from '../components/ui/PageShell';

export default function Budgets() {
  const { selectedYear, compareMode, compareYear } = useApp();
  const chartTheme = useChartTheme();
  const [budgetData, setBudgetData] = useState(getBudgetDataForYear(selectedYear));
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setBudgetData(getBudgetDataForYear(selectedYear));
    setEditingIdx(null);
  }, [selectedYear]);

  const compareBudgets = compareMode ? getBudgetDataForYear(compareYear) : null;

  const totalBudgeted = budgetData.reduce((s, b) => s + b.budgeted, 0);
  const totalActual   = budgetData.reduce((s, b) => s + b.actual, 0);
  const totalVariance = totalActual - totalBudgeted;
  const totalVariancePct = totalBudgeted > 0 ? ((totalVariance / totalBudgeted) * 100) : 0;

  const chartData = budgetData.map(b => ({
    name: b.category.length > 12 ? b.category.slice(0, 12) + '…' : b.category,
    Budgeted: b.budgeted,
    Actual: b.actual,
  }));

  const handleAddBudgetLine = () => {
    const newLine = {
      category: `New Category ${budgetData.length + 1}`,
      budgeted: 500000,
      actual: 0,
      variance: -500000,
      variancePct: -100,
    };
    setBudgetData(prev => [...prev, newLine]);
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(String(budgetData[idx].budgeted));
  };

  const saveEdit = (idx: number) => {
    const newBudget = Math.max(0, parseInt(editValue) || 0);
    setBudgetData(prev => prev.map((b, i) => {
      if (i !== idx) return b;
      const variance = b.actual - newBudget;
      return {
        ...b,
        budgeted: newBudget,
        variance,
        variancePct: newBudget > 0 ? (variance / newBudget) * 100 : 0,
      };
    }));
    setEditingIdx(null);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditValue('');
  };

  const summaryCards = [
    {
      label: 'Total Budgeted',
      value: formatCurrency(totalBudgeted, true),
      icon: <Target className="w-5 h-5 text-blue-600" aria-hidden="true" />,
      color: 'border-l-blue-600',
    },
    {
      label: 'Total Actual',
      value: formatCurrency(totalActual, true),
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />,
      color: 'border-l-emerald-600',
    },
    {
      label: 'Net Variance',
      value: formatCurrency(Math.abs(totalVariance), true),
      suffix: totalVariance > 0 ? 'Over' : 'Under',
      icon: totalVariance > 0
        ? <TrendingUp className="w-5 h-5 text-red-600" aria-hidden="true" />
        : <TrendingDown className="w-5 h-5 text-emerald-600" aria-hidden="true" />,
      color: totalVariance > 0 ? 'border-l-red-600' : 'border-l-emerald-600',
    },
  ];

  return (
    <PageShell>
      <PageHeader title="Budget Management" description={`FY${selectedYear} budget vs actual tracking`}>
        <Button onClick={handleAddBudgetLine} variant="blue" size="sm">
          <Plus className="w-4 h-4" aria-hidden="true" />
          New Budget Line
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryCards.map(c => (
          <Card key={c.label} className={`border-l-4 ${c.color}`}>
            <CardContent className="flex items-center gap-3 pt-5">
              <div className="p-2 bg-muted rounded-lg shrink-0">{c.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
                {c.suffix && (
                  <p className="text-xs text-muted-foreground">{c.suffix} budget</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget vs Actual by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis dataKey="name" tick={{ fill: chartTheme.textColor, fontSize: 11 }} />
                <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: chartTheme.textColor, fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, true)}
                  contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.gridColor}`, borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: chartTheme.textColor }}
                />
                <Bar dataKey="Budgeted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={budgetData[i] && budgetData[i].actual > budgetData[i].budgeted ? '#dc2626' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Budget vs actual comparison">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">Category</th>
                  <th className="px-4 py-3 text-right text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">Budgeted</th>
                  <th className="px-4 py-3 text-right text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">Actual</th>
                  <th className="px-4 py-3 text-right text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">Variance</th>
                  <th className="px-4 py-3 text-center text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">Progress</th>
                  {compareMode && <th className="px-4 py-3 text-right text-muted-foreground font-semibold text-xs uppercase tracking-wider" scope="col">FY{compareYear}</th>}
                  <th className="px-4 py-3 text-center text-muted-foreground font-semibold text-xs uppercase tracking-wider w-20" scope="col">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {budgetData.map((b, idx) => {
                  const pct = b.budgeted > 0 ? Math.min((b.actual / b.budgeted) * 100, 150) : 0;
                  const isOver = b.actual > b.budgeted;
                  const compareItem = compareBudgets?.find(cb => cb.category === b.category);
                  return (
                    <tr key={b.category} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{b.category}</td>
                      <td className="px-4 py-3 text-right">
                        {editingIdx === idx ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(idx); if (e.key === 'Escape') cancelEdit(); }}
                            className="w-32 text-right ml-auto"
                            autoFocus
                            aria-label={`Edit budget for ${b.category}`}
                          />
                        ) : (
                          <span className="text-foreground">{formatCurrency(b.budgeted, true)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{formatCurrency(b.actual, true)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isOver ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatCurrency(Math.abs(b.variance), true)} ({Math.abs(b.variancePct).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full max-w-[120px] mx-auto">
                          <div className="h-2 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                            <div
                              className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-1">{pct.toFixed(0)}%</p>
                        </div>
                      </td>
                      {compareMode && (
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                          {compareItem ? formatCurrency(compareItem.actual, true) : '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {editingIdx === idx ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="iconSm" onClick={() => saveEdit(idx)} aria-label="Save">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </Button>
                            <Button variant="ghost" size="iconSm" onClick={cancelEdit} aria-label="Cancel">
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="iconSm" onClick={() => startEdit(idx)} aria-label={`Edit budget for ${b.category}`}>
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 border-t-2 border-border font-semibold">
                  <td className="px-4 py-3 text-foreground">Total</td>
                  <td className="px-4 py-3 text-right text-foreground">{formatCurrency(totalBudgeted, true)}</td>
                  <td className="px-4 py-3 text-right text-foreground">{formatCurrency(totalActual, true)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${totalVariance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {formatCurrency(Math.abs(totalVariance), true)} ({Math.abs(totalVariancePct).toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                    {totalBudgeted > 0 ? `${((totalActual / totalBudgeted) * 100).toFixed(0)}%` : '—'}
                  </td>
                  {compareMode && <td className="px-4 py-3" />}
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
