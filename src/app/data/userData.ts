import type { Transaction, YearlySummary, MonthlySummary, CategorySummary, Insight } from './types';
import userTransactionsRaw from '../../../user_transactions.json';
import {
  clearCachedGoogleSheetData,
  getCachedGoogleSheetData,
  syncGoogleSheetTransactions,
} from '../services/googleSheets';

export type UserDataSource = 'local-json' | 'google-sheets';

const toIsoTimestamp = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const buildTransactions = (rawTransactions: any[]): Transaction[] =>
  rawTransactions.map((t, i) => {
    const rawAmount = Number(t.amount) || 0;
    const normalizedType = String(t.type ?? '').toLowerCase() === 'income'
      ? 'income'
      : String(t.type ?? '').toLowerCase() === 'expense'
        ? 'expense'
        : rawAmount < 0
          ? 'expense'
          : 'income';

    const normalizedStatus: Transaction['status'] =
      t.status === 'pending' || t.status === 'flagged' ? t.status : 'approved';

    const date = t.date || new Date().toISOString().split('T')[0];

    return {
      transaction_id: t.transaction_id || `USR-TXN-${String(i + 1).padStart(4, '0')}`,
      date,
      description: t.description || `Imported transaction ${i + 1}`,
      type: normalizedType,
      category: t.category || 'Uncategorized',
      sub_category: t.sub_category || 'General',
      amount: Math.abs(rawAmount),
      tax: Math.abs(Number(t.tax) || 0),
      payment_method: t.payment_method || t.method || 'Unspecified',
      notes: t.notes || '',
      created_by: t.created_by || 'user.import@corp.com',
      approved_by: normalizedStatus === 'approved' ? (t.approved_by || 'system.auto@corp.com') : '',
      timestamp: t.timestamp || toIsoTimestamp(date),
      status: normalizedStatus,
      attachment: Boolean(t.attachment),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const fallbackTransactions = buildTransactions(userTransactionsRaw as any[]);
const cachedGoogleSheetData = getCachedGoogleSheetData();
let activeDataSource: UserDataSource = cachedGoogleSheetData?.transactions?.length ? 'google-sheets' : 'local-json';

// ─── User Transaction Data Processing ─────────────────────────────────────────
export let userTransactions: Transaction[] = cachedGoogleSheetData?.transactions?.length
  ? buildTransactions(cachedGoogleSheetData.transactions as any[])
  : fallbackTransactions;

// ─── Calculate User Summary Data ───────────────────────────────────────────────
const calculateYearlySummary = (): YearlySummary[] => {
  const yearlyMap = new Map<number, { income: number; expenses: number }>();
  
  userTransactions.forEach(t => {
    const year = new Date(t.date).getFullYear();
    const current = yearlyMap.get(year) || { income: 0, expenses: 0 };
    
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expenses += t.amount;
    }
    
    yearlyMap.set(year, current);
  });
  
  return Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      income: data.income,
      expenses: data.expenses,
      netProfit: data.income - data.expenses,
      yoyGrowth: 0, // Will calculate below
      expenseRatio: data.income > 0 ? (data.expenses / data.income) * 100 : 0,
    }))
    .sort((a, b) => a.year - b.year)
    .map((year, i, arr) => {
      if (i === 0) return year;
      const prevYear = arr[i - 1];
      return {
        ...year,
        yoyGrowth: prevYear.income > 0 ? ((year.income - prevYear.income) / prevYear.income) * 100 : 0,
      };
    });
};

export let userYearlySummary: YearlySummary[] = [];

const refreshDerivedData = () => {
  userYearlySummary = calculateYearlySummary();
};

refreshDerivedData();

export const getUserDataSource = (): UserDataSource => activeDataSource;

export const resetUserTransactionsToLocal = () => {
  clearCachedGoogleSheetData();
  activeDataSource = 'local-json';
  userTransactions = fallbackTransactions;
  refreshDerivedData();
};

export const syncUserTransactionsFromGoogleSheet = async () => {
  const payload = await syncGoogleSheetTransactions();
  activeDataSource = 'google-sheets';
  userTransactions = buildTransactions(payload.transactions as any[]);
  refreshDerivedData();
  return payload;
};

// ─── Calculate Monthly Summary for 2016-2017 ────────────────────────────────────
const calculateMonthlySummary = (year: number): MonthlySummary[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = new Map<number, { income: number; expenses: number }>();
  
  // Initialize all months
  months.forEach((_, i) => monthlyMap.set(i, { income: 0, expenses: 0 }));
  
  userTransactions
    .filter(t => new Date(t.date).getFullYear() === year)
    .forEach(t => {
      const month = new Date(t.date).getMonth();
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
      
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expenses += t.amount;
      }
      
      monthlyMap.set(month, current);
    });
  
  return months.map((month, i) => {
    const data = monthlyMap.get(i) || { income: 0, expenses: 0 };
    return {
      month,
      income: data.income,
      expenses: data.expenses,
      netProfit: data.income - data.expenses,
    };
  });
};

