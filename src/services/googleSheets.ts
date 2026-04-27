import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
      key: process.env.VITE_GOOGLE_SHEETS_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await this.doc.useServiceAccountAuth(serviceAccountAuth);
    await this.doc.loadInfo();
    this.isInitialized = true;
  }

  async getSheetData(sheetTitle: string) {
    await this.initialize();
    const sheet = this.doc.sheetsByTitle[sheetTitle];
    if (!sheet) {
      throw new Error(`Sheet "${sheetTitle}" not found`);
    }
    const rows = await sheet.getRows();
    return rows.map(row => row.toObject());
  }

  async getAllSheetTitles() {
    await this.initialize();
    return Object.keys(this.doc.sheetsByTitle);
  }
}

export const googleSheetsService = new GoogleSheetsService(
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'default-sheet-id'
);
