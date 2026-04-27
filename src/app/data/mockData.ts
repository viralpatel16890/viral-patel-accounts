import type { Transaction, YearlySummary, MonthlySummary, CategorySummary, BudgetItem, Insight, AuditLog, User } from './types';

// ─── 15-Year Yearly Summary ───────────────────────────────────────────────────
export const yearlySummary: YearlySummary[] = [
  { year: 2010, income: 4200000, expenses: 3100000, netProfit: 1100000, yoyGrowth: 0, expenseRatio: 73.8 },
  { year: 2011, income: 5100000, expenses: 3600000, netProfit: 1500000, yoyGrowth: 21.4, expenseRatio: 70.6 },
  { year: 2012, income: 6400000, expenses: 4300000, netProfit: 2100000, yoyGrowth: 25.5, expenseRatio: 67.2 },
  { year: 2013, income: 7800000, expenses: 5100000, netProfit: 2700000, yoyGrowth: 21.9, expenseRatio: 65.4 },
  { year: 2014, income: 9200000, expenses: 6200000, netProfit: 3000000, yoyGrowth: 17.9, expenseRatio: 67.4 },
  { year: 2015, income: 11500000, expenses: 7400000, netProfit: 4100000, yoyGrowth: 25.0, expenseRatio: 64.3 },
  { year: 2016, income: 13800000, expenses: 9100000, netProfit: 4700000, yoyGrowth: 20.0, expenseRatio: 65.9 },
  { year: 2017, income: 16200000, expenses: 10600000, netProfit: 5600000, yoyGrowth: 17.4, expenseRatio: 65.4 },
  { year: 2018, income: 19500000, expenses: 13100000, netProfit: 6400000, yoyGrowth: 20.4, expenseRatio: 67.2 },
  { year: 2019, income: 22800000, expenses: 15200000, netProfit: 7600000, yoyGrowth: 16.9, expenseRatio: 66.7 },
  { year: 2020, income: 21200000, expenses: 15800000, netProfit: 5400000, yoyGrowth: -7.0, expenseRatio: 74.5 },
  { year: 2021, income: 26400000, expenses: 17200000, netProfit: 9200000, yoyGrowth: 24.5, expenseRatio: 65.2 },
  { year: 2022, income: 31800000, expenses: 20400000, netProfit: 11400000, yoyGrowth: 20.5, expenseRatio: 64.2 },
  { year: 2023, income: 37200000, expenses: 23600000, netProfit: 13600000, yoyGrowth: 17.0, expenseRatio: 63.4 },
  { year: 2024, income: 43500000, expenses: 27200000, netProfit: 16300000, yoyGrowth: 16.9, expenseRatio: 62.5 },
];

// ─── Monthly Summary (Current Year 2024) ─────────────────────────────────────
export const monthlySummary: MonthlySummary[] = [
  { month: 'Jan', income: 3200000, expenses: 2100000, netProfit: 1100000 },
  { month: 'Feb', income: 3400000, expenses: 2200000, netProfit: 1200000 },
  { month: 'Mar', income: 3600000, expenses: 2300000, netProfit: 1300000 },
  { month: 'Apr', income: 3700000, expenses: 2250000, netProfit: 1450000 },
  { month: 'May', income: 3500000, expenses: 2150000, netProfit: 1350000 },
  { month: 'Jun', income: 3800000, expenses: 2400000, netProfit: 1400000 },
  { month: 'Jul', income: 3650000, expenses: 2180000, netProfit: 1470000 },
  { month: 'Aug', income: 3900000, expenses: 2350000, netProfit: 1550000 },
  { month: 'Sep', income: 3750000, expenses: 2300000, netProfit: 1450000 },
  { month: 'Oct', income: 4100000, expenses: 2450000, netProfit: 1650000 },
  { month: 'Nov', income: 4200000, expenses: 2600000, netProfit: 1600000 },
  { month: 'Dec', income: 4700000, expenses: 2920000, netProfit: 1780000 },
];

