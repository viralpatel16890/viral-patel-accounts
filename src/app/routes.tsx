import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardSkeleton, PageSkeleton } from './components/ui/Skeletons';

// Lazy-loaded pages — each page is code-split into its own chunk
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const UserDashboard    = lazy(() => import('./pages/UserDashboard'));
const Transactions     = lazy(() => import('./pages/Transactions'));
const Upload           = lazy(() => import('./pages/Upload'));
const Insights         = lazy(() => import('./pages/Insights'));
// Non-critical pages - loaded on demand
const Budgets          = lazy(() => import('./pages/Budgets').then(module => ({ default: module.default })));
const AuditLogs        = lazy(() => import('./pages/AuditLogs').then(module => ({ default: module.default })));
const Settings         = lazy(() => import('./pages/Settings').then(module => ({ default: module.default })));
const GoogleSheets     = lazy(() => import('./pages/GoogleSheets').then(module => ({ default: module.default })));

// Suspense wrappers with route-specific skeletons
function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function LazyPage({ Component }: { Component: LazyExoticComponent<ComponentType<any>> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

// Root wrapper component that provides AppContext to all routes
function RootLayout() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'user-dashboard', element: <LazyPage Component={UserDashboard} /> },
      { path: 'transactions', element: <LazyPage Component={Transactions} /> },
      { path: 'upload',       element: <LazyPage Component={Upload} /> },
      { path: 'insights',     element: <LazyPage Component={Insights} /> },
      { path: 'budgets',      element: <LazyPage Component={Budgets} /> },
      { path: 'audit',        element: <LazyPage Component={AuditLogs} /> },
      { path: 'settings',     element: <LazyPage Component={Settings} /> },
      { path: 'google-sheets', element: <LazyPage Component={GoogleSheets} /> },
    ],
  },
]);