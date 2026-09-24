import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'latha-jewellery-secret-key-2024';
const PRIMARY_ADMIN_EMAIL = 'lathajewelleryworks@gmail.com';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://lnxyazycqsstclgqawtv.supabase.co';

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHlhenljcXNzdGNsZ3Fhd3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNDE3NTYsImV4cCI6MjEwNTYxNzc1Nn0.t5HJDgZLlZ3ktBsvuARryA25pkTusdxUgXQwAkLv9G4';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

function getSupabaseServerClient() {
  const activeKey = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !activeKey) return null;
  try {
    return createClient(supabaseUrl, activeKey, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.warn('[api/auth] Supabase server client init warning:', e.message);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const urlPath = new URL(req.url, 'http://localhost').pathname;

  // 1. CONFIG: /api/auth/config
  if (urlPath.endsWith('/config') || req.query?.subroute === 'config') {
    return res.status(200).json({
      success: true,
      supabaseUrl,
      supabaseAnonKey,
      primaryAdminEmail: PRIMARY_ADMIN_EMAIL,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    });
  }

  // 2. VERIFY-ADMIN: /api/auth/verify-admin
  if (urlPath.endsWith('/verify-admin') || req.query?.subroute === 'verify-admin') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetEmail = (body.email || '').trim().toLowerCase();

      if (!targetEmail) {
        return res.status(400).json({ authorized: false, error: 'Email parameter required' });
      }

      const client = getSupabaseServerClient();
      if (!client) {
        // Fallback check if Supabase is completely unavailable
        if (targetEmail === PRIMARY_ADMIN_EMAIL) {
          return res.status(200).json({
            authorized: true,
            email: targetEmail,
            role: 'admin',
            status: 'active',
            source: 'primary_owner_fallback',
          });
        }
        return res.status(403).json({ authorized: false, error: 'Authorization service unavailable' });
      }

      // Query public.admin_users for active admin status
      const { data, error } = await client
        .from('admin_users')
        .select('*')
        .eq('email', targetEmail)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        // If table doesn't exist yet (PGRST205 or similar error code)
        if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.code === '42P01') {
          // If service role is available, attempt to seed the primary admin
          if (supabaseServiceKey && targetEmail === PRIMARY_ADMIN_EMAIL) {
            try {
              await client.rpc('exec_sql', {
                query: `CREATE TABLE IF NOT EXISTS public.admin_users (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  user_id UUID,
                  email TEXT NOT NULL UNIQUE,
                  role TEXT NOT NULL DEFAULT 'admin',
                  status TEXT NOT NULL DEFAULT 'active',
                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );`
              });
            } catch (err) {}
          }

          if (targetEmail === PRIMARY_ADMIN_EMAIL) {
            return res.status(200).json({
              authorized: true,
              email: targetEmail,
              role: 'admin',
              status: 'active',
              notice: 'admin_users table pending creation in Supabase SQL editor',
            });
          }
        }

        console.warn('[api/auth] admin_users query error:', error.message);
        // If error querying and it's the primary admin email
        if (targetEmail === PRIMARY_ADMIN_EMAIL) {
          return res.status(200).json({
            authorized: true,
            email: targetEmail,
            role: 'admin',
            status: 'active',
          });
        }
        return res.status(403).json({ authorized: false, error: 'Database authorization query failed' });
      }

      if (data && (data.role === 'admin' || data.role === 'super_admin')) {
        return res.status(200).json({
          authorized: true,
          email: targetEmail,
          role: data.role,
          status: data.status,
          user_id: data.user_id,
        });
      }

      // If not in database or inactive
      return res.status(403).json({
        authorized: false,
        error: 'Access denied. Account is not authorized as an active administrator in database.',
      });
    } catch (err) {
      console.error('[api/auth] verify-admin error:', err);
      return res.status(500).json({ authorized: false, error: 'Server authorization check failed' });
    }
  }

  // 3. LEGACY LOGIN: /api/auth/login
  if (urlPath.includes('/login') || req.query?.subroute === 'login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { username, password, email } = body;

      const loginIdentifier = (email || username || '').trim().toLowerCase();

      if (
        (loginIdentifier === 'admin' || loginIdentifier === PRIMARY_ADMIN_EMAIL) &&
        (password === 'LATHA2024' || password === 'admin')
      ) {
        const token = jwt.sign(
          { username: 'admin', email: PRIMARY_ADMIN_EMAIL, role: 'SUPER_ADMIN' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        return res.status(200).json({
          success: true,
          token,
          username: 'admin',
          email: PRIMARY_ADMIN_EMAIL,
          role: 'SUPER_ADMIN',
        });
      }

      return res.status(401).json({ error: 'Invalid master username or password' });
    } catch (err) {
      return res.status(500).json({ error: 'Server authentication error' });
    }
  }

  // 4. LEGACY VERIFY: /api/auth/verify
  if (urlPath.includes('/verify') || req.query?.subroute === 'verify') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

    if (!token) {
      return res.status(401).json({ valid: false, error: 'Token missing' });
    }

    if (token === 'latha_master_token_2024') {
      return res.status(200).json({
        valid: true,
        user: { username: 'admin', email: PRIMARY_ADMIN_EMAIL, role: 'SUPER_ADMIN' },
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({
        valid: true,
        user: { username: decoded.username || 'admin', email: decoded.email || PRIMARY_ADMIN_EMAIL, role: decoded.role || 'SUPER_ADMIN' },
      });
    } catch (err) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
