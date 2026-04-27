import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Filter, ChevronUp, ChevronDown, Download, Trash2,
  Edit3, Paperclip, CheckCircle, Clock, Flag, ChevronLeft, ChevronRight,
  X, Check, AlertCircle, Upload, FileText, FileJson, FileSpreadsheet
} from 'lucide-react';
import { getUserTransactionsForYear, getAllUserTransactions, formatCurrency } from '../data/userData';
import type { Transaction } from '../data/types';
import { useApp } from '../context/AppContext';
import { useChartTheme } from '../components/ui/useChartTheme';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { PageShell, PageHeader, FilterBar } from '../components/ui/PageShell';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog';
import { AdvancedSearch } from '../components/search/AdvancedSearch';

const COLUMNS = ['Date', 'Description', 'Category', 'Sub-category', 'Type', 'Amount', 'Tax', 'Method', 'Status', 'Actions'];
const CATEGORIES = ['All', 'Freelancing', 'Lectures', 'Domains', 'Server Expenses', 'Employee Salary', 'Marketing & Advertising', 'Google Ads', 'Learning & RnD Expenses', 'Server Income from Clients', 'G-Suite Accounts', 'YouTube Revenue Income', 'GoDaddy Business Email Plus', 'SSL Certificate', 'Website Designing', 'Google Workspace', 'SSL Certificate + Domain', 'Developer Account', 'Hosting Server', 'Fiverr Gigs'];
const METHODS = ['All', 'Bank Transfer', 'Corporate Card', 'ACH', 'Wire Transfer', 'Check', 'Direct Debit'];
const PAGE_SIZE = 15;

type SortKey = keyof Transaction;
type SortDir = 'asc' | 'desc';

