import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    // h-screen + overflow-hidden: locks the chrome (sidebar + header) in place.
    // Only the <main> scrolls, keeping the sidebar and header always visible.
    // Sidebar is lg:sticky (in-flow), so flex-1 content naturally adjusts width.
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: sticky on desktop = in document flow, content pushes naturally */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
          aria-label="Main content"
        >
          <ErrorBoundary fallbackTitle="Page failed to load">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />
    </div>
  );
}
