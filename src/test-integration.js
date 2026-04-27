// Copy and paste this into your browser console
console.log('Testing Google Sheets integration...');

// Test 1: Check if environment variables are accessible
console.log('Environment check:');
console.log('- Client Email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? '✓' : '✗');
console.log('- Spreadsheet ID:', process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? '✓' : '✗');

// Test 2: Try to fetch available sheets
fetch('/api/google-sheets')
  .then(response => response.json())
  .then(data => {
    console.log('Available sheets:', data);
  })
  .catch(error => {
    console.error('Error fetching sheets:', error);
  });

// Test 3: Try to fetch data from a specific sheet (replace 'Sheet1' with your actual sheet name)
fetch('/api/google-sheets?sheet=Sheet1')
  .then(response => response.json())
  .then(data => {
    console.log('Sheet data:', data);
  })
  .catch(error => {
    console.error('Error fetching sheet data:', error);
  });
