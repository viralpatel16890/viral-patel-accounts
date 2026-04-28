import type { Transaction } from '../data/types';

// Google Sheets configuration interface
export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  sheetTitle?: string;
}

// Client-side caching for Google Sheets data
const CACHE_KEY = 'google-sheets-cached-data';
const CACHE_TIMESTAMP_KEY = 'google-sheets-cache-timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CachedGoogleSheetData {
  transactions: Transaction[];
  lastSynced: string;
}

// Client-side functions for Google Sheets integration
export const getCachedGoogleSheetData = (): CachedGoogleSheetData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const cacheAge = Date.now() - parseInt(timestamp);
    if (cacheAge > CACHE_DURATION) {
      clearCachedGoogleSheetData();
      return null;
    }
    
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

export const setCachedGoogleSheetData = (data: CachedGoogleSheetData): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const clearCachedGoogleSheetData = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch {
    // Silently fail if localStorage is not available
  }
};

// Google Sheets configuration management
const CONFIG_KEY = 'google-sheets-config';

export const getGoogleSheetsConfig = (): GoogleSheetsConfig | null => {
  try {
    const config = localStorage.getItem(CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  } catch {
    return null;
  }
};

export const setGoogleSheetsConfig = (config: GoogleSheetsConfig): void => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const clearGoogleSheetsConfig = (): void => {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const syncGoogleSheetTransactions = async (): Promise<{ transactions: Transaction[]; sheetName?: string; lastSynced?: string }> => {
  try {
    const response = await fetch('/api/google-sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync Google Sheets data');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Sync failed');
    }
    
    // Cache the response
    setCachedGoogleSheetData({
      transactions: data.transactions,
      lastSynced: data.lastSynced,
    });
    
    return {
      transactions: data.transactions,
      sheetName: data.sheetName,
      lastSynced: data.lastSynced
    };
  } catch (error) {
    console.error('Error syncing Google Sheets data:', error);
    throw error;
  }
};

// Force refresh data by clearing cache and syncing
export const forceRefreshGoogleSheetData = async (): Promise<{ transactions: Transaction[]; sheetName?: string; lastSynced?: string }> => {
  clearCachedGoogleSheetData();
  return await syncGoogleSheetTransactions();
};
