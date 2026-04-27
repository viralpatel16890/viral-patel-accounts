// Simple test function to verify Google Sheets connection
export const testGoogleSheetsConnection = async () => {
  try {
    console.log('Testing Google Sheets connection...');
    
    // For Vite, environment variables need VITE_ prefix for client-side access
    // Server-side can use process.env directly
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    console.log('Client Email:', clientEmail ? '✓ Loaded' : '✗ Missing');
    console.log('Spreadsheet ID:', spreadsheetId ? '✓ Loaded' : '✗ Missing');
    
    if (!clientEmail || !spreadsheetId) {
      throw new Error('Missing environment variables. Check .env.local file.');
    }
    
    return { success: true, message: 'Environment variables loaded successfully' };
  } catch (error) {
    console.error('Google Sheets test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
