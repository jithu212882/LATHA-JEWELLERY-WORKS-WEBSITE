import React, { createContext, useContext, useState, useEffect } from 'react';
import initialStoreData from '../../server/data/store.json';
import { supabase } from '../lib/supabaseClient';

const DataContext = createContext();

/**
 * Fetches the latest gold rates row from Supabase public.gold_rates.
 * Returns null if Supabase is unavailable or data is invalid.
 * Never exposes secrets — uses anon key + RLS SELECT policy only.
 */
async function fetchSupabaseGoldRates() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('gold_rates')
      .select('price_24k, price_22k, price_18k, updated_at, source, currency, unit')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    const p24 = Number(data.price_24k);
    const p22 = Number(data.price_22k);
    const p18 = Number(data.price_18k);

    // Reject if any value is invalid
    if (isNaN(p24) || p24 <= 0 || isNaN(p22) || p22 <= 0 || isNaN(p18) || p18 <= 0) {
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

    return {
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
  } catch (err) {
    // Silently fail — website never crashes due to Supabase being unavailable
    console.warn('Supabase gold rate fetch failed, using fallback:', err.message);
    return null;
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => ({
    categories: initialStoreData.categories?.filter(c => c.active) || [],
    jewellery_models: initialStoreData.jewellery_models?.filter(m => m.active) || [],
    banners: initialStoreData.banners?.filter(b => b.active) || [],
    reviews: initialStoreData.reviews?.filter(r => r.status === 'APPROVED') || [],
    gold_rates: (() => {
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
    try {
      const res = await fetch('/api/public/data');
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setError(null);
      } else {
        const staticRes = await fetch('/data/store.json');
        if (staticRes.ok) {
          const staticJson = await staticRes.json();
          setData({
            categories: staticJson.categories?.filter(c => c.active) || [],
            jewellery_models: staticJson.jewellery_models?.filter(m => m.active) || [],
            banners: staticJson.banners?.filter(b => b.active) || [],
            reviews: staticJson.reviews?.filter(r => r.status === 'APPROVED') || [],
            gold_rates: staticJson.gold_rates?.[0] || initialStoreData.gold_rates?.[0],
            content: staticJson.site_content || initialStoreData.site_content,
            settings: staticJson.business_settings || initialStoreData.business_settings
          });
          setError(null);
        }
      }
    } catch (err) {
      console.warn('Runtime API unavailable, using production static fallback:', err);
      setError(null);
    } finally {
      setLoading(false);
    }

    // Fetch live gold rates from Supabase (primary live source)
    // This runs after the main data load and merges only the gold_rates portion.
    // Silver is preserved from the existing data source.
    const supabaseRates = await fetchSupabaseGoldRates();
    if (supabaseRates) {
      setData(prev => ({
        ...prev,
        gold_rates: {
          // Preserve silver and any other existing fields not in Supabase table
          ...prev.gold_rates,
          // Overlay with live Supabase values
          ...supabaseRates,
        }
      }));
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