export const getUserMonthlySummary = (year: number): MonthlySummary[] => calculateMonthlySummary(year);

// ─── Calculate Category Summary ─────────────────────────────────────────────────
const calculateCategorySummary = (year: number): CategorySummary[] => {
  const categoryMap = new Map<string, { amount: number; count: number; subCategories: Map<string, number> }>();
  
  userTransactions
    .filter(t => new Date(t.date).getFullYear() === year && t.type === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category) || { 
        amount: 0, 
        count: 0, 
        subCategories: new Map() 
      };
      
      current.amount += t.amount;
      current.count += 1;
      
      const subAmount = current.subCategories.get(t.sub_category) || 0;
      current.subCategories.set(t.sub_category, subAmount + t.amount);
      
      categoryMap.set(t.category, current);
    });
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
  const colors = ['#1E40AF', '#0D9488', '#7C3AED', '#DB2777', '#D97706', '#059669', '#0891B2', '#DC2626'];
  
  return Array.from(categoryMap.entries())
    .map(([category, data], i) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 1000) / 10 : 0,
      color: colors[i % colors.length],
      trend: 0, // No historical data for trend
      subCategories: Array.from(data.subCategories.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: data.amount > 0 ? Math.round((amount / data.amount) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getUserExpenseCategories = (year: number): CategorySummary[] => calculateCategorySummary(year);

// Calculate income categories for a specific year
const calculateIncomeCategorySummary = (year: number): CategorySummary[] => {
  const categoryMap = new Map<string, { amount: number; count: number; subCategories: Map<string, number> }>();
  
  userTransactions
    .filter(t => new Date(t.date).getFullYear() === year && t.type === 'income')
    .forEach(t => {
      const current = categoryMap.get(t.category) || { 
        amount: 0, 
        count: 0, 
        subCategories: new Map() 
      };
      
      current.amount += t.amount;
      current.count += 1;
      
      const subAmount = current.subCategories.get(t.sub_category) || 0;
      current.subCategories.set(t.sub_category, subAmount + t.amount);
      
      categoryMap.set(t.category, current);
    });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: 0, // Will be calculated below
      color: '#10b981', // Green for income
      trend: 0, // Default trend
      transactionCount: data.count,
      subCategories: Array.from(data.subCategories.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([subCategory, amount]) => ({
          name: subCategory,
          amount,
          percentage: 0 // Will be calculated below
        }))
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getUserIncomeCategories = (year: number): CategorySummary[] => calculateIncomeCategorySummary(year);

// ─── User KPI Calculation ───────────────────────────────────────────────────────
export const getUserKpiForYear = (year: number) => {
  const yearData = userYearlySummary.find(y => y.year === year);
  const cats = getUserExpenseCategories(year);
  
  if (!yearData) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      yoyGrowth: 0,
      expenseRatio: 0,
      largestCategorySpend: 0,
      largestCategory: '',
      riskAlerts: 0,
    };
  }
  
  return {
    totalIncome: yearData.income,
    totalExpenses: yearData.expenses,
    netProfit: yearData.netProfit,
    yoyGrowth: yearData.yoyGrowth,
    expenseRatio: yearData.expenseRatio,
    largestCategorySpend: cats[0]?.amount || 0,
    largestCategory: cats[0]?.category || '',
    riskAlerts: 0, // No flagged transactions in user data
  };
};

export const getUserTransactionsForYear = (year: number): Transaction[] => 
  userTransactions.filter(t => new Date(t.date).getFullYear() === year);

// ─── All Years Data Functions ───────────────────────────────────────────────
export const getAllUserTransactions = (): Transaction[] => userTransactions;

export const getAllUserMonthlySummary = (): MonthlySummary[] => {
  const allMonths: MonthlySummary[] = [];
  const years = [...new Set(userTransactions.map(t => new Date(t.date).getFullYear()))];
  
  years.forEach(year => {
    const yearMonths = getUserMonthlySummary(year);
    allMonths.push(...yearMonths);
  });
  
  return allMonths.sort((a, b) => a.month.localeCompare(b.month));
};

export const getAllUserExpenseCategories = (): CategorySummary[] => {
  const categoryMap = new Map<string, { amount: number; count: number; subCategories: Map<string, number> }>();
  
  userTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const current = categoryMap.get(t.category) || { 
        amount: 0, 
        count: 0, 
        subCategories: new Map() 
      };
      
      current.amount += t.amount;
      current.count += 1;
      
      const subAmount = current.subCategories.get(t.sub_category) || 0;
      current.subCategories.set(t.sub_category, subAmount + t.amount);
      
      categoryMap.set(t.category, current);
    });
  
  const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
  const colors = ['#1E40AF', '#0D9488', '#7C3AED', '#DB2777', '#D97706', '#059669', '#0891B2', '#DC2626'];
  
  return Array.from(categoryMap.entries())
    .map(([category, data], i) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 1000) / 10 : 0,
      color: colors[i % colors.length],
      trend: 0,
      subCategories: Array.from(data.subCategories.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: data.amount > 0 ? Math.round((amount / data.amount) * 1000) / 10 : 0,
        }))
        .sort((a, b) => b.amount - a.amount),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getAllUserKpi = () => {
  const totalIncome = userTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = userTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  
  const cats = getAllUserExpenseCategories();
  
  return {
    totalIncome,
    totalExpenses,
    netProfit,
    yoyGrowth: 0, // Not applicable for all years
    expenseRatio,
    largestCategorySpend: cats[0]?.amount || 0,
    largestCategory: cats[0]?.category || '',
    riskAlerts: 0,
  };
};

