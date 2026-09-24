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
  // Verifies authenticated user UUID against public.admin_users
  if (urlPath.endsWith('/verify-admin') || req.query?.subroute === 'verify-admin') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const targetUserId = body.userId ? String(body.userId).trim() : null;
      const targetEmail = (body.email || '').trim().toLowerCase();

      if (!targetUserId && !targetEmail) {
        return res.status(400).json({ authorized: false, error: 'User ID or email required' });
      }

      const client = getSupabaseServerClient();
      if (!client) {
        return res.status(503).json({ authorized: false, error: 'Authorization service unavailable' });
      }

      let adminRecord = null;

      // Primary check: Query admin_users matching authenticated user UUID
      if (targetUserId) {
        const { data, error } = await client
          .from('admin_users')
          .select('id, user_id, email, role, status')
          .eq('user_id', targetUserId)
          .eq('status', 'active')
          .maybeSingle();

        if (!error && data) {
          adminRecord = data;
        }
      }

      // Safe owner user_id association:
      // If not yet matched by UUID, but email is the primary owner and user_id in admin_users is NULL,
      // associate admin_users.user_id with the authenticated user's UUID
      if (!adminRecord && targetEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() && targetUserId) {
        const { data: ownerRow, error: ownerError } = await client
          .from('admin_users')
          .select('id, user_id, email, role, status')
          .ilike('email', targetEmail)
          .eq('status', 'active')
          .maybeSingle();

        if (!ownerError && ownerRow && !ownerRow.user_id) {
          try {
            await client
              .from('admin_users')
              .update({ user_id: targetUserId, updated_at: new Date().toISOString() })
              .eq('id', ownerRow.id);

            adminRecord = { ...ownerRow, user_id: targetUserId };
          } catch (updateErr) {
            console.warn('[api/auth] Owner user_id link notice:', updateErr.message);
          }
        }
      }

      // Verify UUID match, active status, and admin role
      if (
        adminRecord &&
        (!targetUserId || adminRecord.user_id === targetUserId) &&
        (adminRecord.role === 'admin' || adminRecord.role === 'super_admin') &&
        adminRecord.status === 'active'
      ) {
        // Additional email consistency check if provided
        if (targetEmail && adminRecord.email && adminRecord.email.toLowerCase() !== targetEmail) {
          return res.status(403).json({ authorized: false, error: 'Account authorization mismatch' });
        }

        return res.status(200).json({
          authorized: true,
          user_id: adminRecord.user_id,
          email: adminRecord.email,
          role: adminRecord.role,
          status: adminRecord.status,
        });
      }

      // Deny access if check failed
      return res.status(403).json({
        authorized: false,
        error: 'Access denied. Account is not authorized as an active administrator.',
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

    return res.status(401).json({
      error: 'Legacy login deprecated. Please authenticate securely via Supabase Auth with your administrator credentials.',
    });
  }

  // 4. LEGACY VERIFY: /api/auth/verify
  if (urlPath.includes('/verify') || req.query?.subroute === 'verify') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();

    if (!token) {
      return res.status(401).json({ valid: false, error: 'Token missing' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({
        valid: true,
        user: { username: decoded.username || 'admin', email: decoded.email || PRIMARY_ADMIN_EMAIL, role: decoded.role || 'admin' },
      });
    } catch (err) {
      return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
