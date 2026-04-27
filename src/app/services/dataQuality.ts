// Data Quality Monitoring System
import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../data/types';

export interface DataQualityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  threshold: { good: number; warning: number; critical: number };
}

export interface DataAnomaly {
  id: string;
  type: 'amount_outlier' | 'date_anomaly' | 'duplicate' | 'missing_data' | 'format_error';
  severity: 'low' | 'medium' | 'high';
  transaction: Transaction;
  description: string;
  detectedAt: string;
  suggestedFix: string;
}

export interface DataQualityReport {
  overallScore: number;
  metrics: DataQualityMetric[];
  anomalies: DataAnomaly[];
  lastChecked: string;
  totalRecords: number;
}

class DataQualityService {
  private static instance: DataQualityService;
  private checks: Map<string, (transactions: Transaction[]) => DataQualityMetric[]> = new Map();

  static getInstance(): DataQualityService {
    if (!DataQualityService.instance) {
      DataQualityService.instance = new DataQualityService();
    }
    return DataQualityService.instance;
  }

  // Register custom validation checks
  registerCheck(name: string, checkFn: (transactions: Transaction[]) => DataQualityMetric[]) {
    this.checks.set(name, checkFn);
  }

  // Run all quality checks
  async runQualityChecks(transactions: Transaction[]): Promise<DataQualityReport> {
    const metrics: DataQualityMetric[] = [];
    const anomalies: DataAnomaly[] = [];

    // Built-in checks
    metrics.push(...this.checkCompleteness(transactions));
    metrics.push(...this.checkConsistency(transactions));
    metrics.push(...this.checkValidity(transactions));
    metrics.push(...this.checkDuplicates(transactions));

    // Run custom checks
    for (const [name, checkFn] of this.checks) {
      try {
        metrics.push(...checkFn(transactions));
      } catch (error) {
        console.error(`Error in custom check '${name}':`, error);
      }
    }

    // Detect anomalies
    anomalies.push(...this.detectAmountOutliers(transactions));
    anomalies.push(...this.detectDateAnomalies(transactions));
    anomalies.push(...this.detectMissingData(transactions));
    anomalies.push(...this.detectFormatErrors(transactions));

    const overallScore = this.calculateOverallScore(metrics, anomalies, transactions.length);

    return {
      overallScore,
      metrics,
      anomalies,
      lastChecked: new Date().toISOString(),
      totalRecords: transactions.length
    };
  }

  private checkCompleteness(transactions: Transaction[]): DataQualityMetric[] {
    const total = transactions.length;
    const withDescription = transactions.filter(t => t.description?.trim()).length;
    const withCategory = transactions.filter(t => t.category?.trim()).length;
    const withValidDate = transactions.filter(t => {
      const date = new Date(t.date);
      return !isNaN(date.getTime());
    }).length;

    return [
      {
        name: 'Description Completeness',
        value: (withDescription / total) * 100,
        status: this.getStatus((withDescription / total) * 100, [95, 90, 80]),
        description: `${withDescription}/${total} transactions have descriptions`,
        threshold: { good: 95, warning: 90, critical: 80 }
      },
      {
        name: 'Category Completeness',
        value: (withCategory / total) * 100,
        status: this.getStatus((withCategory / total) * 100, [95, 90, 80]),
        description: `${withCategory}/${total} transactions have categories`,
        threshold: { good: 95, warning: 90, critical: 80 }
      },
      {
        name: 'Date Validity',
        value: (withValidDate / total) * 100,
        status: this.getStatus((withValidDate / total) * 100, [95, 90, 80]),
        description: `${withValidDate}/${total} transactions have valid dates`,
        threshold: { good: 95, warning: 90, critical: 80 }
      }
    ];
  }

  private checkConsistency(transactions: Transaction[]): DataQualityMetric[] {
    const total = transactions.length;
    const withValidType = transactions.filter(t => ['income', 'expense'].includes(t.type)).length;
    const withValidAmount = transactions.filter(t => t.amount > 0).length;
    const withValidTax = transactions.filter(t => t.tax >= 0).length;

    return [
      {
        name: 'Type Consistency',
        value: (withValidType / total) * 100,
        status: this.getStatus((withValidType / total) * 100, [95, 90, 80]),
        description: `${withValidType}/${total} transactions have valid types`,
        threshold: { good: 95, warning: 90, critical: 80 }
      },
      {
        name: 'Amount Consistency',
        value: (withValidAmount / total) * 100,
        status: this.getStatus((withValidAmount / total) * 100, [95, 90, 80]),
        description: `${withValidAmount}/${total} transactions have positive amounts`,
        threshold: { good: 95, warning: 90, critical: 80 }
      }
    ];
  }

  private checkValidity(transactions: Transaction[]): DataQualityMetric[] {
    const total = transactions.length;
    const withValidId = transactions.filter(t => t.transaction_id?.trim()).length;
    const withValidTax = transactions.filter(t => typeof t.tax === 'number' && t.tax >= 0).length;

    return [
      {
        name: 'ID Validity',
        value: (withValidId / total) * 100,
        status: this.getStatus((withValidId / total) * 100, [95, 90, 80]),
        description: `${withValidId}/${total} transactions have valid IDs`,
        threshold: { good: 95, warning: 90, critical: 80 }
      }
    ];
  }

