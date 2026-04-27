import { GoogleSheetsData } from '../../components/GoogleSheetsData';

export default function GoogleSheetsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Google Sheets Integration</h1>
        <p className="text-gray-600">
          Real-time data from your Google Sheet. This page displays financial transactions and records.
        </p>
      </div>
      
      <GoogleSheetsData />
    </div>
  );
}
