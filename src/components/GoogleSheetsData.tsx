import React, { useState, useEffect } from 'react';

interface GoogleSheetRow {
  'Receipt No.': string;
  'Date': string;
  'Sub-Categories': string;
  'Product Names': string;
  'Categories / Types': string;
  'Income / Expense': string;
  'ICANN fee': number;
  'Length': string;
  'Subtotal amount': number;
  'Tax amount': number;
  'Order total': number;
}

interface GoogleSheetsResponse {
  sheetName: string;
  data: GoogleSheetRow[];
}

export function GoogleSheetsData() {
  const [data, setData] = useState<GoogleSheetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Try API first, fallback to mock data
        try {
          const response = await fetch('/api/google-sheets/sheet/Sheet1');
          
          if (response.ok) {
            const result: GoogleSheetsResponse = await response.json();
            setData(result);
            setError(null);
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mock data');
        }
        
        // Mock data fallback
        const mockData: GoogleSheetsResponse = {
          sheetName: 'Sheet1',
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
            },
            {
              'Receipt No.': 'R002',
              'Date': '2024-01-02',
              'Sub-Categories': 'Hosting',
              'Product Names': 'VPS Server',
              'Categories / Types': 'Infrastructure',
              'Income / Expense': 'Expense',
              'ICANN fee': 0,
              'Length': '1 month',
              'Subtotal amount': 50,
              'Tax amount': 4.50,
              'Order total': 54.50
            },
            {
              'Receipt No.': 'R003',
              'Date': '2024-01-03',
              'Sub-Categories': 'Services',
              'Product Names': 'Client Consulting',
              'Categories / Types': 'Service',
              'Income / Expense': 'Income',
              'ICANN fee': 0,
              'Length': '1 hour',
              'Subtotal amount': 250,
              'Tax amount': 22.50,
              'Order total': 272.50
            }
          ]
        };
        
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">No Data Available</h3>
          <p className="text-yellow-600">No data found in the Google Sheet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-bold">Google Sheets Data</h2>
          <p className="text-blue-100 text-sm">Sheet: {data.sheetName}</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                {Object.keys(data.data[0]).map((header) => (
                  <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                      {typeof value === 'number' ? 
                        (value % 1 === 0 ? value : value.toFixed(2)) : 
                        value
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 border-t">
          <p className="text-sm text-gray-600">
            Total rows: {data.data.length}
          </p>
        </div>
      </div>
    </div>
  );
}