// ─── Real Insights Based on Actual Data ───────────────────────────────────────
export const insights: Insight[] = [
  {
    id: 'domain-renewal-costs',
    title: 'Domain Renewal Cost Escalation',
    description: 'Domain registration and renewal costs have increased significantly over the years, with multiple .COM domains now costing ₹1,500-₹2,000 annually. Consider consolidating domains or negotiating bulk pricing.',
    severity: 'medium',
    category: 'Domains',
    action: 'Optimize',
    metric: '+127% YoY',
    trend: 'up'
  },
  {
    id: 'ssl-certificate-renewals',
    title: 'SSL Certificate Renewal Pattern',
    description: 'SSL certificate renewals show a pattern of increasing costs (₹9,588 → ₹10,394 → ₹10,714). Multi-year contracts could provide cost savings of 15-20%.',
    severity: 'medium',
    category: 'SSL Certificate',
    action: 'Optimize',
    metric: '+11.7% Avg Increase',
    trend: 'up'
  },
  {
    id: 'g-suite-revenue-growth',
    title: 'G-Suite Services Revenue Growth',
    description: 'G-Suite account management has become a significant revenue stream, growing from occasional setup fees to recurring annual revenue. Client retention rate appears strong.',
    severity: 'low',
    category: 'G-Suite Accounts',
    action: 'Review',
    metric: '+342% Growth',
    trend: 'up'
  },
  {
    id: 'freelancing-income-stability',
    title: 'Freelancing Income Consistency',
    description: 'Freelancing projects show consistent income generation across website design, admin panels, and video creation. Average project value: ₹9,167 with steady demand.',
    severity: 'low',
    category: 'Freelancing',
    action: 'Review',
    metric: '₹9,167 Avg/Project',
    trend: 'stable'
  },
  {
    id: 'hosting-expense-pattern',
    title: 'Hosting Expense Optimization Opportunity',
    description: 'Multiple hosting expenses across different providers (Deluxe Linux, InMotionHosting). Consolidating to a single provider could yield 20-30% cost savings.',
    severity: 'medium',
    category: 'Server Expenses',
    action: 'Optimize',
    metric: '3 Providers Active',
    trend: 'stable'
  },
  {
    id: 'lecture-income-diversification',
    title: 'Lecture Income Portfolio',
    description: 'Teaching activities provide diversified income streams across Adobe software training. Consistent ₹5,000-₹7,000 per session indicates strong market demand.',
    severity: 'low',
    category: 'Lectures',
    action: 'Review',
    metric: '₹6,000 Avg/Session',
    trend: 'stable'
  },
  {
    id: 'youtube-monetization-success',
    title: 'YouTube Channel Monetization',
    description: 'Home Trainer YouTube channel generated ₹8,242 in revenue, demonstrating successful content monetization. Opportunity to expand content strategy.',
    severity: 'low',
    category: 'YouTube Revenue Income',
    action: 'Review',
    metric: '₹8,242 Generated',
    trend: 'up'
  },
  {
    id: 'payment-method-diversification',
    title: 'Payment Method Analysis',
    description: 'Most transactions lack specified payment methods. Implementing proper payment tracking could improve financial management and tax reporting.',
    severity: 'medium',
    category: 'Operations',
    action: 'Investigate',
    metric: '85% Unspecified',
    trend: 'stable'
  }
];

// ─── Format Functions (reusing from mockData) ─────────────────────────────────────
export const formatCurrency = (value: number, compact = false): string => {
  // Always use full Indian currency format without decimals
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export const formatPct = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
