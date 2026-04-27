import { useApp } from '../context/AppContext';
import { useState, useRef, useCallback } from 'react';
import {
  Upload as UploadIcon, FileText, CheckCircle, AlertTriangle, X,
  Download, Eye, Clipboard, ChevronRight, Loader2, RefreshCw, Check, FileJson
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { PageShell, PageHeader } from '../components/ui/PageShell';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { validateAndCleanTransactions } from '../utils/dataValidation';

type UploadState = 'empty' | 'dragging' | 'processing' | 'validating' | 'success' | 'error' | 'partial';

const SAMPLE_CSV = `date,description,type,category,sub_category,amount,tax,payment_method,notes
2024-01-15,Monthly Payroll - Engineering,expense,Salaries & Benefits,Base Salaries,250000,25000,Bank Transfer,Q1 payroll
2024-01-18,Google Ads Campaign Q1,expense,Marketing,Digital Advertising,45000,4500,Corporate Card,
2024-01-20,SaaS Subscription Revenue - Enterprise,income,Product Revenue,Enterprise,180000,18000,Bank Transfer,Annual renewal
2024-01-22,AWS Infrastructure Cost,expense,Operations,Infrastructure,32000,3200,ACH,Cloud costs
2024-01-25,Consulting Project - Alpha Corp,income,Service Income,Consulting,95000,9500,Wire Transfer,Project milestone`;

const MOCK_PARSED = [
  { id: 1, date: '2024-01-15', description: 'Monthly Payroll - Engineering', type: 'expense', category: 'Salaries & Benefits', sub_category: 'Base Salaries', amount: '250000', tax: '25000', method: 'Bank Transfer', status: 'valid' },
  { id: 2, date: '2024-01-18', description: 'Google Ads Campaign Q1', type: 'expense', category: 'Marketing', sub_category: 'Digital Advertising', amount: '45000', tax: '4500', method: 'Corporate Card', status: 'valid' },
  { id: 3, date: '2024-01-20', description: 'SaaS Subscription Revenue - Enterprise', type: 'income', category: 'Product Revenue', sub_category: 'Enterprise', amount: '180000', tax: '18000', method: 'Bank Transfer', status: 'warning' },
  { id: 4, date: '2024-01-22', description: 'AWS Infrastructure Cost', type: 'expense', category: 'Operations', sub_category: 'Infrastructure', amount: '32000', tax: '3200', method: 'ACH', status: 'valid' },
  { id: 5, date: '2024-01-25', description: 'Consulting Project - Alpha Corp', type: 'income', category: 'Service Income', sub_category: 'Consulting', amount: '95000', tax: '9500', method: 'Wire Transfer', status: 'error' },
];

export default function Upload() {
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<typeof MOCK_PARSED>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((name: string) => {
    setFileName(name);
    setUploadState('processing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadState('validating');
            setTimeout(() => {
              setUploadState('partial');
              setParsedData(MOCK_PARSED);
            }, 1200);
          }, 300);
          return 100;
        }
        return p + Math.random() * 18;
      });
    }, 120);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('empty');
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.json'))) {
      simulateUpload(file.name);
    }
  }, [simulateUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateUpload(file.name);
  };

  const handlePasteSubmit = () => {
    if (!pasteContent.trim()) return;
    simulateUpload('pasted_data.csv');
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleJSON = () => {
    const data = MOCK_PARSED.map(r => ({
      date: r.date, description: r.description, type: r.type, category: r.category,
      sub_category: r.sub_category, amount: Number(r.amount), tax: Number(r.tax),
      payment_method: r.method, notes: '',
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sample_transactions.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const confirmImport = () => {
    setShowConfirm(false);
    setUploadState('success');
  };

  const reset = () => {
    setUploadState('empty');
    setFileName('');
    setProgress(0);
    setParsedData([]);
    setPasteContent('');
  };

  return (
    <PageShell maxWidth="narrow">
      <PageHeader title="Upload Financial Data" description="Import CSV or JSON files for bulk transaction entry and validation" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {uploadState === 'empty' && (
            <div className="space-y-5">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 gap-6">
                {(['file', 'paste'] as const).map(tab => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'blue' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 -mb-px ${activeTab === tab ? 'border-blue-600 text-blue-700 dark:text-blue-300' : 'border-transparent text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                  >
                    {tab === 'file' ? 'File Upload' : 'Paste Data'}
                  </Button>
                ))}
              </div>

              {activeTab === 'file' ? (
                <div
                  onDragOver={e => { e.preventDefault(); setUploadState('dragging'); }}
                  onDragLeave={() => setUploadState('empty')}
                  onDrop={handleDrop}
                  className="border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                    uploadState === 'dragging' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-blue-400'
                  }"
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload CSV file — click or drag and drop"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UploadIcon className="w-8 h-8 text-blue-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-slate-700 dark:text-slate-200 mb-2">Drag & drop your CSV or JSON file here</h2>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mb-6">or click to browse your files</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" /> CSV</span>
                    <span className="flex items-center gap-1"><FileJson className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" aria-hidden="true" /> JSON</span>
                    <span>Up to 50MB</span>
                    <span>Max 10,000 rows</span>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.json" className="hidden" onChange={handleFileChange} aria-hidden="true" />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                  <label htmlFor="paste-area" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Paste transaction data (CSV format)
                  </label>
                  <textarea
                    id="paste-area"
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder={`date,description,type,category,amount\n2024-01-15,Payroll - Engineering,expense,Salaries & Benefits,250000\n...`}
                    rows={10}
                    className="w-full text-xs font-mono p-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => { setPasteContent(SAMPLE_CSV); }}
                    >
                      <Clipboard className="w-3.5 h-3.5" aria-hidden="true" /> Load sample data
                    </Button>
                    <Button
                      variant="blue"
                      onClick={handlePasteSubmit}
                      disabled={!pasteContent.trim()}
                    >
                      Process Data
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(uploadState === 'dragging' || uploadState === 'processing' || uploadState === 'validating') && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center" role="status" aria-live="polite" aria-label={uploadState === 'processing' ? 'Processing file' : 'Validating data'}>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" aria-hidden="true" />
              </div>
              <h2 className="text-slate-700 dark:text-slate-200 mb-2">{uploadState === 'processing' ? 'Processing your file…' : 'Validating data…'}</h2>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">{uploadState === 'processing' ? fileName : 'Running smart categorization & duplicate detection'}</p>
              {uploadState === 'processing' && (
                <div className="max-w-xs mx-auto">
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-150" style={{ width: `${Math.min(100, progress)}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{Math.round(Math.min(100, progress))}%</p>
                </div>
              )}
            </div>
          )}

          {(uploadState === 'success' || uploadState === 'partial' || uploadState === 'error') && parsedData.length > 0 && (
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preview — {parsedData.length} rows parsed</h2>
                <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="Upload preview table">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                      <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold" scope="col">Date</th>
                      <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold" scope="col">Description</th>
                      <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold" scope="col">Type</th>
                      <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold" scope="col">Category</th>
                      <th className="px-4 py-2 text-right text-slate-700 dark:text-slate-300 font-semibold" scope="col">Amount</th>
                      <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-semibold" scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {parsedData.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.date}</td>
                        <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{row.type}</span>
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{row.category}</td>
                        <td className="px-4 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">₹{Number(row.amount).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${row.status === 'valid' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : row.status === 'warning' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {row.status === 'valid' ? <CheckCircle className="w-3 h-3" aria-hidden="true" /> : <AlertTriangle className="w-3 h-3" aria-hidden="true" />}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Template & Help */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Download Templates</h2>
              <p className="text-xs text-muted-foreground mb-4">Download a sample template to see the expected format.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={downloadSample}>
                  <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />CSV Template
                </Button>
                <Button variant="outline" className="w-full" onClick={downloadSampleJSON}>
                  <FileJson className="w-4 h-4 text-blue-600" aria-hidden="true" />JSON Template
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Required Columns</h2>
              <ul className="space-y-1.5">
                {['date', 'description', 'type', 'category', 'amount', 'tax', 'payment_method'].map(col => (
                  <li key={col} className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                    <code className="font-mono text-muted-foreground">{col}</code>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Validation Rules</p>
            <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1">
              <li>• Amounts must be positive integers</li>
              <li>• Date format: YYYY-MM-DD</li>
              <li>• Type must be "income" or "expense"</li>
              <li>• Max 10,000 rows per upload</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <Dialog open={showConfirm} onOpenChange={(open) => { if (!open) setShowConfirm(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>
              <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-700 dark:text-slate-300">Records to import</span><span className="font-semibold text-slate-800 dark:text-slate-200">3</span></div>
                <div className="flex justify-between"><span className="text-slate-700 dark:text-slate-300">Skipped (warnings)</span><span className="font-semibold text-amber-700 dark:text-amber-300">1</span></div>
                <div className="flex justify-between"><span className="text-slate-700 dark:text-slate-300">Skipped (errors)</span><span className="font-semibold text-red-700 dark:text-red-300">1</span></div>
                <div className="flex justify-between border-t pt-2"><span className="text-slate-700 dark:text-slate-300">Status after import</span><span className="font-semibold text-amber-700 dark:text-amber-300">Pending Approval</span></div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">All imported records will require manager approval before reflecting in reports. An audit log entry will be created.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="blue" onClick={confirmImport}>Confirm Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}