import React, { createContext, useContext, useState, useEffect } from 'react';
import initialStoreData from '../../server/data/store.json';
import { supabase } from '../lib/supabaseClient';

const DataContext = createContext();

/**
 * Fetches the latest gold rates row from Supabase public.gold_rates.
 * Returns null if Supabase is unavailable or data is invalid.
 * Uses anon key + RLS SELECT policy only. Never logs secrets.
 *
 * DIAGNOSTICS: Logs are intentionally verbose to help identify connection issues.
 * They can be removed once confirmed working in production.
 */
async function fetchSupabaseGoldRates() {
  // --- DIAGNOSTIC: env var presence (values are NEVER logged) ---
  const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('[GoldRates] VITE_SUPABASE_URL present:', hasUrl);
  console.log('[GoldRates] VITE_SUPABASE_ANON_KEY present:', hasKey);

  if (!supabase) {
    console.warn('[GoldRates] Supabase client is null — VITE env vars missing. Using fallback.');
    return null;
  }

  try {
    console.log('[GoldRates] Querying Supabase public.gold_rates...');

    const { data, error } = await supabase
      .from('gold_rates')
      .select('price_24k, price_22k, price_18k, updated_at, source, currency, unit')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    // --- DIAGNOSTIC: Always log error details if present ---
    if (error) {
      console.error('[GoldRates] Supabase query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    if (!data) {
      console.warn('[GoldRates] Supabase returned no data row.');
      return null;
    }

    console.log('[GoldRates] Row received. Fields present:', {
      has_price_24k: data.price_24k != null,
      has_price_22k: data.price_22k != null,
      has_price_18k: data.price_18k != null,
      has_updated_at: data.updated_at != null,
    });

    const p24 = Number(data.price_24k);
    const p22 = Number(data.price_22k);
    const p18 = Number(data.price_18k);

    if (isNaN(p24) || p24 <= 0 || isNaN(p22) || p22 <= 0 || isNaN(p18) || p18 <= 0) {
      console.error('[GoldRates] Invalid numeric values after Number() conversion:', {
        p24_valid: !isNaN(p24) && p24 > 0,
        p22_valid: !isNaN(p22) && p22 > 0,
        p18_valid: !isNaN(p18) && p18 > 0,
      });
      return null;
    }

    // Format to 2 decimal places with Indian locale (e.g. "13,369.65")
    const fmt = (n) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const updatedAt = data.updated_at
      ? new Date(data.updated_at).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : null;

    const mapped = {
      rate_24k: fmt(p24),
      rate_22k: fmt(p22),
      rate_18k: fmt(p18),
      source: data.source || 'GoldAPI',
      currency: data.currency || 'INR',
      unit: data.unit || 'gram',
      last_updated: updatedAt || 'Today',
      status: 'Connected (Supabase)',
      mode: 'AUTOMATIC_API',
      ticker_visible: 1,
    };

    console.log('[GoldRates] Supabase rates mapped successfully:', {
      rate_24k: mapped.rate_24k,
      rate_22k: mapped.rate_22k,
      rate_18k: mapped.rate_18k,
      last_updated: mapped.last_updated,
    });

    return mapped;

  } catch (err) {
    // Non-silent: log full error details for debugging
    console.error('[GoldRates] Unexpected Supabase fetch error:', err?.message || err);
    return null;
  }
}

export function DataProvider({ children }) {
  // Initial state: do NOT prioritise localStorage over Supabase.
  // localStorage is only used as the instant visual placeholder before
  // the async Supabase fetch resolves. Supabase always wins when available.
  const [data, setData] = useState(() => ({
    categories: initialStoreData.categories?.filter(c => c.active) || [],
    jewellery_models: initialStoreData.jewellery_models?.filter(m => m.active) || [],
    banners: initialStoreData.banners?.filter(b => b.active) || [],
    reviews: initialStoreData.reviews?.filter(r => r.status === 'APPROVED') || [],
    gold_rates: (() => {
      // Use localStorage only as a quick visual placeholder — will be
      // overwritten by Supabase once it resolves (see fetchPublicData below).
      try {
        const cached = localStorage.getItem('latha_live_gold_rates');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.rate_24k) return parsed;
        }
      } catch (e) {}
      return initialStoreData.gold_rates?.[0] || {
        rate_22k: '6,850',
        rate_24k: '7,460',
        rate_18k: '5,625',
        rate_silver: '92',
        ticker_visible: 1,
        last_updated: 'Today, 10:30 AM'
      };
    })(),
    content: initialStoreData.site_content || {},
    settings: initialStoreData.business_settings || {}
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublicData = async () => {
    // ── Step 1: Load categories/banners/reviews/settings from server/static ──
    try {
      const res = await fetch('/api/public/data');
      if (res.ok) {
        const json = await res.json();
        // Merge server data but do NOT let server's old gold_rates
        // permanently override — Supabase fetch below will fix gold_rates.
        setData(prev => ({
          ...prev,
          categories: json.categories || prev.categories,
          jewellery_models: json.jewellery_models || prev.jewellery_models,
          banners: json.banners || prev.banners,
          reviews: json.reviews || prev.reviews,
          content: json.content || prev.content,
          settings: json.settings || prev.settings,
          // Preserve current gold_rates (Supabase will overwrite below)
          gold_rates: prev.gold_rates,
        }));
        setError(null);
      } else {
        const staticRes = await fetch('/data/store.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          setData(prev => ({
            ...prev,
            categories: staticJson.categories?.filter(c => c.active) || prev.categories,
            jewellery_models: staticJson.jewellery_models?.filter(m => m.active) || prev.jewellery_models,
            banners: staticJson.banners?.filter(b => b.active) || prev.banners,
            reviews: staticJson.reviews?.filter(r => r.status === 'APPROVED') || prev.reviews,
            content: staticJson.site_content || prev.content,
            settings: staticJson.business_settings || prev.settings,
            // Preserve current gold_rates (Supabase will overwrite below)
            gold_rates: prev.gold_rates,
          }));
          setError(null);
        }
      }
    } catch (err) {
      console.warn('[DataContext] Runtime API unavailable, using static fallback:', err.message);
      setError(null);
    } finally {
      setLoading(false);
    }

    // ── Step 2: Fetch live gold rates from Supabase — PRIMARY source ──
    // Runs independently. Silver is preserved from prev.gold_rates (not in Supabase).
    // Supabase rates always override localStorage/server/static fallback when valid.
    const supabaseRates = await fetchSupabaseGoldRates();
    if (supabaseRates) {
      setData(prev => ({
        ...prev,
        gold_rates: {
          // Preserve silver + any fields not in Supabase (e.g. rate_silver, ticker_visible)
          ...prev.gold_rates,
          // Supabase live rates take full priority for 24K / 22K / 18K
          ...supabaseRates,
        }
      }));
      console.log('[GoldRates] Live Supabase rates applied to context.');
    } else {
      console.warn('[GoldRates] Supabase unavailable — displaying fallback gold rates.');
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <DataContext.Provider value={{ ...data, loading, error, refreshData: fetchPublicData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
