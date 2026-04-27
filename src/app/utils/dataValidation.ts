// Data validation utilities for financial transactions
import type { Transaction } from '../data/types';

export const validateTransaction = (transaction: Transaction): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate date format and range
  const date = new Date(transaction.date);
  const currentYear = new Date().getFullYear();
  const minYear = 2000; // Reasonable minimum year for financial data
  const maxYear = currentYear + 1; // Allow next year for future transactions
  
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
  } else {
    const year = date.getFullYear();
    if (year < minYear || year > maxYear) {
      errors.push(`Year must be between ${minYear} and ${maxYear}, got ${year}`);
    }
  }
  
  // Validate amount
  if (transaction.amount < 0) {
    errors.push('Amount cannot be negative');
  }
  if (transaction.amount > 999999999) {
    errors.push('Amount seems unreasonably large');
  }
  
  // Validate required fields
  if (!transaction.description?.trim()) {
    errors.push('Description is required');
  }
  if (!transaction.category?.trim()) {
    errors.push('Category is required');
  }
  if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
    errors.push('Type must be either "income" or "expense"');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeTransaction = (transaction: Partial<Transaction>): Transaction => {
  // Fix common data issues
  const date = new Date(transaction.date || '');
  const currentYear = new Date().getFullYear();
  
  // Fix 1899 dates (common Excel import issue)
  if (date.getFullYear() === 1899) {
    date.setFullYear(currentYear);
  }
  
  return {
    transaction_id: transaction.transaction_id || `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    description: (transaction.description || '').trim(),
    type: transaction.type as 'income' | 'expense' || 'expense',
    category: (transaction.category || '').trim(),
    sub_category: (transaction.sub_category || '').trim(),
    amount: Number(transaction.amount) || 0,
    tax: Number(transaction.tax) || 0,
    payment_method: transaction.payment_method || '',
    notes: transaction.notes || '',
    created_by: transaction.created_by || 'system',
    approved_by: transaction.approved_by || '',
    timestamp: transaction.timestamp || new Date().toISOString(),
    status: transaction.status as 'approved' | 'pending' | 'flagged' || 'pending',
    attachment: transaction.attachment || false
  };
};

export const validateAndCleanTransactions = (transactions: any[]): { valid: Transaction[]; invalid: any[]; errors: string[] } => {
  const valid: Transaction[] = [];
  const invalid: any[] = [];
  const allErrors: string[] = [];
  
  transactions.forEach((transaction, index) => {
    try {
      // First sanitize the data
      const cleaned = sanitizeTransaction(transaction);
      
      // Then validate
      const validation = validateTransaction(cleaned);
      
      if (validation.isValid) {
        valid.push(cleaned);
      } else {
        invalid.push(transaction);
        allErrors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
      }
    } catch (error) {
      invalid.push(transaction);
      allErrors.push(`Row ${index + 1}: Processing error - ${error}`);
    }
  });
  
  return { valid, invalid, errors: allErrors };
};
