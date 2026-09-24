import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://lnxyazycqsstclgqawtv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHlhenljcXNzdGNsZ3Fhd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDE3NTYsImV4cCI6MjEwNTYxNzc1Nn0.t5HJDgZLlZ3ktBsvuARryA25pkTusdxUgXQwAkLv9G4';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
