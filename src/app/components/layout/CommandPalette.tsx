import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import {
  LayoutDashboard, CreditCard, Upload, Lightbulb, Target,
  ScrollText, Settings, Search, Moon, Sun, Eye, EyeOff,
  ArrowRight, FileText, BarChart3, AlertTriangle, TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { userTransactions, insights } from '../../data/userData';

// ─── Searchable items ─────────────────────────────────────────────────────────
const pages = [
  { id: 'dashboard',    label: 'Dashboard',    path: '/',             icon: LayoutDashboard, group: 'Pages' },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: CreditCard,      group: 'Pages' },
  { id: 'insights',     label: 'Insights',     path: '/insights',     icon: Lightbulb,       group: 'Pages' },
  { id: 'upload',       label: 'Upload Data',  path: '/upload',       icon: Upload,          group: 'Pages' },
  { id: 'settings',     label: 'Settings',     path: '/settings',     icon: Settings,        group: 'Pages' },
];

const quickActions = [
  { id: 'toggle-dark',     label: 'Toggle Dark Mode',      icon: Moon,    group: 'Quick Actions', action: 'dark' },
  { id: 'toggle-mask',     label: 'Toggle Mask Values',    icon: Eye,     group: 'Quick Actions', action: 'mask' },
  { id: 'toggle-contrast', label: 'Toggle High Contrast',  icon: Eye,     group: 'Quick Actions', action: 'contrast' },
  { id: 'export-csv',      label: 'Export Transactions (CSV)', icon: FileText, group: 'Quick Actions', action: 'nav', path: '/transactions' },
  { id: 'upload-data',     label: 'Upload New Data',       icon: Upload,  group: 'Quick Actions', action: 'nav', path: '/upload' },
];

