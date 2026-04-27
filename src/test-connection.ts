import { testGoogleSheetsConnection } from './utils/testGoogleSheets';

// Run this test in your browser console or as part of your app
testGoogleSheetsConnection().then(result => {
  console.log('Test Result:', result);
}).catch(error => {
  console.error('Test Error:', error);
});
