import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change far less often than app code, so keeping them in their own files lets the
        // browser reuse them from cache across deploys.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/node_modules\/react-router/.test(id)) return 'router';
          if (id.includes('node_modules/@supabase/')) return 'supabase';
          if (/node_modules\/(react-hook-form|@hookform|zod)\//.test(id)) return 'forms';
        },
      },
    },
  },
})
