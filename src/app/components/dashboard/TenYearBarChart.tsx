import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useChartTheme } from '../ui/useChartTheme';
import { userYearlySummary } from '../../data/userData';

export function TenYearBarChart() {
  const ct = useChartTheme();
  const data = userYearlySummary.map(y => ({
    year: y.year,
    Income: y.income,
    Expenses: y.expenses,
    Profit: y.netProfit,
  }));

  return (
    <figure role="img" aria-label="Bar chart: 10-year comparison of income, expenses, and net profit from 2015 to 2024">
      <table className="sr-only">
        <caption>10-Year Revenue vs Expenses vs Profit</caption>
        <thead><tr><th scope="col">Year</th><th scope="col">Income (₹)</th><th scope="col">Expenses (₹)</th><th scope="col">Profit (₹)</th></tr></thead>
        <tbody>
          {data.map(d => (
            <tr key={d.year}><td>{d.year}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(d.Income)}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(d.Expenses)}</td><td>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(d.Profit)}</td></tr>
          ))}
        </tbody>
      </table>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={12} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid key="ty-grid" strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis key="ty-x" dataKey="year" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
          <YAxis key="ty-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)} axisLine={false} tickLine={false} width={60} />
          <Tooltip key="ty-tip" formatter={(v: number) => [new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v), '']} contentStyle={ct.tooltip} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
          <Legend key="ty-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
          <Bar key="ty-income" dataKey="Income" fill="#1E40AF" radius={[2,2,0,0]} />
          <Bar key="ty-expenses" dataKey="Expenses" fill="#64748b" radius={[2,2,0,0]} />
          <Bar key="ty-profit" dataKey="Profit" fill="#065F46" radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
}