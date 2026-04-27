import { useState, ReactNode } from 'react';
import {
  Settings as SettingsIcon, Users, Shield, Bell, Eye, EyeOff,
  Accessibility, Download, Trash2, Plus, Edit3, Check, X, Lock, Moon, Database, RefreshCw
} from 'lucide-react';
import { users } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { User } from '../data/types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { PageShell, PageHeader } from '../components/ui/PageShell';

const roleLabel: Record<string, string> = {
  executive: 'Accounts Executive',
  manager: 'Finance Manager',
  cfo: 'CFO / Admin',
};

const roleBadge: Record<string, string> = {
  executive: 'bg-teal-50 text-teal-700',
  manager: 'bg-blue-50 text-blue-700',
  cfo: 'bg-purple-50 text-purple-700',
};

const TABS = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
];

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800 ${value ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
      aria-label={label}
    >
      <span className={`inline-block w-4 h-4 mt-0.5 ml-0.5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} aria-hidden="true" />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const {
    maskValues, setMaskValues, reducedMotion, setReducedMotion,
    darkMode, setDarkMode, highContrast, setHighContrast,
    dataSource, dataSyncing, dataError, lastSyncedAt,
    googleSheetsConfig, setGoogleSheetsConfig, syncGoogleSheetData,
    resetToLocalData, clearGoogleSheetsConnection,
  } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // General settings
  const [currency, setCurrency] = useState('INR');
  const [fiscalYear, setFiscalYear] = useState('Jan–Dec');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [autoSave, setAutoSave] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [dualApproval, setDualApproval] = useState(true);

  // Notification settings
  const [notifUpload, setNotifUpload] = useState(true);
  const [notifApproval, setNotifApproval] = useState(true);
  const [notifRisk, setNotifRisk] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);

  // Security
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [auditAll, setAuditAll] = useState(true);

  const handleGoogleSync = async () => {
    try {
      await syncGoogleSheetData();
    } catch {
      // Error state is surfaced in the integration card.
    }
  };

  const formatSyncTimestamp = (value: string | null) => {
    if (!value) return 'Not synced yet';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  };

  return (
    <PageShell maxWidth="narrow">
      <PageHeader title="Settings" description="Manage your account, team, security, and preferences" />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-56 shrink-0" aria-label="Settings navigation">
          <ul className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm w-full transition-colors text-left whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeTab === id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  aria-current={activeTab === id ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-w-0 space-y-6">
          {/* General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-5">
                  <h2 className="text-foreground mb-4">Organisation Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Organisation Name', value: 'FinanceOS Enterprises Ltd.', type: 'text' },
                      { label: 'GSTIN',              value: '29ABCDE1234F1Z5',           type: 'text' },
                      { label: 'Fiscal Year Start',  value: 'April 1',                   type: 'text' },
                      { label: 'Currency',           value: 'INR (₹)',                   type: 'text' },
                      { label: 'Time Zone',          value: 'Asia/Kolkata (IST, UTC+5:30)', type: 'text' },
                      { label: 'Primary Contact',    value: 'admin@financeOS.com',       type: 'email' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="block text-xs text-muted-foreground mb-1.5">{f.label}</label>
                        <Input type={f.type} defaultValue={f.value} aria-label={f.label} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="blue">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-foreground flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                        Google Sheets Sync
                      </h2>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                        Connect a private Google Sheet with OAuth and keep `user_transactions.json` as the local fallback.
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${dataSource === 'google-sheets' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'google-sheets' ? 'bg-emerald-600' : 'bg-slate-500'}`} aria-hidden="true" />
                      {dataSource === 'google-sheets' ? 'Google Sheets active' : 'Local JSON fallback'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1.5">Google OAuth Client ID</label>
                      <Input
                        value={googleSheetsConfig.clientId}
                        onChange={e => setGoogleSheetsConfig({ clientId: e.target.value })}
                        placeholder="1234567890-xxxxx.apps.googleusercontent.com"
                        aria-label="Google OAuth Client ID"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1.5">Google Sheet URL</label>
                      <Input
                        value={googleSheetsConfig.sheetUrl}
                        onChange={e => setGoogleSheetsConfig({ sheetUrl: e.target.value })}
                        placeholder="https://docs.google.com/spreadsheets/d/.../edit?gid=..."
                        aria-label="Google Sheet URL"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-muted-foreground mb-1.5">Sheet Range (optional)</label>
                      <Input
                        value={googleSheetsConfig.range}
                        onChange={e => setGoogleSheetsConfig({ range: e.target.value })}
                        placeholder="Sheet1!A1:I5000"
                        aria-label="Google Sheet range"
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Required Google API scope</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-mono break-all">
                      https://www.googleapis.com/auth/spreadsheets.readonly
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      Last sync: <span className="font-medium">{formatSyncTimestamp(lastSyncedAt)}</span>
                    </p>
                    {dataError && (
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">{dataError}</p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" onClick={resetToLocalData}>
                      Use Local Backup
                    </Button>
                    <Button variant="ghost" onClick={clearGoogleSheetsConnection}>
                      Disconnect
                    </Button>
                    <Button
                      variant="blue"
                      onClick={handleGoogleSync}
                      disabled={dataSyncing || !googleSheetsConfig.clientId.trim() || !googleSheetsConfig.sheetUrl.trim()}
                    >
                      <RefreshCw className={`w-4 h-4 ${dataSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                      {dataSyncing ? 'Syncing…' : 'Connect & Sync'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5">
                  <h2 className="text-foreground mb-4">Appearance</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">Switch between light and dark interface</p>
                        </div>
                      </div>
                      <Toggle value={darkMode} onChange={setDarkMode} label="Toggle dark mode" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mask Financial Values</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">Blur sensitive numbers for screen sharing</p>
                      </div>
                      <Toggle value={maskValues} onChange={setMaskValues} label="Toggle mask financial values" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-foreground">User Management</h2>
                  <Button variant="blue" size="sm">
                    <Plus className="w-4 h-4" aria-hidden="true" />Invite User
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {localUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0" aria-hidden="true">
                        {u.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{u.email}</p>
                      </div>
                      <span className={`hidden sm:inline-block px-2 py-0.5 text-xs rounded-full font-medium ${roleBadge[u.role as keyof typeof roleBadge]}`}>{roleLabel[u.role as keyof typeof roleLabel]}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${u.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>{u.status}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="iconSm" aria-label={`Edit ${u.name}`}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="iconSm" aria-label={`Remove ${u.name}`}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', desc: 'Require 2FA for all logins',         icon: Shield, active: true },
                { label: 'Session Timeout',           desc: 'Auto-logout after 30 min inactivity', icon: Lock, active: true },
                { label: 'IP Whitelisting',           desc: 'Restrict access to approved IPs',    icon: Shield, active: false },
                { label: 'Login Anomaly Alerts',      desc: 'Email alerts for unusual logins',    icon: Bell, active: true },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="flex items-center justify-between gap-4 pt-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <s.icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    <Toggle value={s.active} onChange={() => {}} label={`Toggle ${s.label}`} />
                  </CardContent>
                </Card>
              ))}</div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {[
                { label: 'Risk Alerts',           desc: 'Get notified on high-risk flagged transactions', active: true },
                { label: 'Approval Requests',     desc: 'Email when transactions require your approval',  active: true },
                { label: 'Upload Completion',     desc: 'Notify after batch CSV uploads complete',       active: true },
                { label: 'Budget Threshold',      desc: 'Alert when budget lines exceed 90%',            active: false },
                { label: 'Monthly Summary',       desc: 'Receive automated monthly performance digest',  active: true },
                { label: 'Audit Log Digest',      desc: 'Weekly digest of audit activity',              active: false },
              ].map(n => (
                <Card key={n.label}>
                  <CardContent className="flex items-center justify-between gap-4 pt-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Toggle value={n.active} onChange={() => {}} label={`Toggle ${n.label} notifications`} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Accessibility */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-5">
                  <h2 className="text-foreground mb-4">Accessibility Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Reduce Motion',      desc: 'Disable animations and transitions',     value: reducedMotion,  setter: setReducedMotion },
                      { label: 'Mask Financial Data', desc: 'Blur sensitive values across the app',  value: maskValues,     setter: setMaskValues },
                      { label: 'High Contrast Mode', desc: 'Force black/white for maximum legibility (low vision)', value: highContrast, setter: setHighContrast },
                      { label: 'Keyboard Navigation', desc: 'Enhanced keyboard focus indicators',    value: true,           setter: () => {} },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.label}</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{s.desc}</p>
                        </div>
                        <Toggle value={s.value} onChange={s.setter} label={`Toggle ${s.label}`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">WCAG AAA Compliance</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">FinanceOS maintains 7:1 minimum contrast ratios, full keyboard navigation, ARIA landmark support, and screen reader compatibility on all interfaces.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}