// ─── Category Summary ─────────────────────────────────────────────────────────
export const expenseCategories: CategorySummary[] = [
  {
    category: 'Salaries & Benefits',
    amount: 9520000,
    percentage: 35,
    color: '#1E40AF',
    trend: 8.2,
    subCategories: [
      { name: 'Base Salaries', amount: 7200000, percentage: 75.6 },
      { name: 'Benefits & Insurance', amount: 1440000, percentage: 15.1 },
      { name: 'Bonuses & Incentives', amount: 880000, percentage: 9.2 },
    ],
  },
  {
    category: 'Operations',
    amount: 5440000,
    percentage: 20,
    color: '#0D9488',
    trend: 12.4,
    subCategories: [
      { name: 'Infrastructure', amount: 2176000, percentage: 40 },
      { name: 'Utilities', amount: 1088000, percentage: 20 },
      { name: 'Maintenance', amount: 1632000, percentage: 30 },
      { name: 'Other', amount: 544000, percentage: 10 },
    ],
  },
  {
    category: 'Marketing',
    amount: 4080000,
    percentage: 15,
    color: '#7C3AED',
    trend: 18.1,
    subCategories: [
      { name: 'Digital Advertising', amount: 1632000, percentage: 40 },
      { name: 'Events & Conferences', amount: 816000, percentage: 20 },
      { name: 'Brand & Creative', amount: 1224000, percentage: 30 },
      { name: 'PR', amount: 408000, percentage: 10 },
    ],
  },
  {
    category: 'Technology',
    amount: 2992000,
    percentage: 11,
    color: '#DB2777',
    trend: 22.3,
    subCategories: [
      { name: 'SaaS Subscriptions', amount: 1197000, percentage: 40 },
      { name: 'Hardware', amount: 598000, percentage: 20 },
      { name: 'Development', amount: 897000, percentage: 30 },
      { name: 'Security', amount: 300000, percentage: 10 },
    ],
  },
  {
    category: 'Legal & Compliance',
    amount: 1632000,
    percentage: 6,
    color: '#D97706',
    trend: 5.1,
    subCategories: [
      { name: 'Legal Fees', amount: 816000, percentage: 50 },
      { name: 'Compliance & Audits', amount: 490000, percentage: 30 },
      { name: 'Licenses', amount: 326000, percentage: 20 },
    ],
  },
  {
    category: 'Travel & Accommodation',
    amount: 1360000,
    percentage: 5,
    color: '#059669',
    trend: -3.2,
    subCategories: [
      { name: 'Domestic Travel', amount: 680000, percentage: 50 },
      { name: 'International Travel', amount: 408000, percentage: 30 },
      { name: 'Accommodation', amount: 272000, percentage: 20 },
    ],
  },
  {
    category: 'Office & Facilities',
    amount: 1088000,
    percentage: 4,
    color: '#0891B2',
    trend: 1.8,
    subCategories: [
      { name: 'Rent', amount: 653000, percentage: 60 },
      { name: 'Supplies', amount: 218000, percentage: 20 },
      { name: 'Furniture & Equipment', amount: 217000, percentage: 20 },
    ],
  },
  {
    category: 'Tax & Duties',
    amount: 1088000,
    percentage: 4,
    color: '#DC2626',
    trend: 14.7,
    subCategories: [
      { name: 'Corporate Tax', amount: 762000, percentage: 70 },
      { name: 'VAT & GST', amount: 218000, percentage: 20 },
      { name: 'Other Duties', amount: 108000, percentage: 10 },
    ],
  },
];

export const incomeCategories: CategorySummary[] = [
  {
    category: 'Product Revenue',
    amount: 22620000,
    percentage: 52,
    color: '#1E40AF',
    trend: 19.2,
    subCategories: [
      { name: 'SaaS Subscriptions', amount: 13572000, percentage: 60 },
      { name: 'One-Time Licenses', amount: 5655000, percentage: 25 },
      { name: 'Add-ons & Modules', amount: 3393000, percentage: 15 },
    ],
  },
  {
    category: 'Service Income',
    amount: 13050000,
    percentage: 30,
    color: '#0D9488',
    trend: 12.5,
    subCategories: [
      { name: 'Consulting', amount: 6525000, percentage: 50 },
      { name: 'Implementation', amount: 3915000, percentage: 30 },
      { name: 'Training', amount: 2610000, percentage: 20 },
    ],
  },
  {
    category: 'Investment Income',
    amount: 5220000,
    percentage: 12,
    color: '#7C3AED',
    trend: 8.1,
    subCategories: [
      { name: 'Interest Income', amount: 1566000, percentage: 30 },
      { name: 'Capital Gains', amount: 2088000, percentage: 40 },
      { name: 'Dividends', amount: 1566000, percentage: 30 },
    ],
  },
  {
    category: 'Other Income',
    amount: 2610000,
    percentage: 6,
    color: '#D97706',
    trend: 3.4,
    subCategories: [
      { name: 'Grants', amount: 783000, percentage: 30 },
      { name: 'Partnerships', amount: 1305000, percentage: 50 },
      { name: 'Miscellaneous', amount: 522000, percentage: 20 },
    ],
  },
];

