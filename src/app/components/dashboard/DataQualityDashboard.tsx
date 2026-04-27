import { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Activity, Database, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useDataQuality, type DataQualityReport, type DataAnomaly } from '../../services/dataQuality';
import type { Transaction } from '../../data/types';

interface DataQualityDashboardProps {
  transactions: Transaction[];
}

export function DataQualityDashboard({ transactions }: DataQualityDashboardProps) {
  const { qualityReport, isChecking, runQualityCheck, autoCheck, setAutoCheck } = useDataQuality(transactions);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const anomaliesByType = useMemo(() => {
    if (!qualityReport) return {};
    return qualityReport.anomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [qualityReport]);

  const anomaliesBySeverity = useMemo(() => {
    if (!qualityReport) return {};
    return qualityReport.anomalies.reduce((acc, anomaly) => {
      acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [qualityReport]);

  if (!qualityReport) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Analyzing data quality...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Data Quality Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Last checked: {new Date(qualityReport.lastChecked).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => setAutoCheck(e.target.checked)}
              className="rounded"
            />
            Auto-check
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={runQualityCheck}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Run Check'}
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Overall Data Quality Score</h3>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
                  {qualityReport.overallScore.toFixed(1)}%
                </span>
                <TrendingUp className={`w-5 h-5 ${getScoreColor(qualityReport.overallScore)}`} />
              </div>
            </div>
            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getScoreBg(qualityReport.overallScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(qualityReport.overallScore)}`}>
                {qualityReport.overallScore >= 90 ? 'A' : qualityReport.overallScore >= 70 ? 'B' : 'C'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualityReport.metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{metric.name}</h4>
                {getStatusIcon(metric.status)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-semibold ${
                    metric.status === 'good' ? 'text-emerald-600' :
                    metric.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {metric.value.toFixed(1)}%
                  </span>
                  <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-emerald-600' :
                      metric.status === 'warning' ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomalies Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomalies by Type */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Anomalies by Type
            </h4>
            <div className="space-y-2">
              {Object.entries(anomaliesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(anomaliesByType).length === 0 && (
                <p className="text-sm text-slate-500">No anomalies detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Anomalies by Severity */}
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Anomalies by Severity
            </h4>
            <div className="space-y-2">
              {Object.entries(anomaliesBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{severity}</span>
                  <Badge className={getSeverityColor(severity)}>{count}</Badge>
                </div>
              ))}
              {Object.keys(anomaliesBySeverity).length === 0 && (
                <p className="text-sm text-slate-500">No anomalies detected</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Anomalies */}
      {qualityReport.anomalies.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Recent Anomalies</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {qualityReport.anomalies.slice(0, 10).map((anomaly) => (
                <div key={anomaly.id} className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">
                          {anomaly.type.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                        {anomaly.description}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Suggested fix: {anomaly.suggestedFix}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Transaction: {anomaly.transaction.description} - ₹{anomaly.transaction.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {qualityReport.anomalies.length > 10 && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                And {qualityReport.anomalies.length - 10} more anomalies...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Summary Statistics</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {qualityReport.totalRecords.toLocaleString()}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Records</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {qualityReport.metrics.filter(m => m.status === 'good').length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Good Metrics</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {qualityReport.metrics.filter(m => m.status === 'warning').length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Warning Metrics</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {qualityReport.anomalies.length}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Anomalies</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
