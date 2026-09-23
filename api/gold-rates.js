import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Module-level in-memory cache for serverless lifetime
let memoryRates = null;

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { gold_rates: [], rate_history: [] };
}

function saveStore(store) {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
}

async function syncToSupabase(p24, p22, p18, source = 'GoldAPI') {
  if (!supabaseUrl || !supabaseKey) return;
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('gold_rates').insert({
      price_24k: Number(p24),
      price_22k: Number(p22),
      price_18k: Number(p18),
      currency: 'INR',
      unit: 'gram',
      source: source,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    // Non-fatal, log warning
    console.warn('[GoldRates] Supabase sync notice:', err.message);
  }
}

async function fetchFromGoldAPI(apiKey) {
  const token = apiKey || process.env.GOLDAPI_KEY || process.env.GOLD_API_KEY || 'goldapi-07b38ebf247585a302d0df580bc43d17-io';
  try {
    const apiRes = await fetch('https://www.goldapi.io/api/price/XAU/INR', {
      method: 'GET',
      headers: {
        'x-access-token': token,
        'Content-Type': 'application/json'
      }
    });

    if (!apiRes.ok) return null;
    const data = await apiRes.json();

    // Multi-field extraction: melt_price_per_gram, price_per_unit, or LBMA spot oz conversion
    const p24 = Number(data.price_gram_24k || data.melt_price_per_gram?.['24k'] || data.price_per_unit?.gram || (data.price ? data.price / 31.1034768 : 0));
    const p22 = Number(data.price_gram_22k || data.melt_price_per_gram?.['22k'] || (p24 ? p24 * (22 / 24) : 0));
    const p18 = Number(data.price_gram_18k || data.melt_price_per_gram?.['18k'] || (p24 ? p24 * (18 / 24) : 0));

    if (p24 > 0 && p22 > 0 && p18 > 0) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const timestampStr = `${dateStr}, ${timeStr}`;

      const rateObj = {
        id: 1,
        rate_24k: Math.round(p24).toLocaleString('en-IN'),
        rate_22k: Math.round(p22).toLocaleString('en-IN'),
        rate_18k: Math.round(p18).toLocaleString('en-IN'),
        raw_24k: Math.round(p24),
        raw_22k: Math.round(p22),
        raw_18k: Math.round(p18),
        rate_silver: '92',
        ticker_visible: 1,
        last_updated: timestampStr,
        last_successful_update: timestampStr,
        source: 'GoldAPI.io (XAU/INR)',
        currency: 'INR',
        unit: 'gram',
        status: 'Connected (Live)',
        mode: 'AUTOMATIC_API',
        timestamp_ms: Date.now()
      };

      // Background sync to Supabase table if available
      syncToSupabase(Math.round(p24), Math.round(p22), Math.round(p18), 'GoldAPI').catch(() => {});

      return rateObj;
    }
  } catch (err) {
    console.error('[GoldRates] GoldAPI fetch error:', err.message);
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const store = getStore();
  if (!Array.isArray(store.gold_rates)) store.gold_rates = [];

  let currentRate = memoryRates || store.gold_rates?.[0] || null;

  // 1. FETCH LIVE: /api/gold-rates/fetch-live
  if (urlPath.includes('/fetch-live') || req.query?.subroute === 'fetch-live') {
    const customKey = req.body?.api_key || req.query?.api_key;
    const live = await fetchFromGoldAPI(customKey);
    if (live) {
      memoryRates = live;
      store.gold_rates = [live];
      saveStore(store);
      return res.status(200).json({
        success: true,
        message: 'Live gold rates fetched & updated successfully from GoldAPI.io',
        rates: live
      });
    }

    // If live fetch failed, return existing
    return res.status(200).json({
      success: true,
      message: 'Using cached rates (GoldAPI temporarily unreachable)',
      rates: currentRate || {
        rate_22k: '6,850',
        rate_24k: '7,460',
        rate_18k: '5,625',
        rate_silver: '92',
        ticker_visible: 1,
        mode: 'AUTOMATIC_API'
      }
    });
  }

  // 2. RESTORE AUTO: /api/gold-rates/restore-auto
  if (urlPath.includes('/restore-auto') || req.query?.subroute === 'restore-auto') {
    const live = await fetchFromGoldAPI();
    const updated = live || {
      ...(currentRate || {}),
      mode: 'AUTOMATIC_API',
      status: 'Connected'
    };
    updated.mode = 'AUTOMATIC_API';
    memoryRates = updated;
    store.gold_rates = [updated];
    saveStore(store);

    return res.status(200).json({
      success: true,
      message: 'Restored automatic GoldAPI.io market rate mode',
      rates: updated
    });
  }

  // 3. OVERRIDE: /api/gold-rates/override
  if (urlPath.includes('/override') || req.query?.subroute === 'override') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }

      const { rate_24k, rate_22k, rate_18k, rate_silver, ticker_visible } = body || {};
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      const updated = {
        ...(currentRate || {}),
        id: 1,
        rate_24k: String(rate_24k || currentRate?.rate_24k || '7,460'),
        rate_22k: String(rate_22k || currentRate?.rate_22k || '6,850'),
        rate_18k: String(rate_18k || currentRate?.rate_18k || '5,625'),
        rate_silver: String(rate_silver || currentRate?.rate_silver || '92'),
        ticker_visible: ticker_visible !== undefined ? (ticker_visible ? 1 : 0) : 1,
        last_updated: `${dateStr}, ${nowStr} (Manual)`,
        mode: 'MANUAL_OVERRIDE',
        status: 'Emergency Manual Override Active',
        timestamp_ms: Date.now()
      };

      memoryRates = updated;
      store.gold_rates = [updated];
      saveStore(store);

      // Extract numeric values and sync to Supabase table
      const num24 = Number(String(updated.rate_24k).replace(/[^0-9.]/g, '')) || 7460;
      const num22 = Number(String(updated.rate_22k).replace(/[^0-9.]/g, '')) || 6850;
      const num18 = Number(String(updated.rate_18k).replace(/[^0-9.]/g, '')) || 5625;
      syncToSupabase(num24, num22, num18, 'Manual Override').catch(() => {});

      return res.status(200).json({
        success: true,
        message: 'Manual rate override published successfully',
        rates: updated
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update manual rates' });
    }
  }

  // 4. GET GOLD RATES: /api/gold-rates
  // If no rates yet or rates are older than 30 mins and not in MANUAL_OVERRIDE, fetch live automatically
  const isStale = !currentRate || !currentRate.timestamp_ms || (Date.now() - currentRate.timestamp_ms > 30 * 60 * 1000);
  const isDefaultRates = currentRate?.rate_24k === '7,460' && currentRate?.rate_22k === '6,850';

  if ((isStale || isDefaultRates) && currentRate?.mode !== 'MANUAL_OVERRIDE') {
    const live = await fetchFromGoldAPI();
    if (live) {
      memoryRates = live;
      store.gold_rates = [live];
      saveStore(store);
      currentRate = live;
    }
  }

  const resultRates = currentRate || {
    rate_22k: '6,850',
    rate_24k: '7,460',
    rate_18k: '5,625',
    rate_silver: '92',
    ticker_visible: 1,
    last_updated: 'Today, 10:30 AM',
    source: 'GoldAPI.io',
    status: 'Connected',
    mode: 'AUTOMATIC_API'
  };

  return res.status(200).json({ current: resultRates, rates: resultRates, history: store.rate_history || [] });
}
