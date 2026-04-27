// Simple API mock for Google Sheets integration
// In production, this would connect to actual Google Sheets API

export async function GET() {
  try {
    // Mock response for testing
    const mockSheets = [
      { title: 'Sheet1', sheetId: '0' },
      { title: 'Financial Data', sheetId: '123456' },
      { title: 'Transactions', sheetId: '789012' }
    ];

    return new Response(JSON.stringify(mockSheets), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch sheets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
