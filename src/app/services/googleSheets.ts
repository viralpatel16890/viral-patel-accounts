import type { Transaction } from '../data/types';

export interface GoogleSheetsConfig {
  clientId: string;
  sheetUrl: string;
  range: string;
}

export interface GoogleSheetCache {
  transactions: Transaction[];
  syncedAt: string;
  sourceLabel: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

const STORAGE_KEYS = {
  config: 'financeos-google-sheets-config',
  cache: 'financeos-google-sheets-cache',
} as const;

const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1EhSkx5qFzjWdVTCi-QJuf_OZx7cF1S01/edit?gid=313467811#gid=313467811';
const DEFAULT_RANGE = '';

const defaultConfig = (): GoogleSheetsConfig => ({
  clientId: '',
  sheetUrl: DEFAULT_SHEET_URL,
  range: DEFAULT_RANGE,
});

const safeWindow = () => (typeof window !== 'undefined' ? window : undefined);

export const getGoogleSheetsConfig = (): GoogleSheetsConfig => {
  const defaults = defaultConfig();

  try {
    const raw = safeWindow()?.localStorage.getItem(STORAGE_KEYS.config);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<GoogleSheetsConfig>;
    return {
      clientId: String(parsed.clientId ?? defaults.clientId).trim(),
      sheetUrl: String(parsed.sheetUrl ?? defaults.sheetUrl).trim(),
      range: String(parsed.range ?? defaults.range).trim(),
    };
  } catch {
    return defaults;
  }
};

export const setGoogleSheetsConfig = (config: Partial<GoogleSheetsConfig>): GoogleSheetsConfig => {
  const current = getGoogleSheetsConfig();
  const next: GoogleSheetsConfig = {
    clientId: String(config.clientId ?? current.clientId).trim(),
    sheetUrl: String(config.sheetUrl ?? current.sheetUrl).trim(),
    range: String(config.range ?? current.range).trim(),
  };

  try {
    safeWindow()?.localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(next));
  } catch {
    // ignore storage failures
  }

  return next;
};

export const clearGoogleSheetsConfig = () => {
  try {
    safeWindow()?.localStorage.removeItem(STORAGE_KEYS.config);
  } catch {
    // ignore storage failures
  }
};

export const getCachedGoogleSheetData = (): GoogleSheetCache | null => {
  try {
    const raw = safeWindow()?.localStorage.getItem(STORAGE_KEYS.cache);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleSheetCache;
    return Array.isArray(parsed.transactions) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearCachedGoogleSheetData = () => {
  try {
    safeWindow()?.localStorage.removeItem(STORAGE_KEYS.cache);
  } catch {
    // ignore storage failures
  }
};

const loadGoogleIdentityScript = async (): Promise<void> => {
  if (safeWindow()?.google?.accounts?.oauth2) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]');

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(script);
  });
};

const requestGoogleAccessToken = async (clientId: string): Promise<string> => {
  if (!clientId) {
    throw new Error('Add a Google OAuth Client ID before syncing the sheet.');
  }

  await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || 'Google authorization failed.'));
          return;
        }
        resolve(response.access_token);
      },
    });

    if (!tokenClient) {
      reject(new Error('Google OAuth client could not be initialized.'));
      return;
    }

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

const parseSpreadsheetInfo = (sheetUrl: string) => {
  const trimmed = sheetUrl.trim();
  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const directIdMatch = trimmed.match(/^[a-zA-Z0-9-_]{20,}$/);
  const spreadsheetId = idMatch?.[1] || directIdMatch?.[0] || '';

  let gid = '';
  try {
    const url = new URL(trimmed);
    gid = url.searchParams.get('gid') || url.hash.match(/gid=(\d+)/)?.[1] || '';
  } catch {
    gid = trimmed.match(/gid=(\d+)/)?.[1] || '';
  }

  if (!spreadsheetId) {
    throw new Error('The Google Sheet URL is invalid. Please paste the full sheet link.');
  }

  return { spreadsheetId, gid };
};

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const parseNumber = (value: string | number | undefined) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? '')
    .replace(/[₹$,]/g, '')
    .replace(/,/g, '')
    .trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const resolveType = (value: string | undefined, amount: number): 'income' | 'expense' => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'income' || normalized === 'expense') return normalized;
  return amount < 0 ? 'expense' : 'income';
};

const getHeaderIndex = (headers: string[], aliases: string[]) => {
  for (const alias of aliases) {
    const index = headers.indexOf(alias);
    if (index >= 0) return index;
  }
  return -1;
};

