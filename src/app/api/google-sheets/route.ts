import { googleSheetsService } from '../../services/googleSheets';

// For Vite, we'll create a simple API service
export const googleSheetsAPI = {
  async getSheetData(sheetName: string) {
    try {
      const data = await googleSheetsService.getSheetData(sheetName);
      return { data, sheet: sheetName };
    } catch (error) {
      console.error('Google Sheets API Error:', error);
      throw new Error('Failed to fetch data from Google Sheets');
    }
  },

  async getAllSheetTitles() {
    try {
      const sheets = await googleSheetsService.getAllSheetTitles();
      return { sheets };
    } catch (error) {
      console.error('Google Sheets API Error:', error);
      throw new Error('Failed to fetch sheet titles');
    }
  }
};
