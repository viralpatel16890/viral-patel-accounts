import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  clearGoogleSheetsConfig as clearStoredGoogleSheetsConfig,
  getCachedGoogleSheetData,
  getGoogleSheetsConfig,
  setGoogleSheetsConfig as persistGoogleSheetsConfig,
  type GoogleSheetsConfig,
} from '../services/googleSheets';
import {
  getUserDataSource,
  resetUserTransactionsToLocal,
  syncUserTransactionsFromGoogleSheet,
  userYearlySummary,
} from '../data/userData';

interface AppContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  sidebarOpen: boolean;            // mobile overlay open/close
  setSidebarOpen: (v: boolean) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  dateRange: { start: string; end: string };
  setDateRange: (dr: { start: string; end: string }) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  maskValues: boolean;
  setMaskValues: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  compareYear: number;
  setCompareYear: (y: number) => void;
  showAllData: boolean;
  setShowAllData: (v: boolean) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  dataSource: 'local-json' | 'google-sheets';
  dataSyncing: boolean;
  dataError: string | null;
  lastSyncedAt: string | null;
  dataVersion: number;
  googleSheetsConfig: GoogleSheetsConfig;
  setGoogleSheetsConfig: (config: Partial<GoogleSheetsConfig>) => void;
  syncGoogleSheetData: () => Promise<void>;
  resetToLocalData: () => void;
  clearGoogleSheetsConnection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [maskValues, setMaskValues] = useState(false);
  const [compareMode, setCompareMode] = useState(() => {
    try { return localStorage.getItem('financeos-compare') === 'true'; } catch { return false; }
  });
  const [compareYear, setCompareYear] = useState(() => {
    try { return parseInt(localStorage.getItem('financeos-compare-year') || '2023') || 2023; } catch { return 2023; }
  });
  const [showAllData, setShowAllData] = useState(true);
  const cachedSheetData = getCachedGoogleSheetData();
  const [dataSource, setDataSource] = useState<'local-json' | 'google-sheets'>(() => getUserDataSource());
  const [dataSyncing, setDataSyncing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => cachedSheetData?.syncedAt ?? null);
  const [dataVersion, setDataVersion] = useState(0);
  const [googleSheetsConfig, setGoogleSheetsConfigState] = useState<GoogleSheetsConfig>(() => getGoogleSheetsConfig());

  // High Contrast mode — for users with low vision (forced black/white)
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('financeos-high-contrast');
      if (saved !== null) return saved === 'true';
      // Respect OS-level forced-colors preference
      return window.matchMedia('(forced-colors: active)').matches;
    } catch { return false; }
  });

  // Apply / remove .high-contrast on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');
    try { localStorage.setItem('financeos-high-contrast', String(highContrast)); } catch {}
  }, [highContrast]);

  // Persist compare preferences
  useEffect(() => {
    try {
      localStorage.setItem('financeos-compare', String(compareMode));
      localStorage.setItem('financeos-compare-year', String(compareYear));
    } catch {}
  }, [compareMode, compareYear]);

  // Dark mode — persisted in localStorage, defaults to system preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('financeos-dark');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Apply / remove .dark on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('financeos-dark', String(darkMode)); } catch {}
  }, [darkMode]);

  const setGoogleSheetsConfig = (config: Partial<GoogleSheetsConfig>) => {
    const next = persistGoogleSheetsConfig(config);
    setGoogleSheetsConfigState(next);
  };

  const syncGoogleSheetData = async () => {
    try {
      setDataSyncing(true);
      setDataError(null);
      const payload = await syncUserTransactionsFromGoogleSheet();
      setDataSource('google-sheets');
      setLastSyncedAt(payload.syncedAt);
      setDataVersion((value) => value + 1);

      if (userYearlySummary.length > 0) {
        const availableYears = userYearlySummary.map((entry) => entry.year);
        const latestYear = Math.max(...availableYears);
        setSelectedYear((current) => (availableYears.includes(current) ? current : latestYear));
      }
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to sync Google Sheet data.');
      throw error;
    } finally {
      setDataSyncing(false);
    }
  };

  const resetToLocalData = () => {
    resetUserTransactionsToLocal();
    setDataSource('local-json');
    setLastSyncedAt(null);
    setDataError(null);
    setDataVersion((value) => value + 1);
  };

  const clearGoogleSheetsConnection = () => {
    clearStoredGoogleSheetsConfig();
    setGoogleSheetsConfigState(getGoogleSheetsConfig());
    resetToLocalData();
  };

  return (
    <AppContext.Provider value={{
      sidebarCollapsed, setSidebarCollapsed,
      sidebarOpen, setSidebarOpen,
      selectedYear, setSelectedYear,
      dateRange, setDateRange,
      reducedMotion, setReducedMotion,
      maskValues, setMaskValues,
      darkMode, setDarkMode,
      compareMode, setCompareMode,
      compareYear, setCompareYear,
      showAllData, setShowAllData,
      highContrast, setHighContrast,
      dataSource,
      dataSyncing,
      dataError,
      lastSyncedAt,
      dataVersion,
      googleSheetsConfig,
      setGoogleSheetsConfig,
      syncGoogleSheetData,
      resetToLocalData,
      clearGoogleSheetsConnection,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};