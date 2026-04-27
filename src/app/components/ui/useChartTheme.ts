import type { CSSProperties } from 'react';
import { useApp } from '../../context/AppContext';

export interface ChartTheme {
  tooltip: CSSProperties;
  grid: string;
  tick: string;
  bg: string;
}

export function useChartTheme(): ChartTheme {
  const { darkMode } = useApp();
  return {
    tooltip: {
      borderRadius: 8,
      border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      fontSize: 12,
      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
      color: darkMode ? '#cbd5e1' : '#334155',
    },
    grid: darkMode ? '#1e293b' : '#f1f5f9',
    tick: darkMode ? '#94a3b8' : '#64748b',
    bg:   darkMode ? '#1e293b' : '#ffffff',
  };
}
