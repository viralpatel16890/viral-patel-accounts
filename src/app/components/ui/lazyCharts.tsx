// Lazy-loaded chart components to optimize bundle size
import { lazy } from 'react';

// Core charts (loaded immediately)
export { Line, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Heavy chart components (lazy loaded)
export const ComposedChart = lazy(() => import('recharts').then(module => ({ default: module.ComposedChart })));
export const AreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
export const RadarChart = lazy(() => import('recharts').then(module => ({ default: module.RadarChart })));
export const ScatterChart = lazy(() => import('recharts').then(module => ({ default: module.ScatterChart })));
export const Treemap = lazy(() => import('recharts').then(module => ({ default: module.Treemap })));

// Chart utilities (lightweight) - will be imported dynamically when needed
export const importChartUtils = () => import('recharts');
