import { useState, useEffect } from 'react';

interface GoogleSheetsData {
  data: any[];
  sheet: string;
}

interface UseGoogleSheetsReturn {
  data: any[] | null;
  loading: boolean;
  error: string | null;
  sheets: string[] | null;
  refetch: (sheetName?: string) => Promise<void>;
}

export const useGoogleSheets = (sheetName?: string): UseGoogleSheetsReturn => {
  const [data, setData] = useState<any[] | null>(null);
  const [sheets, setSheets] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (targetSheet?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = targetSheet 
        ? `/api/google-sheets?sheet=${encodeURIComponent(targetSheet)}`
        : '/api/google-sheets';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const result: GoogleSheetsData | { sheets: string[] } = await response.json();
      
      if ('sheets' in result) {
        setSheets(result.sheets);
        setData(null);
      } else {
        setData(result.data);
        setSheets(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(sheetName);
  }, [sheetName]);

  const refetch = (targetSheet?: string) => fetchData(targetSheet);

  return { data, loading, error, sheets, refetch };
};
