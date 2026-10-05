import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://lnxyazycqsstclgqawtv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHlhenljcXNzdGNsZ3Fhd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDE3NTYsImV4cCI6MjEwNTYxNzc1Nn0.t5HJDgZLlZ3ktBsvuARryA25pkTusdxUgXQwAkLv9G4';

function adaptResponse(res) {
  if (!res.status) {
    res.status = function(code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }
  return res;
}

function apiDevMiddleware() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        adaptResponse(res);

        // 1. Google AI Studio Chatbot
        if (url === '/api/google-ai-chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const handler = (await import('./api/google-ai-chat.js')).default;
              await handler(req, res);
            } catch (err) {
              res.status(500).json({ error: err.message });
            }
          });
          return;
        }

        // 2. Custom AI Concierge Chatbot
        if (url === '/api/custom-ai-chat' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const handler = (await import('./api/custom-ai-chat.js')).default;
              await handler(req, res);
            } catch (err) {
              res.status(500).json({ error: err.message });
            }
          });
          return;
        }

        // 3. Live Gold & Silver Rates
        if ((url === '/api/rates' || url === '/api/gold-rates' || url === '/api/public/rates') && req.method === 'GET') {
          try {
            const handler = (await import('./api/rates.js')).default;
            await handler(req, res);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevMiddleware()],
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
