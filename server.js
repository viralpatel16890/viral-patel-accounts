const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables (you'll need to set these on the server)
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1EhSkx5qFzjWdVTCi-QJuf_OZx7cF1S01';
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || 'google-sheets-service@viral-patel-accounts.iam.gserviceaccount.com';
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';

// Google Sheets Service
class GoogleSheetsService {
  constructor() {
    this.doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    await this.doc.useServiceAccountAuth(serviceAccountAuth);
    await this.doc.loadInfo();
    this.isInitialized = true;
  }

  async getSheetData(sheetTitle) {
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

const sheetsService = new GoogleSheetsService();

// API Routes
app.get('/api/google-sheets', async (req, res) => {
  try {
    const sheets = await sheetsService.getAllSheetTitles();
    const mockSheets = sheets.map(title => ({ title, sheetId: '0' }));
    res.json(mockSheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    // Fallback to mock data
    res.json([
      { title: 'Sheet1', sheetId: '0' },
      { title: 'Financial Data', sheetId: '123456' },
      { title: 'Transactions', sheetId: '789012' }
    ]);
  }
});

app.get('/api/google-sheets/sheet/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    const sheetData = await sheetsService.getSheetData(sheetName);
    res.json({
      sheetName,
      data: sheetData
    });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    // Fallback to mock data
    res.json({
      sheetName: req.params.sheetName,
      data: [
        {
          'Receipt No.': 'R001',
          'Date': '2024-01-01',
          'Sub-Categories': 'Software',
          'Product Names': 'Domain Registration',
          'Categories / Types': 'Service',
          'Income / Expense': 'Income',
          'ICANN fee': 0.18,
          'Length': '1 year',
          'Subtotal amount': 15,
          'Tax amount': 1.35,
          'Order total': 16.53
        }
      ]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Google Sheets API server running on port ${PORT}`);
});
