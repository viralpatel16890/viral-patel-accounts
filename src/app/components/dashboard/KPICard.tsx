import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'teal';
  icon: ReactNode;
  description?: string;
  suffix?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  compareValue?: string;
  compareLabel?: string;
}

/* ── AAA-safe color system ────────────────────────────────────────────────────
 * Icon containers: 100/900 bg pairs — decorative only (aria-hidden).
 * Stripe: decorative (aria-hidden).
 * Text colors checked against white (#fff) and slate-800 dark bg:
 *   - blue-800   on white = 8.3:1   ✓   blue-200 on slate-800 = 9.5:1 ✓
 *   - emerald-800 on white = 7.2:1  ✓   emerald-200 on slate-800 = 10.3:1 ✓
 *   - red-800    on white = 8.0:1   ✓   red-200 on slate-800 = 9.4:1 ✓
 *   - amber-800  on white = 7.4:1   ✓   amber-200 on slate-800 = 10.9:1 ✓
 *   - purple-800 on white = 7.8:1   ✓   purple-200 on slate-800 = 9.8:1 ✓
 *   - teal-800   on white = 7.3:1   ✓   teal-200 on slate-800 = 10.5:1 ✓
 */
const colorMap = {
  blue:   { icon: 'bg-blue-100   dark:bg-blue-900/40   text-blue-800   dark:text-blue-200',   stripe: 'bg-blue-600' },
  green:  { icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200', stripe: 'bg-emerald-600' },
  red:    { icon: 'bg-red-100    dark:bg-red-900/40    text-red-800    dark:text-red-200',    stripe: 'bg-red-600' },
  amber:  { icon: 'bg-amber-100  dark:bg-amber-900/40  text-amber-800  dark:text-amber-200',  stripe: 'bg-amber-600' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200', stripe: 'bg-purple-600' },
  teal:   { icon: 'bg-teal-100   dark:bg-teal-900/40   text-teal-800   dark:text-teal-200',   stripe: 'bg-teal-600' },
};

export function KPICard({
  title, value, change, changeLabel, trend, color, icon,
  description, suffix, secondaryLabel, secondaryValue,
  compareValue, compareLabel,
}: KPICardProps) {
  const { maskValues, compareMode } = useApp();
  const c = colorMap[color];

  const TrendIcon  = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  /* Trend badge colors — AAA contrast:
   * emerald-900 on emerald-50 = 9.1:1 ✓ | red-900 on red-50 = 9.4:1 ✓ | slate-800 on slate-100 = 10.7:1 ✓
   * Dark: emerald-200 on emerald-900/30 ≈ 9+ ✓ | red-200 on red-900/30 ≈ 9+ ✓
   */
  const trendColor = trend === 'up'
    ? 'text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/30'
    : trend === 'down'
    ? 'text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-900/30'
    : 'text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700';
  const isPositive = change >= 0;
  const changeDisp = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;

  /* Build a full screen reader description */
  const srDescription = [
    `${title}: ${maskValues ? 'Value hidden' : value}`,
    `Change: ${changeDisp} ${changeLabel}`,
    secondaryLabel && secondaryValue ? `${secondaryLabel}: ${secondaryValue}` : '',
    compareMode && compareValue ? `Comparison ${compareLabel || 'Prev FY'}: ${maskValues ? 'hidden' : compareValue}` : '',
  ].filter(Boolean).join('. ');

  return (
    <motion.article
      className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group elevation-1"
      aria-label={srDescription}
      whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Top accent stripe — decorative */}
      <div className={`h-[3px] w-full ${c.stripe}`} aria-hidden="true" />

      <div className="p-4">
        {/* Row 1: Icon + Title + Trend badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${c.icon} flex items-center justify-center shrink-0`} aria-hidden="true">
              {icon}
            </div>
            {/* slate-700 on white = 8.2:1 ✓ AAA */}
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
              {title}
            </p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" aria-hidden="true" />
            <span>{changeDisp}</span>
          </div>
        </div>

        {/* Row 2: Primary Value */}
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className={`text-[22px] font-bold leading-none text-slate-900 dark:text-white ${maskValues ? 'blur-sm select-none' : ''}`}
            aria-live="polite"
          >
            {maskValues ? '••••••' : value}
          </span>
          {/* slate-700 on white = 8.2:1 ✓ AAA */}
          {suffix && <span className="text-sm text-slate-700 dark:text-slate-300">{suffix}</span>}
        </div>

        {/* Compare Row (FY comparison) */}
        {compareMode && compareValue && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 rounded-lg">
            {/* indigo-800 on indigo-50 = 9.8:1 ✓ AAA */}
            <span className="text-xs text-indigo-800 dark:text-indigo-200 font-medium">{compareLabel || 'Prev FY'}</span>
            <span className={`text-xs font-semibold text-indigo-900 dark:text-indigo-100 ${maskValues ? 'blur-sm select-none' : ''}`}>
              {maskValues ? '••••' : compareValue}
            </span>
          </div>
        )}

        {/* Row 3: Change label + secondary */}
        <div className="flex items-center justify-between gap-2">
          {/* Change text: emerald-800/red-800 on white ≥ 7:1 ✓ AAA */}
          <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
            <span className={isPositive ? 'text-emerald-800 dark:text-emerald-300 font-medium' : 'text-red-800 dark:text-red-300 font-medium'} aria-hidden="true">
              {changeDisp}
            </span>
            {' '}{changeLabel}
          </p>
          {secondaryLabel && secondaryValue && (
            <p className="text-xs text-slate-700 dark:text-slate-300 shrink-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{secondaryValue}</span>
            </p>
          )}
        </div>

        {description && (
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </motion.article>
  );
}