const statusIcon = {
  approved: <CheckCircle className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />,
  flagged: <Flag className="w-3.5 h-3.5 text-red-700" aria-hidden="true" />,
};
const statusBadge = {
  approved: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  flagged: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function Transactions() {
  const { maskValues, selectedYear, showAllData, dataVersion } = useApp();
  const ct = useChartTheme();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [localData, setLocalData] = useState<Transaction[]>(() => showAllData ? getAllUserTransactions() : getUserTransactionsForYear(selectedYear));
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(localData);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDragging, setImportDragging] = useState(false);
  const [importPreview, setImportPreview] = useState<Transaction[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset data when year or showAllData changes
  useEffect(() => {
    setLocalData(showAllData ? getAllUserTransactions() : getUserTransactionsForYear(selectedYear));
    setPage(1);
    setSearch('');
    setCategoryFilter('All');
    setMethodFilter('All');
    setTypeFilter('all');
    setStatusFilter('all');
    setSelected(new Set());
    setEditingId(null);
  }, [selectedYear, showAllData, dataVersion]);

  // All users now have full permissions (merged personas)
  const canEdit = true;
  const canDelete = true;

  const filtered = useMemo(() => {
    let data = [...filteredTransactions]; // Use filteredTransactions from Advanced Search instead of localData
    // Apply additional filters if needed (legacy compatibility)
    if (categoryFilter !== 'All') data = data.filter(t => t.category === categoryFilter);
    if (methodFilter !== 'All') data = data.filter(t => t.payment_method === methodFilter);
    if (typeFilter !== 'all') data = data.filter(t => t.type === typeFilter);
    if (statusFilter !== 'all') data = data.filter(t => t.status === statusFilter);
    data.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return data;
  }, [filteredTransactions, categoryFilter, methodFilter, typeFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleRow = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(t => t.transaction_id)));
  };

  const handleDelete = () => {
    setLocalData(prev => prev.filter(t => t.transaction_id !== deleteId));
    setDeleteId(null);
  };

  const handleEdit = (id: string, field: 'description', value: string) => {
    setLocalData(prev => prev.map(t => t.transaction_id === id ? { ...t, [field]: value } : t));
    setEditingId(null);
  };

  // Summary stats
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // ── Export helpers ──────────────────────────────────────────────────────────
  const exportFields: (keyof Transaction)[] = ['transaction_id','date','description','type','category','sub_category','amount','tax','payment_method','notes','status'];

  const exportCSV = () => {
    const rows = (selected.size > 0 ? filtered.filter(t => selected.has(t.transaction_id)) : filtered);
    const header = exportFields.join(',');
    const body = rows.map(t => exportFields.map(f => {
      const v = String(t[f] ?? '');
      return v.includes(',') || v.includes('"') || v.includes('\n') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_FY${selectedYear}${selected.size > 0 ? '_selected' : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    const rows = (selected.size > 0 ? filtered.filter(t => selected.has(t.transaction_id)) : filtered);
    const data = rows.map(t => Object.fromEntries(exportFields.map(f => [f, t[f]])));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_FY${selectedYear}${selected.size > 0 ? '_selected' : ''}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // ── Import helpers ──────────────────────────────────────────────────────────
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (inQuotes) {
        if (ch === '"' && row[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else current += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { result.push(current.trim()); current = ''; }
        else current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const processImportFile = (file: File) => {
    setImportError('');
    setImportPreview([]);
    setImportSuccess(false);
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let parsed: Partial<Transaction>[] = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          parsed = Array.isArray(json) ? json : [json];
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) { setImportError('CSV must have a header row and at least one data row.'); return; }
          const headers = parseCSVRow(lines[0]);
          parsed = lines.slice(1).map(line => {
            const vals = parseCSVRow(line);
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return obj;
          });
        } else {
          setImportError('Unsupported file format. Please use .csv or .json files.');
          return;
        }

        // Validate and normalize
        const normalized: Transaction[] = parsed.map((row, idx) => ({
          transaction_id: String(row.transaction_id || `IMP-${Date.now()}-${idx}`),
          date: String(row.date || new Date().toISOString().split('T')[0]),
          description: String(row.description || ''),
          type: (row.type === 'income' || row.type === 'expense') ? row.type : 'expense',
          category: String(row.category || 'Uncategorized'),
          sub_category: String(row.sub_category || ''),
          amount: Number(row.amount) || 0,
          tax: Number(row.tax) || 0,
          payment_method: String(row.payment_method || 'Bank Transfer'),
          notes: String(row.notes || ''),
          created_by: 'Import',
          approved_by: '',
          timestamp: new Date().toISOString(),
          status: 'pending' as const,
        }));

        if (normalized.length === 0) { setImportError('No valid records found in the file.'); return; }
        if (normalized.some(t => !t.description || t.amount <= 0)) {
          setImportError('Some rows have missing descriptions or invalid amounts. They will be imported with warnings.');
        }
        setImportPreview(normalized);
      } catch (err) {
        setImportError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleImportDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImportDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImportFile(file);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImportFile(file);
  };

  const confirmImport = () => {
    setLocalData(prev => [...importPreview, ...prev]);
    setImportSuccess(true);
    setTimeout(() => {
      setShowImportModal(false);
      setImportPreview([]);
      setImportFileName('');
      setImportError('');
      setImportSuccess(false);
    }, 1500);
  };

  const resetImport = () => {
    setImportPreview([]);
    setImportFileName('');
    setImportError('');
    setImportSuccess(false);
  };

  return (
    <PageShell>
      <PageHeader title="Transactions" description={`${filtered.length} records · FY${selectedYear}`}>
        {selected.size > 0 && (
          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
        )}

        {/* Import Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setShowImportModal(true); resetImport(); }}
          aria-label="Import transactions"
        >
          <Upload className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Import</span>
        </Button>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            aria-label="Export transactions"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3" aria-hidden="true" />
          </Button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-card border rounded-xl elevation-3 z-30 overflow-hidden" role="menu">
              <p className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider border-b">
                {selected.size > 0 ? `Export ${selected.size} selected` : `Export all ${filtered.length} filtered`}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportCSV}
                className="w-full justify-start"
                role="menuitem"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <div className="flex flex-col items-start">
                  <p className="font-medium">Export as CSV</p>
                  <p className="text-xs text-muted-foreground">Comma-separated values</p>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportJSON}
                className="w-full justify-start"
                role="menuitem"
              >
                <FileJson className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <div className="flex flex-col items-start">
                  <p className="font-medium">Export as JSON</p>
                  <p className="text-xs text-muted-foreground">Structured data format</p>
                </div>
              </Button>
            </div>
          )}
        </div>

        <Button
          variant={showFilters ? 'blue' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filters {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </PageHeader>

      {/* Summary Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome, true), color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Total Expenses', value: formatCurrency(totalExpense, true), color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Net Position', value: formatCurrency(totalIncome - totalExpense, true), color: totalIncome >= totalExpense ? 'text-emerald-600' : 'text-red-600', bg: 'bg-slate-50 border-slate-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg}`}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color} ${maskValues ? 'blur-sm' : ''}`}>{maskValues ? '••••' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Advanced Search Component */}
      <AdvancedSearch
        transactions={localData}
        onFilteredResults={setFilteredTransactions}
        categories={CATEGORIES.filter(cat => cat !== 'All')}
      />

      {/* Transaction Table */}
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Transactions table">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-3 py-3 text-left">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded focus:ring-blue-500" aria-label="Select all transactions on this page" />
                  </th>
                  {(['date', 'description', 'type', 'category', 'amount', 'payment_method', 'status'] as SortKey[]).map(col => (
                    <th key={col} className="px-3 py-3 text-left">
                      <Button variant="ghost" size="sm" onClick={() => handleSort(col)} className="flex items-center gap-1 font-semibold uppercase tracking-wider">
                        {col.replace('_', ' ')}
                        {sortKey === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                      </Button>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {paginated.map(t => (
                  <tr key={t.transaction_id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${selected.has(t.transaction_id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selected.has(t.transaction_id)} onChange={() => toggleRow(t.transaction_id)} className="rounded focus:ring-blue-500" aria-label={`Select transaction ${t.transaction_id}`} />
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-200 whitespace-nowrap">{t.date}</td>
                    <td className="px-3 py-3 max-w-[180px]">
                      {editingId === t.transaction_id ? (
                        <input defaultValue={t.description} onBlur={e => handleEdit(t.transaction_id, 'description', e.target.value)} className="w-full text-xs px-1.5 py-1 border border-blue-400 rounded bg-white dark:bg-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Edit description" />
                      ) : (
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{t.description}</p>
                          <p className="text-slate-400 text-xs">{t.transaction_id}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-200 whitespace-nowrap">{t.category}</td>
                    <td className={`px-3 py-3 font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {maskValues ? '••••••' : `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, true)}`}
                    </td>
                    <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.payment_method}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : t.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {t.status === 'approved' ? <CheckCircle className="w-3 h-3" aria-hidden="true" /> : t.status === 'pending' ? <Clock className="w-3 h-3" aria-hidden="true" /> : <AlertCircle className="w-3 h-3" aria-hidden="true" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {editingId === t.transaction_id ? (
                          <>
                            <Button variant="ghost" size="iconSm" onClick={() => setEditingId(null)} className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" aria-label="Save edit"><Check className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="iconSm" onClick={() => setEditingId(null)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Cancel edit"><X className="w-3.5 h-3.5" /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="iconSm" onClick={() => setEditingId(t.transaction_id)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30" aria-label={`Edit ${t.transaction_id}`}><Edit3 className="w-3.5 h-3.5" /></Button>
                            {t.attachment && <Paperclip className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500" aria-label="Has attachment" />}
                            <Button variant="ghost" size="iconSm" onClick={() => setDeleteId(t.transaction_id)} className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" aria-label={`Delete ${t.transaction_id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-700 dark:text-slate-300">{filtered.length} results · Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page + i - 2;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${pg === page ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`} aria-label={`Page ${pg}`} aria-current={pg === page ? 'page' : undefined}>{pg}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirm modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>This will permanently remove <span className="font-semibold text-foreground">{deleteId}</span> from the ledger. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={handleDelete} variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onOpenChange={(open) => { if (!open) { setShowImportModal(false); resetImport(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader>
            <DialogTitle>Import Transactions</DialogTitle>
            <DialogDescription>Upload CSV or JSON files to add transactions</DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="px-0">
            {importSuccess ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-2">Import Successful</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{importPreview.length} transactions added to the ledger.</p>
              </div>
            ) : importPreview.length > 0 ? (
              <div className="space-y-4">
                {/* File info */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate">{importFileName}</p>
                    <p className="text-xs text-blue-500 dark:text-blue-400">{importPreview.length} records parsed</p>
                  </div>
                  <button onClick={resetImport} className="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded">Change file</button>
                </div>

                {importError && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">{importError}</p>
                  </div>
                )}

                {/* Preview table */}
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Preview (first {Math.min(importPreview.length, 8)} of {importPreview.length})</p>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-xs" aria-label="Import preview table">
                      <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Date</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Description</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Type</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Category</th>
                          <th className="px-3 py-2 text-right text-slate-500 dark:text-slate-400 font-semibold">Amount</th>
                          <th className="px-3 py-2 text-left text-slate-500 dark:text-slate-400 font-semibold">Valid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {importPreview.slice(0, 8).map(row => {
                          const hasWarning = !row.description || row.amount <= 0;
                          return (
                            <tr key={row.transaction_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.date}</td>
                              <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-medium max-w-[180px] truncate">{row.description || '—'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{row.type}</span>
                              </td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{row.category}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(row.amount, true)}</td>
                              <td className="px-3 py-2">
                                {hasWarning
                                  ? <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-label="Has warnings" />
                                  : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-label="Valid" />
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 p-3 text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-white">{importPreview.length}</p>
                    <p className="text-xs text-slate-500">Total Records</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{importPreview.filter(t => t.description && t.amount > 0).length}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">Valid</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-center">
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{importPreview.filter(t => !t.description || t.amount <= 0).length}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500">Warnings</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {importError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-xs text-red-700 dark:text-red-300">{importError}</p>
                  </div>
                )}

                {/* Drag & drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setImportDragging(true); }}
                  onDragLeave={() => setImportDragging(false)}
                  onDrop={handleImportDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                    importDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  aria-label="Upload CSV or JSON file"
                >
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mb-1.5">Drag & drop your file here</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">or click to browse</p>
                  <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> CSV</span>
                    <span className="flex items-center gap-1"><FileJson className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" /> JSON</span>
                    <span>Up to 50MB</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={handleImportFileChange}
                    aria-hidden="true"
                  />
                </div>

                {/* Format guide */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" /> CSV Format
                    </p>
                    <pre className="text-xs text-slate-500 dark:text-slate-400 font-mono leading-relaxed overflow-x-auto">
{`date,description,type,...
2024-01-15,Payroll,expense,...`}
                    </pre>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" /> JSON Format
                    </p>
                    <pre className="text-xs text-slate-500 dark:text-slate-400 font-mono leading-relaxed overflow-x-auto">
{`[{ "date": "2024-01-15",
   "description": "...",
   "type": "expense", ... }]`}
                    </pre>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Required fields</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    date, description, type (income/expense), category, amount. Optional: sub_category, tax, payment_method, notes, transaction_id.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!importSuccess && (
            <DialogFooter>
              <p className="text-xs text-slate-400">
                {importPreview.length > 0
                  ? 'Imported records will appear as "pending" status.'
                  : 'Tip: Export existing data first to see the expected format.'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowImportModal(false)}>Cancel</Button>
                {importPreview.length > 0 && (
                  <Button onClick={confirmImport} variant="blue">
                    Import {importPreview.length} Records
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden file input for import */}
      <input ref={fileInputRef} type="file" accept=".csv,.json" className="hidden" onChange={handleImportFileChange} aria-hidden="true" />
    </PageShell>
  );
}