// ─── Budget vs Actual ─────────────────────────────────────────────────────────
export const budgetData: BudgetItem[] = [
  { category: 'Salaries & Benefits', budgeted: 9000000, actual: 9520000, variance: -520000, variancePct: -5.8 },
  { category: 'Operations', budgeted: 5000000, actual: 5440000, variance: -440000, variancePct: -8.8 },
  { category: 'Marketing', budgeted: 4500000, actual: 4080000, variance: 420000, variancePct: 9.3 },
  { category: 'Technology', budgeted: 2800000, actual: 2992000, variance: -192000, variancePct: -6.9 },
  { category: 'Legal & Compliance', budgeted: 1700000, actual: 1632000, variance: 68000, variancePct: 4.0 },
  { category: 'Travel', budgeted: 1600000, actual: 1360000, variance: 240000, variancePct: 15.0 },
  { category: 'Office & Facilities', budgeted: 1100000, actual: 1088000, variance: 12000, variancePct: 1.1 },
  { category: 'Tax & Duties', budgeted: 1000000, actual: 1088000, variance: -88000, variancePct: -8.8 },
];

// ─── Cash Flow Heatmap Data ───────────────────────────────────────────────────
export const cashFlowHeatmap = Array.from({ length: 12 }, (_, monthIdx) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIdx],
  data: Array.from({ length: 5 }, (_, yearIdx) => {
    const year = 2020 + yearIdx;
    const base = monthlySummary[monthIdx].netProfit;
    const multiplier = 0.6 + yearIdx * 0.15 + (Math.random() * 0.3 - 0.15);
    return { year, value: Math.round(base * multiplier) };
  }),
}));

// ─── Transactions ─────────────────────────────────────────────────────────────
const categories = ['Salaries & Benefits', 'Operations', 'Marketing', 'Technology', 'Legal & Compliance', 'Travel & Accommodation', 'Office & Facilities', 'Tax & Duties'];
const paymentMethods = ['Bank Transfer', 'Corporate Card', 'ACH', 'Wire Transfer', 'Check', 'Direct Debit'];
const descriptions: Record<string, string[]> = {
  'Salaries & Benefits': ['Monthly Payroll - Engineering', 'Monthly Payroll - Sales', 'Employee Benefits Package', 'Bonus Payment Q4', 'Health Insurance Premium'],
  'Operations': ['AWS Infrastructure Cost', 'Data Center Maintenance', 'Utility Bill - Main Office', 'Security System Renewal', 'Operations Software License'],
  'Marketing': ['Google Ads Campaign', 'LinkedIn Sponsored Content', 'Annual Summit Event', 'Brand Refresh Project', 'PR Agency Retainer'],
  'Technology': ['Salesforce Annual License', 'GitHub Enterprise', 'Hardware Refresh Batch', 'Cybersecurity Platform', 'Development Tools Suite'],
  'Legal & Compliance': ['Legal Counsel Retainer', 'SOC 2 Audit', 'Patent Application', 'Compliance Training', 'GDPR Consultant'],
  'Travel & Accommodation': ['Executive Team Offsite', 'Sales Conference Travel', 'Customer Visit - NYC', 'International Board Meeting', 'Hotel - Chicago Summit'],
  'Office & Facilities': ['Rent - HQ Floor 4', 'Office Supplies Q3', 'Ergonomic Furniture Batch', 'Parking Lease', 'Cleaning Services'],
  'Tax & Duties': ['Q3 Corporate Tax Payment', 'VAT Remittance Oct', 'Import Duties Settlement', 'Payroll Tax Q4', 'Capital Gains Tax'],
};

