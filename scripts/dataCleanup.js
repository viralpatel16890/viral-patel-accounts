#!/usr/bin/env node

// Data cleanup script for financial transactions
import fs from 'fs';
import path from 'path';

// Simple validation without external dependencies
const validateAndFixTransaction = (transaction) => {
  const errors = [];
  
  // Fix date issues
  if (transaction.date) {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    
    // Fix 1899 dates (common Excel import issue)
    if (year === 1899) {
      const currentYear = new Date().getFullYear();
      date.setFullYear(currentYear);
      transaction.date = date.toISOString().split('T')[0];
      errors.push(`Fixed 1899 date to ${currentYear}`);
    }
    
    // Validate year range
    if (year < 2000 || year > new Date().getFullYear() + 1) {
      errors.push(`Suspicious year: ${year}`);
    }
  }
  
  // Fix amount issues
  if (typeof transaction.amount === 'string') {
    transaction.amount = parseFloat(transaction.amount) || 0;
  }
  if (transaction.amount < 0) {
    transaction.amount = Math.abs(transaction.amount);
    errors.push('Fixed negative amount');
  }
  
  // Ensure required fields
  transaction.description = (transaction.description || '').trim();
  transaction.category = (transaction.category || '').trim();
  transaction.sub_category = (transaction.sub_category || '').trim();
  transaction.type = transaction.type || 'expense';
  transaction.notes = transaction.notes || '';
  transaction.payment_method = transaction.payment_method || '';
  
  return errors;
};

// Main cleanup function
const cleanDataFile = () => {
  const filePath = path.join(process.cwd(), 'user_transactions.json');
  
  try {
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const transactions = JSON.parse(fileContent);
    
    console.log(`📊 Processing ${transactions.length} transactions...`);
    
    let totalFixes = 0;
    const fixedTransactions = [];
    
    transactions.forEach((transaction, index) => {
      const errors = validateAndFixTransaction(transaction);
      
      if (errors.length > 0) {
        console.log(`🔧 Row ${index + 1}: ${errors.join(', ')}`);
        totalFixes++;
      }
      
      fixedTransactions.push(transaction);
    });
    
    // Write back the cleaned data
    fs.writeFileSync(filePath, JSON.stringify(fixedTransactions, null, 2));
    
    console.log(`✅ Cleanup complete! Fixed ${totalFixes} issues.`);
    console.log(`📁 Updated: ${filePath}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
};

// Run the cleanup
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanDataFile();
}

export { validateAndFixTransaction, cleanDataFile };
