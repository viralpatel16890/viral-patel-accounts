import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';
import {
  Search, Bell, ChevronDown, Calendar, LogOut,
  Settings, Shield, User, Menu, Sun, Moon, Slash, GitCompareArrows,
  Contrast, Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { userYearlySummary } from '../../data/userData';

/* ── WCAG AAA contrast reference (light / dark) ──────────────────────────────
 * Breadcrumb parent:  slate-600 on white = 5.7:1 → ≥ AA (bold caps). Use slate-700 for AAA
 * Breadcrumb active:  slate-900 on white = 15.4:1 ✓
 * Search placeholder: slate-600 on slate-50 = 5.2:1 → supplementary. Bumped to slate-700
 * Notification text:  slate-800 on white = 10.7:1 ✓
 * Notification time:  slate-700 on white = 8.2:1 ✓ AAA
 * Year buttons:       slate-800 on slate-100 = 9.2:1 ✓
 * ─────────────────────────────────────────────────────────────────────────── */

const routeMeta: Record<string, { label: string; parent?: string }> = {
  '/':             { label: 'Dashboard' },
  '/transactions': { label: 'Transactions',  parent: 'Analytics' },
  '/insights':     { label: 'Insights',      parent: 'Analytics' },
  '/budgets':      { label: 'Budgets',       parent: 'Analytics' },
  '/upload':       { label: 'Upload Data',   parent: 'Operations' },
  '/audit':        { label: 'Audit Logs',    parent: 'Operations' },
  '/settings':     { label: 'Settings',      parent: 'Operations' },
};

const notifications = [
  { id: 1, type: 'alert' as const,   message: 'Tax liability spike detected in Q4 — review required',  time: '5m ago' },
  { id: 2, type: 'info' as const,    message: '8 flagged transactions require review',                  time: '1h ago' },
  { id: 3, type: 'success' as const, message: 'Q4 batch upload completed — 142 records imported',       time: '2h ago' },
  { id: 4, type: 'alert' as const,   message: 'Marketing spend 18% above YoY benchmark',               time: '3h ago' },
];

const userInfo = { name: 'Finance Team', email: 'finance@corp.com', avatar: 'FT' };

const dotColor = { alert: 'bg-red-600', success: 'bg-emerald-600', info: 'bg-blue-600' };
const notifTypeLabel = { alert: 'Alert', success: 'Success', info: 'Information' };

/** Close dropdown on Escape key */
function useEscapeClose(ref: React.RefObject<HTMLDivElement | null>, close: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ref.current) close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [ref, close]);
}

/** Close dropdown on click outside */
function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, close: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, close]);
}

