import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { googleSheetsPlugin } from './src/plugins/google-sheets-plugin'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    googleSheetsPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split chart libraries into separate chunks
          'recharts-core': ['recharts'],
          // Split UI libraries
          'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          // Split motion libraries
          'motion': ['motion', 'framer-motion'],
          // Split data utilities
          'data-utils': ['date-fns', 'clsx', 'class-variance-authority'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