  private checkDuplicates(transactions: Transaction[]): DataQualityMetric[] {
    const duplicates = this.findDuplicates(transactions);
    const duplicateCount = duplicates.length;
    const total = transactions.length;
    const duplicateRate = (duplicateCount / total) * 100;

    return [
      {
        name: 'Duplicate Rate',
        value: duplicateRate,
        status: this.getStatus(100 - duplicateRate, [95, 90, 80]), // Invert since lower is better
        description: `${duplicateCount} duplicate transactions found`,
        threshold: { good: 5, warning: 10, critical: 20 }
      }
    ];
  }

  private detectAmountOutliers(transactions: Transaction[]): DataAnomaly[] {
    const amounts = transactions.map(t => t.amount).sort((a, b) => a - b);
    const q1 = amounts[Math.floor(amounts.length * 0.25)];
    const q3 = amounts[Math.floor(amounts.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);

    return transactions
      .filter(t => t.amount < lowerBound || t.amount > upperBound)
      .map(t => ({
        id: `amount_outlier_${t.transaction_id}`,
        type: 'amount_outlier' as const,
        severity: Math.abs(t.amount - upperBound) > upperBound * 2 ? 'high' : 'medium',
        transaction: t,
        description: `Amount ₹${t.amount.toLocaleString('en-IN')} is outside normal range (₹${lowerBound.toLocaleString('en-IN')} - ₹${upperBound.toLocaleString('en-IN')})`,
        detectedAt: new Date().toISOString(),
        suggestedFix: 'Verify transaction amount and category'
      }));
  }

  private detectDateAnomalies(transactions: Transaction[]): DataAnomaly[] {
    const currentYear = new Date().getFullYear();
    const anomalies: DataAnomaly[] = [];

    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();

      if (year < 2000 || year > currentYear + 1) {
        anomalies.push({
          id: `date_anomaly_${t.transaction_id}`,
          type: 'date_anomaly' as const,
          severity: year < 2000 ? 'high' : 'medium',
          transaction: t,
          description: `Transaction date ${t.date} is outside reasonable range`,
          detectedAt: new Date().toISOString(),
          suggestedFix: 'Correct the transaction date'
        });
      }
    });

    return anomalies;
  }

  private detectMissingData(transactions: Transaction[]): DataAnomaly[] {
    const anomalies: DataAnomaly[] = [];

    transactions.forEach(t => {
      const issues = [];
      if (!t.description?.trim()) issues.push('description');
      if (!t.category?.trim()) issues.push('category');
      if (!t.amount || t.amount <= 0) issues.push('amount');

      if (issues.length > 0) {
        anomalies.push({
          id: `missing_data_${t.transaction_id}`,
          type: 'missing_data' as const,
          severity: issues.length > 1 ? 'high' : 'medium',
          transaction: t,
          description: `Missing required fields: ${issues.join(', ')}`,
          detectedAt: new Date().toISOString(),
          suggestedFix: `Complete missing fields: ${issues.join(', ')}`
        });
      }
    });

    return anomalies;
  }

  private detectFormatErrors(transactions: Transaction[]): DataAnomaly[] {
    const anomalies: DataAnomaly[] = [];

    transactions.forEach(t => {
      // Check date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date)) {
        anomalies.push({
          id: `format_error_date_${t.transaction_id}`,
          type: 'format_error' as const,
          severity: 'medium',
          transaction: t,
          description: `Invalid date format: ${t.date}`,
          detectedAt: new Date().toISOString(),
          suggestedFix: 'Format date as YYYY-MM-DD'
        });
      }

      // Check amount format
      if (typeof t.amount !== 'number' || isNaN(t.amount)) {
        anomalies.push({
          id: `format_error_amount_${t.transaction_id}`,
          type: 'format_error' as const,
          severity: 'high',
          transaction: t,
          description: `Invalid amount format: ${t.amount}`,
          detectedAt: new Date().toISOString(),
          suggestedFix: 'Ensure amount is a valid number'
        });
      }
    });

    return anomalies;
  }

  private findDuplicates(transactions: Transaction[]): Transaction[] {
    const seen = new Map<string, Transaction[]>();
    
    transactions.forEach(t => {
      const key = `${t.date}_${t.description}_${t.amount}_${t.type}`;
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(t);
    });

    const duplicates: Transaction[] = [];
    seen.forEach(transactions => {
      if (transactions.length > 1) {
        duplicates.push(...transactions.slice(1)); // Keep first, mark others as duplicates
      }
    });

    return duplicates;
  }

  private calculateOverallScore(metrics: DataQualityMetric[], anomalies: DataAnomaly[], totalRecords: number): number {
    const metricScore = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    const anomalyPenalty = (anomalies.length / totalRecords) * 100;
    return Math.max(0, Math.min(100, metricScore - anomalyPenalty));
  }

  private getStatus(value: number, thresholds: [good: number, warning: number, critical: number]): 'good' | 'warning' | 'critical' {
    const [good, warning, critical] = thresholds;
    if (value >= good) return 'good';
    if (value >= warning) return 'warning';
    return 'critical';
  }
}

// Hook for data quality monitoring
export function useDataQuality(transactions: Transaction[]) {
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);

  const runQualityCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const service = DataQualityService.getInstance();
      const report = await service.runQualityChecks(transactions);
      setQualityReport(report);
    } catch (error) {
      console.error('Error running quality check:', error);
    } finally {
      setIsChecking(false);
    }
  }, [transactions]);

  // Auto-run quality checks
  useEffect(() => {
    if (autoCheck && transactions.length > 0) {
      runQualityCheck();
    }
  }, [transactions, autoCheck, runQualityCheck]);

  // Schedule periodic checks
  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(runQualityCheck, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [autoCheck, runQualityCheck]);

  return {
    qualityReport,
    isChecking,
    runQualityCheck,
    autoCheck,
    setAutoCheck
  };
}
