// ─── Reusable Skeleton Building Blocks ────────────────────────────────────────
// Skeletons use aria-hidden decorative bars; the wrapping container provides
// role="status" + aria-label so screen readers announce "Loading" once.

function Shimmer({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} style={style} aria-hidden="true" />
  );
}

// ─── KPI Card Skeleton ────────────────────────────────────────────────────────
export function KPICardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" aria-hidden="true">
      <Shimmer className="h-[3px] w-full rounded-none" />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            <Shimmer className="w-8 h-8 rounded-lg" />
            <Shimmer className="w-20 h-3" />
          </div>
          <Shimmer className="w-14 h-5 rounded-full" />
        </div>
        <Shimmer className="w-28 h-6 mb-2" />
        <div className="flex items-center justify-between">
          <Shimmer className="w-24 h-3" />
          <Shimmer className="w-12 h-3" />
        </div>
      </div>
    </div>
  );
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  // Deterministic heights so skeleton is stable across renders
  const barHeights = [45, 72, 58, 81, 39, 65, 53, 77];
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4" aria-hidden="true">
      <div className="flex items-center justify-between mb-3">
        <Shimmer className="w-32 h-3" />
        <Shimmer className="w-10 h-3" />
      </div>
      <div className="flex items-end gap-2 justify-center" style={{ height }}>
        {barHeights.map((h, i) => (
          <Shimmer
            key={i}
            className="rounded-t"
            style={{ width: 20, height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ───────────────────────────────────────────────────────
export function TableRowSkeleton({ columns = 6, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" aria-hidden="true">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Shimmer key={`h-${i}`} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Shimmer key={`r-${r}-c-${c}`} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard Page Skeleton ──────────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div
      className="p-4 sm:p-5 max-w-[1600px] mx-auto"
      role="status"
      aria-label="Loading dashboard content"
      aria-live="polite"
    >
      {/* Screen reader announcement */}
      <p className="sr-only">Dashboard is loading. Please wait.</p>

      <div className="animate-pulse">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Shimmer className="w-32 h-7 mb-1" />
            <Shimmer className="w-48 h-3" />
          </div>
          <Shimmer className="w-16 h-6 rounded-full" />
        </div>
        {/* KPI Cards */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={`kpi-a-${i}`} />)}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <KPICardSkeleton key={`kpi-b-${i}`} />)}
          </div>
        </div>
        {/* Accordions */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`acc-${i}`} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Shimmer className="w-36 h-4 mb-1" />
                  <Shimmer className="w-56 h-3" />
                </div>
                <Shimmer className="w-16 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Skeleton (Generic) ──────────────────────────────────────────────────
export function PageSkeleton() {
  return (
    <div
      className="p-4 sm:p-5 max-w-[1600px] mx-auto"
      role="status"
      aria-label="Loading page content"
      aria-live="polite"
    >
      <p className="sr-only">Page is loading. Please wait.</p>

      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Shimmer className="w-40 h-7 mb-1" />
            <Shimmer className="w-56 h-3" />
          </div>
          <div className="flex gap-2">
            <Shimmer className="w-24 h-9 rounded-lg" />
            <Shimmer className="w-24 h-9 rounded-lg" />
          </div>
        </div>
        <TableRowSkeleton columns={7} rows={8} />
      </div>
    </div>
  );
}