const mapSheetValuesToTransactions = (values: string[][]): Transaction[] => {
  if (!values.length) return [];

  const headers = values[0].map((header) => normalizeHeader(String(header)));
  const rows = values.slice(1).filter((row) => row.some((cell) => String(cell ?? '').trim()));

  const fieldIndex = {
    date: getHeaderIndex(headers, ['date', 'transaction_date', 'posted_on']),
    description: getHeaderIndex(headers, ['description', 'details', 'transaction_description', 'narration']),
    type: getHeaderIndex(headers, ['type', 'transaction_type']),
    category: getHeaderIndex(headers, ['category', 'group']),
    subCategory: getHeaderIndex(headers, ['sub_category', 'subcategory', 'sub_category_name', 'sub_group']),
    amount: getHeaderIndex(headers, ['amount', 'value', 'total', 'net_amount']),
    tax: getHeaderIndex(headers, ['tax', 'gst', 'vat']),
    paymentMethod: getHeaderIndex(headers, ['payment_method', 'paymentmethod', 'method', 'mode']),
    notes: getHeaderIndex(headers, ['notes', 'note', 'remarks', 'comment']),
    status: getHeaderIndex(headers, ['status', 'approval_status']),
  };

  return rows.map((row, index) => {
    const rawAmount = parseNumber(row[fieldIndex.amount]);
    const type = resolveType(row[fieldIndex.type], rawAmount);
    const amount = Math.abs(rawAmount);
    const rawStatus = String(row[fieldIndex.status] ?? 'approved').trim().toLowerCase();
    const status: Transaction['status'] = rawStatus === 'flagged' || rawStatus === 'pending' ? rawStatus : 'approved';
    const rawDate = String(row[fieldIndex.date] ?? '').trim();
    const safeDate = rawDate || new Date().toISOString().split('T')[0];

    return {
      transaction_id: `GSHEET-TXN-${String(index + 1).padStart(4, '0')}`,
      date: safeDate,
      description: String(row[fieldIndex.description] ?? `Imported row ${index + 1}`).trim(),
      type,
      category: String(row[fieldIndex.category] ?? 'Uncategorized').trim() || 'Uncategorized',
      sub_category: String(row[fieldIndex.subCategory] ?? 'General').trim() || 'General',
      amount,
      tax: Math.abs(parseNumber(row[fieldIndex.tax])),
      payment_method: String(row[fieldIndex.paymentMethod] ?? 'Unspecified').trim() || 'Unspecified',
      notes: String(row[fieldIndex.notes] ?? '').trim(),
      created_by: 'google.sheets.sync',
      approved_by: status === 'approved' ? 'google.sheets.sync' : '',
      timestamp: new Date(safeDate).toISOString(),
      status,
      attachment: false,
    };
  });
};

const resolveSheetRange = async (accessToken: string, spreadsheetId: string, gid: string, preferredRange: string) => {
  if (preferredRange.trim()) return preferredRange.trim();

  const fallbackRange = 'A1:Z5000';
  if (!gid) return fallbackRange;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return fallbackRange;

  const metadata = await response.json() as {
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };

  const matchedSheet = metadata.sheets?.find((sheet) => String(sheet.properties?.sheetId ?? '') === gid);
  const sheetTitle = matchedSheet?.properties?.title;

  return sheetTitle ? `'${sheetTitle.replace(/'/g, "''")}'!${fallbackRange}` : fallbackRange;
};

const storeCache = (payload: GoogleSheetCache) => {
  try {
    safeWindow()?.localStorage.setItem(STORAGE_KEYS.cache, JSON.stringify(payload));
  } catch {
    // ignore storage failures
  }
};

export const syncGoogleSheetTransactions = async (configOverride?: Partial<GoogleSheetsConfig>): Promise<GoogleSheetCache> => {
  const config = configOverride ? setGoogleSheetsConfig(configOverride) : getGoogleSheetsConfig();
  const { spreadsheetId, gid } = parseSpreadsheetInfo(config.sheetUrl);
  const accessToken = await requestGoogleAccessToken(config.clientId);
  const range = await resolveSheetRange(accessToken, spreadsheetId, gid, config.range);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API request failed (${response.status}). ${errorText}`);
  }

  const data = await response.json() as { values?: string[][] };
  const transactions = mapSheetValuesToTransactions(data.values ?? []);

  if (!transactions.length) {
    throw new Error('No transaction rows were found. Ensure the first row contains headers like date, description, type, category, amount, and payment_method.');
  }

  const payload: GoogleSheetCache = {
    transactions,
    syncedAt: new Date().toISOString(),
    sourceLabel: `Google Sheets (${range})`,
  };

  storeCache(payload);
  return payload;
};
