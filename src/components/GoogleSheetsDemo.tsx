import React, { useState, useEffect } from 'react';

interface GoogleSheetsData {
  [key: string]: string | number;
}

const GoogleSheetsDemo: React.FC = () => {
  const [data, setData] = useState<GoogleSheetsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string>('');

  const fetchSheetData = async (sheet: string) => {
    try {
      setLoading(true);
      setError(null);

      // For now, this is a placeholder implementation
      // You'll need to set up a backend API endpoint to handle the actual Google Sheets API calls
      const response = await fetch(`/api/google-sheets?sheet=${encodeURIComponent(sheet)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Google Sheets Integration Demo</h2>
      
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Enter sheet name"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className="px-4 py-2 border rounded-lg flex-1"
          />
          <button
            onClick={() => fetchSheetData(sheetName)}
            disabled={!sheetName || loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Complete the Google Cloud Console setup as described earlier</li>
          <li>Update your .env.local file with the service account credentials</li>
          <li>Share your Google Sheet with the service account email</li>
          <li>Set up a backend API endpoint to handle the Google Sheets API calls</li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleSheetsDemo;
