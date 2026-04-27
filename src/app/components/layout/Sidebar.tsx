import { NavLink } from 'react-router';
import {
  LayoutDashboard, CreditCard, Upload, Lightbulb,
  Target, ScrollText, Settings, ChevronRight, X,
  Building2,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';

const navGroups = [
  {
    label: null,
    items: [
      { path: '/',             icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/transactions', icon: CreditCard,  label: 'Transactions' },
      { path: '/insights',     icon: Lightbulb,   label: 'Insights' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/upload',   icon: Upload,      label: 'Upload Data' },
      { path: '/settings', icon: Settings,    label: 'Settings' },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen } = useApp();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  // Track desktop breakpoint reactively
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Whether the sidebar is visually narrow (icons-only)
  const effectiveCollapsed = sidebarCollapsed && !hoverExpanded;

  const handleMouseEnter = useCallback(() => {
    if (!sidebarCollapsed || !isDesktop) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoverExpanded(true);
  }, [sidebarCollapsed, isDesktop]);

  const handleMouseLeave = useCallback(() => {
    if (!sidebarCollapsed || !isDesktop) return;
    hoverTimeout.current = setTimeout(() => setHoverExpanded(false), 250);
  }, [sidebarCollapsed, isDesktop]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); };
  }, []);

  const showLabels = !effectiveCollapsed;

  // Determine desktop sidebar width:
  //  - Collapsed (no hover): 60px
  //  - Hover-expanded or permanently expanded: 240px
  const desktopWidth = effectiveCollapsed ? 'lg:w-[60px]' : 'lg:w-60';

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        'flex flex-col bg-slate-950 border-r border-slate-800',
        'h-screen shrink-0 z-40',
        // Smooth width + position transitions
        'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        // Desktop: always sticky (in document flow) so content pushes — never overlaps
        // Mobile: fixed overlay as before
        'fixed lg:sticky lg:top-0',
        // Mobile slide-in/out
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Width: 60px collapsed, 240px expanded/hover-expanded — content reflows naturally
        desktopWidth,
        'w-60',
      ].join(' ')}
      aria-label="Main Navigation"
    >
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to content
      </a>

      {/* Logo */}
      <div
        className={[
          'flex items-center gap-3 px-3 py-4 border-b border-slate-800 overflow-hidden',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          effectiveCollapsed ? 'lg:justify-center lg:px-0' : '',
        ].join(' ')}
      >
        <motion.div
          className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Building2 className="w-4 h-4 text-white" aria-hidden="true" />
        </motion.div>

        <AnimatePresence mode="wait">
          {showLabels && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -8, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -8, width: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="flex-1 min-w-0 overflow-hidden"
            >
              <p className="text-white font-bold text-sm tracking-tight leading-tight whitespace-nowrap">FinanceOS</p>
              <p className="text-slate-400 text-xs tracking-wider uppercase mt-0.5 whitespace-nowrap">Enterprise Accounts</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden scrollbar-none" aria-label="Sidebar navigation">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1' : ''}>
            {/* Group label */}
            <AnimatePresence mode="wait">
              {group.label && showLabels && (
                <motion.p
                  key={`label-${gi}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest text-slate-400 select-none whitespace-nowrap"
                >
                  {group.label}
                </motion.p>
              )}
              {group.label && !showLabels && (
                <motion.div
                  key={`divider-${gi}`}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mx-3 my-2 h-px bg-slate-800 origin-center"
                />
              )}
            </AnimatePresence>

            <ul className="px-2 space-y-0.5">
              {group.items.map(({ path, icon: Icon, label }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    end={path === '/'}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm',
                        'transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        'focus:outline-none focus:ring-2 focus:ring-blue-400',
                        'overflow-hidden whitespace-nowrap',
                        effectiveCollapsed ? 'lg:justify-center lg:px-0' : '',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                      ].join(' ')
                    }
                    title={effectiveCollapsed ? label : undefined}
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform duration-200" aria-hidden="true" />
                    <AnimatePresence mode="wait">
                      {showLabels && (
                        <motion.span
                          key={`nav-label-${path}`}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: collapse toggle */}
      <div className="px-2 py-3 border-t border-slate-800 hidden lg:block">
        <motion.button
          onClick={() => { setSidebarCollapsed(!sidebarCollapsed); setHoverExpanded(false); }}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 overflow-hidden"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
          <AnimatePresence mode="wait">
            {showLabels && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </aside>
  );
}
