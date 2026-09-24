import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let client = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabase() {
  if (client) return client;
  if (isSupabaseConfigured()) {
    try {
      client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      return client;
    } catch (e) {
      console.warn('[Supabase] Client init warning:', e.message);
    }
  }
  return null;
}

export async function fetchFromSupabase(table, orderBy = 'id', ascending = true) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(table).select('*').order(orderBy, { ascending });
    if (error) {
      console.warn(`[Supabase] Fetch ${table} notice:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[Supabase] Fetch ${table} error:`, err.message);
    return null;
  }
}

export async function upsertToSupabase(table, row) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from(table).upsert(row).select();
    if (error) {
      console.warn(`[Supabase] Upsert ${table} notice:`, error.message);
      return null;
    }
    return data?.[0] || row;
  } catch (err) {
    console.warn(`[Supabase] Upsert ${table} error:`, err.message);
    return null;
  }
}

export async function deleteFromSupabase(table, id) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase] Delete ${table} notice:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Delete ${table} error:`, err.message);
    return false;
  }
}
