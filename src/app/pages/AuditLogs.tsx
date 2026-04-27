import { useState, ReactNode } from 'react';
import {
  ScrollText, Download, Search, Filter, Upload, Edit3, CheckCircle,
  Trash2, Eye, FileText, Shield, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { auditLogs } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { PageShell, PageHeader } from '../components/ui/PageShell';

const actionConfig: Record<string, { icon: ReactNode; color: string; bg: string }> = {
  UPLOAD:  { icon: <Upload className="w-3.5 h-3.5" aria-hidden="true" />,      color: 'text-blue-700 dark:text-blue-300',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  EDIT:    { icon: <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />,       color: 'text-amber-700 dark:text-amber-300',  bg: 'bg-amber-50 dark:bg-amber-900/30' },
  APPROVE: { icon: <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  FLAG:    { icon: <Filter className="w-3.5 h-3.5" aria-hidden="true" />,      color: 'text-red-700 dark:text-red-300',      bg: 'bg-red-50 dark:bg-red-900/30' },
  DELETE:  { icon: <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />,      color: 'text-red-700 dark:text-red-300',      bg: 'bg-red-50 dark:bg-red-900/30' },
  EXPORT:  { icon: <Download className="w-3.5 h-3.5" aria-hidden="true" />,    color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  VIEW:    { icon: <Eye className="w-3.5 h-3.5" aria-hidden="true" />,         color: 'text-slate-700 dark:text-slate-300',  bg: 'bg-slate-100 dark:bg-slate-700' },
  REPORT:  { icon: <FileText className="w-3.5 h-3.5" aria-hidden="true" />,    color: 'text-teal-700 dark:text-teal-300',    bg: 'bg-teal-50 dark:bg-teal-900/30' },
};

const PAGE_SIZE = 8;

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const filtered = auditLogs.filter(log => {
    if (search && !log.user.toLowerCase().includes(search.toLowerCase()) && !log.details.toLowerCase().includes(search.toLowerCase()) && !log.entityId.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (userFilter !== 'ALL' && log.user !== userFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const uniqueActions = ['ALL', ...Array.from(new Set(auditLogs.map(l => l.action)))];
  const uniqueUsers = ['ALL', ...Array.from(new Set(auditLogs.map(l => l.user)))];

  // Stats
  const actionCounts = auditLogs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <PageShell>
      <PageHeader title="Audit Logs" description={`Immutable activity trail · ${filtered.length} events`}>
        <Button variant="blue" size="sm">
          <Download className="w-4 h-4" aria-hidden="true" />Export Audit Trail
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input type="search" placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" aria-label="Search audit logs" />
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="text-sm px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Filter by action">
            <option value="ALL">All Actions</option>
            {Object.keys(actionConfig).map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="text-sm px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" aria-label="Filter by user">
            <option value="ALL">All Users</option>
            {Array.from(new Set(auditLogs.map(l => l.user))).map(u => <option key={u}>{u}</option>)}
          </select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" aria-label="Audit log entries">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">Timestamp</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">User</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">Action</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">Resource</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">Details</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">IP Address</th>
                  <th className="px-4 py-3 text-left text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {pageData.map(log => {
                  const ac = actionConfig[log.action] ?? actionConfig['VIEW'];
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap font-mono">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{log.user}</p>
                          <p className="text-slate-700 dark:text-slate-300 text-xs">{log.role}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${ac.bg} ${ac.color}`}>
                          {ac.icon}{log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{log.resource}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{log.details}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">{log.ip}</td>
                      <td className="px-4 py-3">
                        <button className="p-1 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600" aria-label={`View details for ${log.id}`}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-700 dark:text-slate-300">{filtered.length} entries · Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page + i - 2;
                if (pg < 1 || pg > totalPages) return null;
                return <button key={pg} onClick={() => setPage(pg)} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${pg === page ? 'bg-blue-600 text-white' : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`} aria-current={pg === page ? 'page' : undefined}>{pg}</button>;
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}