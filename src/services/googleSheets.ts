import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { Transaction } from '../data/types';

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet;
  private isInitialized = false;

  constructor(spreadsheetId: string) {
    this.doc = new GoogleSpreadsheet(spreadsheetId);
  }

  private async initialize() {
    if (this.isInitialized) return;

    const serviceAccountAuth = new JWT({
      email: process.env.VITE_GOOGLE_SHEETS_CLIENT_EMAIL!,
      // Correctly handle escaped newlines in the private key.
      // The service expects literal \\n sequences in the env var, which are then replaced with actual newlines.
      // Using replaceAll with '\\n' to search for literal backslash-n sequences.
      key: process.env.VITE_GOOGLE_SHEETS_PRIVATE_KEY!.replaceAll('\\n', '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await this.doc.useServiceAccountAuth(serviceAccountAuth);
    await this.doc.loadInfo();
    this.isInitialized = true;
  }

  // --- Helper methods for data parsing and transformation ---
  private parseSpreadsheetInfo(sheetUrl: string) {
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
  }

  private normalizeHeader(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  private parseNumber(value: string | number | undefined) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const cleaned = String(value ?? '')
      .replace(/[₹$,]/g, '')
      .replace(/,/g, '')
      .trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private resolveType(value: string | undefined, amount: number): 'income' | 'expense' {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (normalized === 'income' || normalized === 'expense') return normalized;
    return amount < 0 ? 'expense' : 'income';
  }

  private getHeaderIndex(headers: string[], aliases: string[]) {
    for (const alias of aliases) {
      const index = headers.indexOf(alias);
      if (index >= 0) return index;
    }
    return -1;
  }

  private mapSheetValuesToTransactions(values: string[][]): Transaction[] {
    if (!values.length) return [];

    const headers = values[0].map((header) => this.normalizeHeader(String(header)));
    const rows = values.slice(1).filter((row) => row.some((cell) => String(cell ?? '').trim()));

    const fieldIndex = {
      date: this.getHeaderIndex(headers, ['date', 'transaction_date', 'posted_on']),
      description: this.getHeaderIndex(headers, ['description', 'details', 'transaction_description', 'narration']),
      type: this.getHeaderIndex(headers, ['type', 'transaction_type']),
      category: this.getHeaderIndex(headers, ['category', 'group']),
      subCategory: this.getHeaderIndex(headers, ['sub_category', 'subcategory', 'sub_category_name', 'sub_group']),
      amount: this.getHeaderIndex(headers, ['amount', 'value', 'total', 'net_amount']),
      tax: this.getHeaderIndex(headers, ['tax', 'gst', 'vat']),
      paymentMethod: this.getHeaderIndex(headers, ['payment_method', 'paymentmethod', 'method', 'mode']),
      notes: this.getHeaderIndex(headers, ['notes', 'note', 'remarks', 'comment']),
      status: this.getHeaderIndex(headers, ['status', 'approval_status']),
    };

    return rows.map((row, index) => {
      const rawAmount = this.parseNumber(row[fieldIndex.amount]);
      const type = this.resolveType(row[fieldIndex.type], rawAmount);
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
        tax: Math.abs(this.parseNumber(row[fieldIndex.tax])),
        payment_method: String(row[fieldIndex.paymentMethod] ?? 'Unspecified').trim() || 'Unspecified',
        notes: String(row[fieldIndex.notes] ?? '').trim(),
        created_by: 'google.sheets.sync',
        approved_by: status === 'approved' ? 'google.sheets.sync' : '',
        timestamp: new Date(safeDate).toISOString(),
        status,
        attachment: false,
      };
    });
  }
  // --- End of copied helper methods ---

  async getSheetData(sheetTitle: string) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      throw new Error(`Sheet "${sheetTitle}" not found`);
    }

    // Fetch raw values from the sheet. google-spreadsheet's getValues() returns string[][]
    const rawValues = await sheet.getValues();

    if (!rawValues || rawValues.length === 0) {
        return []; // Return empty array if no data
    }

    // Use the integrated mapSheetValuesToTransactions for robust parsing and mapping
    const transactions = this.mapSheetValuesToTransactions(rawValues);

    return transactions;
  }

  async getAllSheetTitles() {
    await this.initialize();
    return Object.keys(this.doc.sheetsByTitle);
  }
}

export const googleSheetsService = new GoogleSheetsService(
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'default-sheet-id'
);