/* ── WCAG AAA color reference ─────────────────────────────────────────────────
 * Group headings:  slate-600 on white = 5.7:1 (large text AAA ✓ at 10px caps + semibold)
 * Item text:       slate-800 on white = 10.7:1 ✓
 * Dark item text:  slate-100 on slate-900 = 13.9:1 ✓
 * Selected bg:     blue-50 bg — text blue-900 on blue-50 = 9.5:1 ✓
 * Meta text:       slate-600 on white = 5.7:1 (11px supplementary — AA+ for small text)
 *                  → bumped to slate-700 = 8.2:1 for AAA ✓
 * Badge text:      red-900 on red-100 = 8.2:1 ✓ | amber-900 on amber-100 = 7.6:1 ✓
 * Footer:          slate-700 on white = 8.2:1 ✓
 * ─────────────────────────────────────────────────────────────────────────── */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { darkMode, setDarkMode, maskValues, setMaskValues, highContrast, setHighContrast } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);

  // ─── Cmd+K / Ctrl+K listener ────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Focus trap — keep focus inside dialog when open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setSearch('');
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"]), [role="option"]'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Expose a way for the header search to open the palette
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  const runAction = useCallback((action: string, path?: string) => {
    if (action === 'dark') setDarkMode(!darkMode);
    else if (action === 'mask') setMaskValues(!maskValues);
    else if (action === 'contrast') setHighContrast(!highContrast);
    else if (action === 'nav' && path) navigate(path);
    setOpen(false);
    setSearch('');
  }, [darkMode, maskValues, highContrast, navigate, setDarkMode, setMaskValues, setHighContrast]);

  const goTo = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
    setSearch('');
  }, [navigate]);

  if (!open) return null;

  const recentTxns = userTransactions.slice(0, 20);
  const highInsights = insights.filter(i => i.severity === 'high' || i.severity === 'medium');

  /* Base class for all Command.Item — AAA colors */
  const itemCls = 'flex items-center gap-3 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 rounded-lg cursor-pointer data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-900/30 data-[selected=true]:text-blue-900 dark:data-[selected=true]:text-blue-200 transition-colors';

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette — search pages, actions, and transactions"
      ref={dialogRef}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => { setOpen(false); setSearch(''); }}
        aria-hidden="true"
      />

      {/* Command Dialog */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 sm:px-0">
        <Command
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl elevation-5 overflow-hidden"
          label="Command palette"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" aria-hidden="true" />
            <Command.Input
              placeholder="Search pages, transactions, actions..."
              value={search}
              onValueChange={setSearch}
              className="w-full py-3 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none"
              autoFocus
              aria-label="Search command palette"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded shrink-0" aria-hidden="true">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-700 dark:text-slate-300">
              No results found.
            </Command.Empty>

            {/* Pages */}
            <Command.Group heading="Pages" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1">
              {pages.map(page => (
                <Command.Item
                  key={page.id}
                  value={`${page.label} ${page.id}`}
                  onSelect={() => goTo(page.path)}
                  className={itemCls}
                >
                  <page.icon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{page.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </Command.Item>
              ))}
            </Command.Group>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1">
              {quickActions.map(qa => (
                <Command.Item
                  key={qa.id}
                  value={qa.label}
                  onSelect={() => runAction(qa.action, qa.path)}
                  className={itemCls}
                >
                  {qa.id === 'toggle-dark' ? (
                    darkMode ? <Sun className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" aria-hidden="true" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                  ) : qa.id === 'toggle-mask' ? (
                    maskValues ? <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" /> : <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                  ) : qa.id === 'toggle-contrast' ? (
                    highContrast ? <EyeOff className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" /> : <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <qa.icon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                  )}
                  <span className="flex-1">
                    {qa.id === 'toggle-dark' ? (darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') :
                     qa.id === 'toggle-mask' ? (maskValues ? 'Show Values' : 'Mask Values') :
                     qa.id === 'toggle-contrast' ? (highContrast ? 'Disable High Contrast' : 'Enable High Contrast') :
                     qa.label}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Risk Alerts */}
            {highInsights.length > 0 && (
              <Command.Group heading="Risk Alerts" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1">
                {highInsights.slice(0, 4).map(ins => (
                  <Command.Item
                    key={ins.id}
                    value={`${ins.title} ${ins.category} ${ins.metric}`}
                    onSelect={() => goTo('/insights')}
                    className={itemCls}
                  >
                    {/* Decorative icon — meaning conveyed via badge text */}
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${ins.severity === 'high' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{ins.title}</p>
                      {/* slate-700 on white = 8.2:1 ✓ AAA */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{ins.metric}</p>
                    </div>
                    {/* Badge: red-900 on red-100 = 8.2:1 ✓ | amber-900 on amber-100 = 7.6:1 ✓ */}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${ins.severity === 'high' ? 'bg-red-100 dark:bg-red-900/40 text-red-900 dark:text-red-200' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200'}`}>
                      {ins.severity.toUpperCase()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Recent Transactions (only shown when searching) */}
            {search.length > 0 && (
              <Command.Group heading="Transactions" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1">
                {recentTxns.map(txn => (
                  <Command.Item
                    key={txn.transaction_id}
                    value={`${txn.transaction_id} ${txn.description} ${txn.category} ${txn.amount}`}
                    onSelect={() => goTo('/transactions')}
                    className={itemCls}
                  >
                    {txn.type === 'income'
                      ? <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-300 shrink-0" aria-hidden="true" />
                      : <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" aria-hidden="true" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{txn.description}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 truncate">{txn.transaction_id} · {txn.date}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                      {txn.type === 'income' ? '+' : '-'}{`₹${(txn.amount / 1000).toFixed(0)}K`}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer — keyboard hints */}
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-xs" aria-hidden="true">&uarr;&darr;</kbd>
                <span>navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-xs" aria-hidden="true">&crarr;</kbd>
                <span>select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-xs" aria-hidden="true">Cmd</kbd>
              <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-xs" aria-hidden="true">K</kbd>
              <span>to toggle</span>
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}