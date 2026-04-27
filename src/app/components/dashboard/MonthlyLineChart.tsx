import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useChartTheme } from '../ui/useChartTheme';
import type { MonthlySummary } from '../../data/types';

export function MonthlyLineChart({ data }: { data: MonthlySummary[] }) {
  const ct = useChartTheme();

  return (
    <figure role="img" aria-label="Line chart: Monthly income, expenses, and net profit for the selected fiscal year">
      {/* Screen reader data table alternative */}
      <table className="sr-only">
        <caption>Monthly Income, Expenses, and Net Profit</caption>
        <thead><tr><th scope="col">Month</th><th scope="col">Income (₹M)</th><th scope="col">Expenses (₹M)</th><th scope="col">Net Profit (₹M)</th></tr></thead>
        <tbody>
          {data.map((m, index) => (
            <tr key={`${m.month}-${index}`}>
              <td>{m.month}</td>
              <td>{(m.income / 1_000_000).toFixed(2)}</td>
              <td>{(m.expenses / 1_000_000).toFixed(2)}</td>
              <td>{(m.netProfit / 1_000_000).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid key="ml-grid" strokeDasharray="3 3" stroke={ct.grid} />
          <XAxis key="ml-x" dataKey="month" tick={{ fontSize: 12, fill: ct.tick }} axisLine={false} tickLine={false} />
          <YAxis key="ml-y" tick={{ fontSize: 12, fill: ct.tick }} tickFormatter={v => `₹${(v / 1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} width={40} />
          <Tooltip key="ml-tip" formatter={(v: number) => [`₹${(v / 1_000_000).toFixed(2)}M`, '']} contentStyle={ct.tooltip} />
          <Legend key="ml-legend" wrapperStyle={{ fontSize: 12 }} iconSize={8} />
          {/* AAA distinguishable: blue + red + green — also differentiated by pattern (stroke dash) */}
          <Line key="ml-income" type="monotone" dataKey="income" stroke="#1E40AF" strokeWidth={2} dot={false} name="Income" />
          <Line key="ml-expenses" type="monotone" dataKey="expenses" stroke="#991B1B" strokeWidth={2} dot={false} name="Expenses" strokeDasharray="6 3" />
          <Line key="ml-netprofit" type="monotone" dataKey="netProfit" stroke="#065F46" strokeWidth={2} dot={false} name="Net Profit" strokeDasharray="2 2" />
        </LineChart>
      </ResponsiveContainer>
    </figure>
  );
}