import { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Calendar, Tag, Save, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { Transaction } from '../../data/types';

// Date range presets
const DATE_PRESETS = [
  { label: 'Today', range: () => {
    const today = new Date();
    return { start: today, end: today };
  }},
  { label: 'This Week', range: () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return { start: weekStart, end: new Date() };
  }},
  { label: 'This Month', range: () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: monthStart, end: today };
  }},
  { label: 'Last Month', range: () => {
    const today = new Date();
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: lastMonthStart, end: lastMonthEnd };
  }},
  { label: 'This Quarter', range: () => {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
    return { start: quarterStart, end: today };
  }},
  { label: 'This Year', range: () => {
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    return { start: yearStart, end: today };
  }},
  { label: 'Last 12 Months', range: () => {
    const today = new Date();
    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return { start: yearAgo, end: today };
  }},
  { label: 'All Time', range: () => {
    return { start: new Date(2000, 0, 1), end: new Date() };
  }}
];

interface SearchFilters {
  query: string;
  dateRange: { start: Date | null; end: Date | null };
  categories: string[];
  types: ('income' | 'expense')[];
  amountRange: { min: number; max: number };
  logicOperator: 'AND' | 'OR';
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

interface AdvancedSearchProps {
  transactions: Transaction[];
  onFilteredResults: (results: Transaction[]) => void;
  categories: string[];
}

export function AdvancedSearch({ transactions, onFilteredResults, categories }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { start: null, end: null },
    categories: [],
    types: [],
    amountRange: { min: 0, max: 10000000 },
    logicOperator: 'AND'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const searchTerms = filters.query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      // Text search
      if (searchTerms.length > 0) {
        const searchText = `${transaction.description} ${transaction.category} ${transaction.sub_category} ${transaction.notes}`.toLowerCase();
        const matches = searchTerms.every(term => searchText.includes(term));
        
        if (filters.logicOperator === 'AND' && !matches) return false;
        if (filters.logicOperator === 'OR' && !searchTerms.some(term => searchText.includes(term))) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const transactionDate = new Date(transaction.date);
        if (filters.dateRange.start && transactionDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && transactionDate > filters.dateRange.end) return false;
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (filters.logicOperator === 'AND') {
          if (!filters.categories.every(cat => 
            transaction.category.toLowerCase().includes(cat.toLowerCase()) ||
            transaction.sub_category.toLowerCase().includes(cat.toLowerCase())
          )) return false;
        } else {
          if (!filters.categories.some(cat => 
            transaction.category.toLowerCase().includes(cat.toLowerCase()) ||
            transaction.sub_category.toLowerCase().includes(cat.toLowerCase())
          )) return false;
        }
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(transaction.type)) {
        return false;
      }

      // Amount range filter
      if (transaction.amount < filters.amountRange.min || transaction.amount > filters.amountRange.max) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Notify parent of filtered results
  useCallback(() => {
    onFilteredResults(filteredTransactions);
  }, [filteredTransactions, onFilteredResults]);

  // Apply date preset
  const applyDatePreset = (preset: typeof DATE_PRESETS[0]) => {
    const range = preset.range();
    setFilters(prev => ({
      ...prev,
      dateRange: { start: range.start, end: range.end }
    }));
  };

  // Save current search
  const saveSearch = () => {
    if (!searchName.trim()) return;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters },
      createdAt: new Date().toISOString()
    };
    
    setSavedSearches(prev => [...prev, newSearch]);
    setSearchName('');
    setShowSaveDialog(false);
  };

  // Load saved search
  const loadSavedSearch = (saved: SavedSearch) => {
    setFilters(saved.filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      query: '',
      dateRange: { start: null, end: null },
      categories: [],
      types: [],
      amountRange: { min: 0, max: 10000000 },
      logicOperator: 'AND'
    });
  };

  // Remove category filter
  const removeCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search transactions by description, category, or notes..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showAdvanced && <X className="w-3 h-3 ml-2" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              disabled={!filters.query && filters.categories.length === 0 && !filters.dateRange.start}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </div>

          {/* Active filters display */}
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.categories.map(category => (
              <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(category)}>
                {category}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.types.map(type => (
              <Badge key={type} variant="secondary">
                {type}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => 
                  setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }))
                } />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DATE_PRESETS.map(preset => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() => applyDatePreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value ? new Date(e.target.value) : null }
                  }))}
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value ? new Date(e.target.value) : null }
                  }))}
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.includes(category)
                          ? prev.categories.filter(c => c !== category)
                          : [...prev.categories, category]
                      }));
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Transaction Types */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Transaction Type</label>
              <div className="flex gap-2">
                {(['income', 'expense'] as const).map(type => (
                  <Button
                    key={type}
                    variant={filters.types.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        types: prev.types.includes(type)
                          ? prev.types.filter(t => t !== type)
                          : [...prev.types, type]
                      }));
                    }}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount Range (₹)</label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.amountRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, min: Number(e.target.value) || 0 }
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.amountRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, max: Number(e.target.value) || 10000000 }
                  }))}
                />
              </div>
            </div>

            {/* Logic Operator */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Logic</label>
              <div className="flex gap-2">
                <Button
                  variant={filters.logicOperator === 'AND' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, logicOperator: 'AND' }))}
                >
                  AND (All terms must match)
                </Button>
                <Button
                  variant={filters.logicOperator === 'OR' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, logicOperator: 'OR' }))}
                >
                  OR (Any term can match)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Found {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card className="p-4">
          <h3 className="font-medium mb-3">Save Search</h3>
          <Input
            placeholder="Enter search name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveSearch} disabled={!searchName.trim()}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Saved Searches</h3>
            <div className="space-y-2">
              {savedSearches.map(search => (
                <div key={search.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{search.name}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => loadSavedSearch(search)}>
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