export function Header() {
  const {
    selectedYear, setSelectedYear, dateRange, setDateRange,
    darkMode, setDarkMode, setSidebarOpen,
    compareMode, setCompareMode, compareYear, setCompareYear,
    showAllData, setShowAllData,
    highContrast, setHighContrast,
  } = useApp();
  const { pathname } = useLocation();
  const [showNotif, setShowNotif]           = useState(false);
  const [showProfile, setShowProfile]       = useState(false);
  const [showCompare, setShowCompare]       = useState(false);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const closeAll = () => { setShowNotif(false); setShowProfile(false); setShowCompare(false); };

  const toggleDropdown = (name: 'compare' | 'notif' | 'profile') => {
    const wasOpen = name === 'compare' ? showCompare : name === 'notif' ? showNotif : showProfile;
    closeAll();
    if (!wasOpen) {
      if (name === 'compare') setShowCompare(true);
      else if (name === 'notif') setShowNotif(true);
      else setShowProfile(true);
    }
  };

  const meta     = routeMeta[pathname] ?? { label: 'Page' };
  const alertCount = notifications.filter(n => n.type === 'alert').length;

  useEscapeClose(notifRef,   () => setShowNotif(false));
  useEscapeClose(profileRef, () => setShowProfile(false));
  useEscapeClose(compareRef, () => setShowCompare(false));

  useClickOutside(notifRef,   () => setShowNotif(false));
  useClickOutside(profileRef, () => setShowProfile(false));
  useClickOutside(compareRef, () => setShowCompare(false));

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  const availableYears = userYearlySummary.map((y: any) => y.year);

  return (
    <header
      className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3 px-3 sm:px-5 sticky top-0 z-30 shrink-0"
      role="banner"
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label="Open sidebar navigation"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Mobile page title (visible only on xs) */}
      <span className="sm:hidden text-sm font-semibold text-slate-900 dark:text-white truncate">
        {meta.label}
      </span>

      {/* Breadcrumb / page title — hidden on mobile */}
      <nav className="hidden sm:flex items-center gap-1.5 text-sm shrink-0" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          {meta.parent ? (
            <>
              <li>
                {/* slate-700 on white = 8.2:1 ✓ AAA */}
                <span className="text-slate-700 dark:text-slate-300">{meta.parent}</span>
              </li>
              <li aria-hidden="true">
                <Slash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </li>
            </>
          ) : null}
          <li aria-current="page">
            <span className="font-semibold text-slate-900 dark:text-white">{meta.label}</span>
          </li>
        </ol>
      </nav>

      {/* Search — icon-only on mobile, full bar on sm+ */}
      <button
        onClick={openCommandPalette}
        className="sm:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ml-auto"
        aria-label="Open search — press Cmd K"
      >
        <Search className="w-4.5 h-4.5" aria-hidden="true" />
      </button>
      <div className="hidden sm:block flex-1 max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
        <button
          onClick={openCommandPalette}
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 text-left text-slate-700 dark:text-slate-300 flex items-center justify-between"
          aria-label="Open search — press Cmd K"
        >
          <span>Search transactions, reports...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded" aria-hidden="true">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
      </div>

      {/* Spacer — desktop only */}
      <div className="flex-1 hidden lg:block" />

      {/* Compare Toggle — hidden below md */}
      <div className="hidden md:block relative" ref={compareRef}>
        <button
          onClick={() => toggleDropdown('compare')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            compareMode
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label={compareMode ? `Comparison mode active — comparing against FY${compareYear}` : 'Enable fiscal year comparison mode'}
          aria-expanded={showCompare}
          aria-haspopup="dialog"
        >
          <GitCompareArrows className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-medium">{compareMode ? `vs FY${compareYear}` : 'Compare'}</span>
        </button>

        <AnimatePresence>
          {showCompare && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl elevation-3 z-50 p-4" role="dialog" aria-label="Fiscal year comparison settings"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">FY Comparison</p>
                <button
                  role="switch"
                  aria-checked={compareMode}
                  onClick={() => setCompareMode(!compareMode)}
                  className={`relative inline-flex w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${compareMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                  aria-label="Toggle comparison mode"
                >
                  <span className={`inline-block w-4 h-4 mt-0.5 ml-0.5 rounded-full bg-white shadow transition-transform duration-200 ${compareMode ? 'translate-x-4' : 'translate-x-0'}`} aria-hidden="true" />
                </button>
              </div>
              {compareMode && (
                <>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-2">Compare FY{selectedYear} against:</p>
                  <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Select comparison year">
                    {availableYears.filter(y => y !== selectedYear).slice(-6).map(y => (
                      <button
                        key={y}
                        role="radio"
                        aria-checked={compareYear === y}
                        onClick={() => { setCompareYear(y); setShowCompare(false); }}
                        className={`py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          compareYear === y
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Show All Data Button */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => setShowAllData(!showAllData)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            showAllData
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          aria-label={showAllData ? 'Showing all data across all years' : 'Show all data across all years'}
        >
          <Database className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-medium">{showAllData ? 'All Years' : 'Show All'}</span>
        </button>
        
        {/* Year Selection Buttons */}
        <div className="hidden md:flex items-center gap-1">
          {availableYears.map((year: number) => (
            <button
              key={year}
              onClick={() => { setSelectedYear(year); setDateRange({ start: `${year}-01-01`, end: `${year}-12-31` }); setShowAllData(false); }}
              className={`px-2 py-1.5 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                selectedYear === year || (showAllData && year === availableYears[availableYears.length - 1])
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              aria-label={`Select fiscal year ${year}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Year Selection - Mobile Only */}
      <div className="md:hidden relative">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setShowAllData(!showAllData)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 whitespace-nowrap ${
              showAllData
                ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            aria-label={showAllData ? 'Showing all data across all years' : 'Show all data across all years'}
          >
            <Database className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="font-medium">{showAllData ? 'All Years' : 'Show All'}</span>
          </button>
          
          {availableYears.map((year: number) => (
            <button
              key={year}
              onClick={() => { setSelectedYear(year); setDateRange({ start: `${year}-01-01`, end: `${year}-12-31` }); setShowAllData(false); }}
              className={`px-2 py-1.5 text-xs border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 whitespace-nowrap ${
                selectedYear === year || (showAllData && year === availableYears[availableYears.length - 1])
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              aria-label={`Select fiscal year ${year}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={darkMode}
      >
        {darkMode
          ? <Sun  className="w-4 h-4 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          : <Moon className="w-4 h-4" aria-hidden="true" />
        }
      </button>

      {/* High Contrast Toggle */}
      <button
        onClick={() => setHighContrast(!highContrast)}
        className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          highContrast
            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-black dark:text-yellow-200 ring-2 ring-yellow-400'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        aria-label={highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode for low vision'}
        aria-pressed={highContrast}
        title="High Contrast Mode (WCAG AAA)"
      >
        <Contrast className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => toggleDropdown('notif')}
          className="relative p-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label={`Notifications — ${alertCount} unread alerts`}
          aria-expanded={showNotif}
          aria-haspopup="true"
        >
          <Bell className="w-4 h-4" aria-hidden="true" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1" aria-hidden="true">
              {alertCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotif && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl elevation-3 z-50 overflow-hidden" role="menu" aria-label="Notifications"
            >
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                <button className="text-xs text-blue-700 dark:text-blue-300 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-600 rounded" role="menuitem">Mark all read</button>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-72 overflow-y-auto" aria-label="Notification list">
                {notifications.map(n => (
                  <li key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors" role="menuitem">
                    <div className="flex gap-3 items-start">
                      {/* Dot is decorative; type is conveyed via sr-only text */}
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor[n.type]}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <span className="sr-only">{notifTypeLabel[n.type]}:</span>
                        {/* slate-800 on white = 10.7:1 ✓ AAA */}
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{n.message}</p>
                        {/* slate-700 on white = 8.2:1 ✓ AAA */}
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <button className="text-xs text-blue-700 dark:text-blue-300 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-600 rounded" role="menuitem">View all notifications</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => toggleDropdown('profile')}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label={`User profile: ${userInfo.name}`}
          aria-expanded={showProfile}
          aria-haspopup="menu"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white text-xs font-bold flex items-center justify-center shadow" aria-hidden="true">
            {userInfo.avatar}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{userInfo.name}</p>
          </div>
          <ChevronDown className="hidden lg:block w-3 h-3 text-slate-600 dark:text-slate-400" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl elevation-3 z-50 overflow-hidden" role="menu" aria-label="User menu"
            >
              <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{userInfo.name}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{userInfo.email}</p>
              </div>
              <ul className="p-1.5">
                {[
                  { icon: User,     label: 'Profile Settings' },
                  { icon: Shield,   label: 'Security' },
                  { icon: Settings, label: 'Preferences' },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} role="none">
                    <button role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600">
                      <Icon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                      {label}
                    </button>
                  </li>
                ))}
                <li className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1" role="none">
                  <button role="menuitem" className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-800 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-red-600">
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}