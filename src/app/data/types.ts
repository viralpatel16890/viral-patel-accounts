export type Role = 'executive' | 'manager' | 'cfo';

export interface Transaction {
  transaction_id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  sub_category: string;
  amount: number;
  tax: number;
  payment_method: string;
  notes: string;
  created_by: string;
  approved_by: string;
  timestamp: string;
  status: 'approved' | 'pending' | 'flagged';
  attachment?: boolean;
}

export interface YearlySummary {
  year: number;
  income: number;
  expenses: number;
  netProfit: number;
  yoyGrowth: number;
  expenseRatio: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  netProfit: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  trend: number;
  subCategories: SubCategorySummary[];
}

export interface SubCategorySummary {
  name: string;
  amount: number;
  percentage: number;
}

export interface BudgetItem {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePct: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  action: 'Review' | 'Optimize' | 'Reclassify' | 'Investigate';
  metric: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  lastActive: string;
  status: 'active' | 'inactive';
}
