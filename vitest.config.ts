import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true, // Enable CSS support for components that might use CSS
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'], // Explicitly include test files
  },
});