export const transactions: Transaction[] = Array.from({ length: 120 }, (_, i) => {
  const isIncome = Math.random() > 0.7;
  const category = isIncome ? ['Product Revenue', 'Service Income', 'Investment Income', 'Other Income'][Math.floor(Math.random() * 4)] : categories[Math.floor(Math.random() * categories.length)];
  const dateOffset = Math.floor(Math.random() * 365);
  const date = new Date(2024, 0, 1);
  date.setDate(date.getDate() + dateOffset);
  const amount = isIncome ? Math.round((Math.random() * 500000 + 50000) / 1000) * 1000 : Math.round((Math.random() * 200000 + 10000) / 1000) * 1000;
  const status = Math.random() > 0.15 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'flagged';
  const incomeDescs = ['SaaS Subscription Revenue', 'Enterprise License Fee', 'Consulting Project Fee', 'Implementation Services', 'Training Workshop Revenue', 'Partnership Revenue Share'];

  return {
    transaction_id: `TXN-2024-${String(i + 1).padStart(4, '0')}`,
    date: date.toISOString().split('T')[0],
    description: isIncome ? incomeDescs[Math.floor(Math.random() * incomeDescs.length)] : (descriptions[category] || ['Other Transaction'])[Math.floor(Math.random() * (descriptions[category]?.length || 1))],
    type: isIncome ? 'income' : 'expense',
    category,
    sub_category: isIncome ? ['Enterprise', 'SMB', 'Startup'][Math.floor(Math.random() * 3)] : ['Core', 'Additional', 'Recurring'][Math.floor(Math.random() * 3)],
    amount,
    tax: Math.round(amount * 0.1),
    payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    notes: Math.random() > 0.6 ? 'Reviewed and approved per policy.' : '',
    created_by: ['sarah.johnson@corp.com', 'mike.chen@corp.com', 'alice.kumar@corp.com'][Math.floor(Math.random() * 3)],
    approved_by: status === 'approved' ? 'james.director@corp.com' : '',
    timestamp: date.toISOString(),
    status: status as 'approved' | 'pending' | 'flagged',
    attachment: Math.random() > 0.6,
  };
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// ─── Insights ─────────────────────────────────────────────────────────────────
export const insights: Insight[] = [
  {
    id: 'INS-001',
    title: 'Marketing Spend Surge',
    description: 'Marketing expenditure increased 18.1% YoY, outpacing revenue growth of 16.9%. Digital advertising alone grew 32% driven by Q3 campaign expansion.',
    severity: 'medium',
    category: 'Marketing',
    action: 'Review',
    metric: '+18.1% YoY',
    trend: 'up',
  },
  {
    id: 'INS-002',
    title: 'Operational Cost Escalation',
    description: 'Operational costs have risen for 4 consecutive quarters, with infrastructure spend up 22% this year. Cloud cost optimization could yield ₹40 lakh+ annual savings.',
    severity: 'high',
    category: 'Operations',
    action: 'Optimize',
    metric: '+12.4% YoY, 4 Qtrs Rising',
    trend: 'up',
  },
  {
    id: 'INS-003',
    title: 'Subscription Revenue CAGR',
    description: 'SaaS subscription revenue maintains a stable 6.2% CAGR over 5 years. Enterprise tier shows strongest retention at 94%. Upsell opportunity detected in SMB segment.',
    severity: 'low',
    category: 'Product Revenue',
    action: 'Review',
    metric: '6.2% CAGR (5Y)',
    trend: 'stable',
  },
  {
    id: 'INS-004',
    title: 'Top 3 Expense Concentration',
    description: 'Salaries, Operations, and Marketing account for 70% of total expenses — a concentration risk. Diversification of operational spend recommended to reduce dependency.',
    severity: 'medium',
    category: 'All Expenses',
    action: 'Investigate',
    metric: '70% Expense Concentration',
    trend: 'stable',
  },
  {
    id: 'INS-005',
    title: 'Tax Liability Anomaly Detected',
    description: 'Tax & Duties surged 14.7% YoY against a 9% revenue growth baseline. Possible misclassification in Q2 entries. Immediate review recommended to prevent penalties.',
    severity: 'high',
    category: 'Tax & Duties',
    action: 'Investigate',
    metric: '+14.7% YoY Spike',
    trend: 'up',
  },
  {
    id: 'INS-006',
    title: 'Travel Budget Efficiency',
    description: 'Travel spend came in 15% under budget (₹24 lakh savings), largely due to remote collaboration adoption. Consider reallocating savings to digital outreach programs.',
    severity: 'low',
    category: 'Travel & Accommodation',
    action: 'Reclassify',
    metric: '15% Under Budget',
    trend: 'down',
  },
  {
    id: 'INS-007',
    title: 'Technology Cost Acceleration',
    description: 'Technology spend grew 22.3% YoY, driven by SaaS subscriptions and security tooling. 14 overlapping tools identified — consolidation could save ₹18 lakh annually.',
    severity: 'medium',
    category: 'Technology',
    action: 'Optimize',
    metric: '+22.3% YoY',
    trend: 'up',
  },
  {
    id: 'INS-008',
    title: 'Net Profit Margin Improvement',
    description: 'Net profit margin improved from 36.6% (2023) to 37.5% (2024), the highest in 5 years. Efficiency gains in delivery offset payroll increases.',
    severity: 'low',
    category: 'Overall',
    action: 'Review',
    metric: '37.5% Net Margin',
    trend: 'up',
  },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs: AuditLog[] = [
  { id: 'AUD-001', timestamp: '2024-12-15T09:32:14Z', user: 'Sarah Johnson', role: 'Accounts Executive', action: 'UPLOAD', entity: 'Transaction Batch', entityId: 'BATCH-2024-089', details: 'Uploaded 142 transactions from Q4_Nov.csv', ipAddress: '192.168.1.45' },
  { id: 'AUD-002', timestamp: '2024-12-15T10:14:22Z', user: 'Michael Chen', role: 'Finance Manager', action: 'APPROVE', entity: 'Transaction', entityId: 'TXN-2024-0087', details: 'Approved edited marketing expense of ₹84,000', ipAddress: '192.168.1.52' },
  { id: 'AUD-003', timestamp: '2024-12-15T11:05:33Z', user: 'Sarah Johnson', role: 'Accounts Executive', action: 'FLAG', entity: 'Transaction', entityId: 'TXN-2024-0093', details: 'Flagged for duplicate detection - possible duplicate entry', ipAddress: '192.168.1.45' },
  { id: 'AUD-004', timestamp: '2024-12-15T13:22:11Z', user: 'Alice Kumar', role: 'CFO', action: 'EXPORT', entity: 'Report', entityId: 'RPT-2024-Q4', details: 'Exported Q4 Financial Summary as JSON', ipAddress: '10.0.0.12' },
  { id: 'AUD-005', timestamp: '2024-12-14T16:48:05Z', user: 'Michael Chen', role: 'Finance Manager', action: 'EDIT', entity: 'Transaction', entityId: 'TXN-2024-0071', details: 'Updated category from Operations to Technology', ipAddress: '192.168.1.52' },
  { id: 'AUD-006', timestamp: '2024-12-14T14:12:40Z', user: 'James Director', role: 'CFO', action: 'APPROVE', entity: 'Budget', entityId: 'BDG-2025-001', details: 'Approved FY2025 annual budget submission', ipAddress: '10.0.0.15' },
  { id: 'AUD-007', timestamp: '2024-12-13T09:00:00Z', user: 'Sarah Johnson', role: 'Accounts Executive', action: 'DELETE', entity: 'Transaction', entityId: 'TXN-2024-0012', details: 'Deleted duplicate transaction entry after verification', ipAddress: '192.168.1.45' },
  { id: 'AUD-008', timestamp: '2024-12-12T15:30:22Z', user: 'Alice Kumar', role: 'CFO', action: 'VIEW', entity: 'Audit Log', entityId: 'AUD-FULL', details: 'Accessed full audit log for compliance review', ipAddress: '10.0.0.12' },
  { id: 'AUD-009', timestamp: '2024-12-12T11:45:00Z', user: 'Michael Chen', role: 'Finance Manager', action: 'REPORT', entity: 'Report', entityId: 'RPT-2024-NOV', details: 'Generated November 2024 category breakdown report', ipAddress: '192.168.1.52' },
  { id: 'AUD-010', timestamp: '2024-12-11T10:20:15Z', user: 'Sarah Johnson', role: 'Accounts Executive', action: 'UPLOAD', entity: 'Transaction Batch', entityId: 'BATCH-2024-088', details: 'Uploaded 98 transactions from Q4_Oct.csv - 3 validation errors', ipAddress: '192.168.1.45' },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const users: User[] = [
  { id: 'USR-001', name: 'Sarah Johnson', email: 'sarah.johnson@corp.com', role: 'executive', department: 'Finance', lastActive: '2024-12-15T09:32:14Z', status: 'active' },
  { id: 'USR-002', name: 'Michael Chen', email: 'mike.chen@corp.com', role: 'manager', department: 'Finance', lastActive: '2024-12-15T13:14:22Z', status: 'active' },
  { id: 'USR-003', name: 'Alice Kumar', email: 'alice.kumar@corp.com', role: 'executive', department: 'Finance', lastActive: '2024-12-14T16:48:05Z', status: 'active' },
  { id: 'USR-004', name: 'James Director', email: 'james.director@corp.com', role: 'cfo', department: 'Executive', lastActive: '2024-12-14T14:12:40Z', status: 'active' },
  { id: 'USR-005', name: 'Diana Park', email: 'diana.park@corp.com', role: 'manager', department: 'Finance', lastActive: '2024-12-10T11:30:00Z', status: 'active' },
  { id: 'USR-006', name: 'Robert Liu', email: 'robert.liu@corp.com', role: 'executive', department: 'Accounting', lastActive: '2024-11-28T09:00:00Z', status: 'inactive' },
];

// ─── KPI Helpers ──────────────────────────────────────────────────────────────
export const currentYear = yearlySummary[yearlySummary.length - 1];
export const previousYear = yearlySummary[yearlySummary.length - 2];

export const kpiData = {
  totalIncome: currentYear.income,
  totalExpenses: currentYear.expenses,
  netProfit: currentYear.netProfit,
  yoyGrowth: currentYear.yoyGrowth,
  expenseRatio: currentYear.expenseRatio,
  largestCategorySpend: expenseCategories[0].amount,
  largestCategory: expenseCategories[0].category,
  prevIncome: previousYear.income,
  prevExpenses: previousYear.expenses,
  prevNetProfit: previousYear.netProfit,
  riskAlerts: 3,
};

export const formatCurrency = (value: number, compact = false): string => {
  if (compact) {
    if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
    return `₹${value}`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
};

export const formatPct = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

// ─── Year-Specific Data Helpers ───────────────────────────────────────────────
// Deterministic pseudo-random seeded by year + index (no Math.random)
const pseudo = (year: number, n: number): number => {
  const x = Math.sin(year * 137.508 + n * 31.7) * 43758.5453;
  return x - Math.floor(x);
};

// Monthly income/expense distribution weights (seasonal pattern)
const incomeWeights  = [0.077, 0.078, 0.082, 0.083, 0.082, 0.085, 0.083, 0.086, 0.083, 0.088, 0.087, 0.096];
const expenseWeights = [0.082, 0.078, 0.085, 0.082, 0.079, 0.086, 0.083, 0.085, 0.082, 0.087, 0.088, 0.093];

export const getMonthlySummaryForYear = (year: number): MonthlySummary[] => {
  const yearData = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months.map((month, i) => {
    const jitter = (pseudo(year, i) - 0.5) * 0.012;
    const income   = Math.round(yearData.income   * (incomeWeights[i]  + jitter) / 1000) * 1000;
    const expenses = Math.round(yearData.expenses * (expenseWeights[i] + jitter * 0.5) / 1000) * 1000;
    return { month, income, expenses, netProfit: income - expenses };
  });
};

export const getExpenseCategoriesForYear = (year: number): CategorySummary[] => {
  const yearData = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const baseTotal = expenseCategories.reduce((s, c) => s + c.amount, 0);
  const scale = yearData.expenses / baseTotal;
  return expenseCategories.map(cat => ({
    ...cat,
    amount: Math.round(cat.amount * scale / 1000) * 1000,
    subCategories: cat.subCategories.map(sub => ({
      ...sub,
      amount: Math.round(sub.amount * scale / 1000) * 1000,
    })),
  }));
};

export const getIncomeCategoriesForYear = (year: number): CategorySummary[] => {
  const yearData = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const baseTotal = incomeCategories.reduce((s, c) => s + c.amount, 0);
  const scale = yearData.income / baseTotal;
  return incomeCategories.map(cat => ({
    ...cat,
    amount: Math.round(cat.amount * scale / 1000) * 1000,
    subCategories: cat.subCategories.map(sub => ({
      ...sub,
      amount: Math.round(sub.amount * scale / 1000) * 1000,
    })),
  }));
};

export const getBudgetDataForYear = (year: number): BudgetItem[] => {
  const yearData = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const baseActualTotal = budgetData.reduce((s, b) => s + b.actual, 0);
  const scale = yearData.expenses / baseActualTotal;
  return budgetData.map(b => {
    const actual   = Math.round(b.actual   * scale / 1000) * 1000;
    const budgeted = Math.round(b.budgeted * scale / 1000) * 1000;
    const variance    = budgeted - actual;
    const variancePct = budgeted > 0 ? ((budgeted - actual) / budgeted) * 100 : 0;
    return { ...b, actual, budgeted, variance, variancePct };
  });
};

export const getKpiForYear = (year: number) => {
  const yearData  = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const cats = getExpenseCategoriesForYear(year);
  return {
    totalIncome:          yearData.income,
    totalExpenses:        yearData.expenses,
    netProfit:            yearData.netProfit,
    yoyGrowth:            yearData.yoyGrowth,
    expenseRatio:         yearData.expenseRatio,
    largestCategorySpend: cats[0]?.amount ?? 0,
    largestCategory:      cats[0]?.category ?? '',
    riskAlerts: Math.max(1, Math.round(2 + Math.sin(year * 0.9) * 1.4)),
  };
};

export const getTransactionsForYear = (year: number): Transaction[] => {
  const yearData   = yearlySummary.find(y => y.year === year) ?? yearlySummary[yearlySummary.length - 1];
  const baseYear   = yearlySummary[yearlySummary.length - 1];
  const scaleInc   = yearData.income   / baseYear.income;
  const scaleExp   = yearData.expenses / baseYear.expenses;
  const incomeDescs = ['SaaS Subscription Revenue','Enterprise License Fee','Consulting Project Fee','Implementation Services','Training Workshop Revenue','Partnership Revenue Share'];

  return Array.from({ length: 120 }, (_, i) => {
    const isIncome = pseudo(year, i) > 0.7;
    const category = isIncome
      ? ['Product Revenue','Service Income','Investment Income','Other Income'][Math.floor(pseudo(year, i + 200) * 4)]
      : categories[Math.floor(pseudo(year, i + 100) * categories.length)];

    const dayOffset = Math.floor(pseudo(year, i + 300) * 365);
    const date = new Date(year, 0, 1);
    date.setDate(date.getDate() + dayOffset);

    const baseAmount = isIncome
      ? Math.round((pseudo(year, i + 400) * 500000 + 50000) / 1000) * 1000
      : Math.round((pseudo(year, i + 500) * 200000 + 10000) / 1000) * 1000;
    const amount = Math.round(baseAmount * (isIncome ? scaleInc : scaleExp) / 1000) * 1000;

    const statusR = pseudo(year, i + 600);
    const status  = statusR > 0.15 ? 'approved' : statusR > 0.075 ? 'pending' : 'flagged';

    const descList = isIncome ? incomeDescs : (descriptions[category] ?? ['Other Transaction']);

    return {
      transaction_id: `TXN-${year}-${String(i + 1).padStart(4, '0')}`,
      date:           date.toISOString().split('T')[0],
      description:    descList[Math.floor(pseudo(year, i + 700) * descList.length)],
      type:           (isIncome ? 'income' : 'expense') as 'income' | 'expense',
      category,
      sub_category:   isIncome
        ? ['Enterprise','SMB','Startup'][Math.floor(pseudo(year, i + 800) * 3)]
        : ['Core','Additional','Recurring'][Math.floor(pseudo(year, i + 900) * 3)],
      amount,
      tax:            Math.round(amount * 0.1),
      payment_method: paymentMethods[Math.floor(pseudo(year, i + 1000) * paymentMethods.length)],
      notes:          pseudo(year, i + 1100) > 0.6 ? 'Reviewed and approved per policy.' : '',
      created_by:     ['sarah.johnson@corp.com','mike.chen@corp.com','alice.kumar@corp.com'][Math.floor(pseudo(year, i + 1200) * 3)],
      approved_by:    status === 'approved' ? 'james.director@corp.com' : '',
      timestamp:      date.toISOString(),
      status:         status as 'approved' | 'pending' | 'flagged',
      attachment:     pseudo(year, i + 1300) > 0.6,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};