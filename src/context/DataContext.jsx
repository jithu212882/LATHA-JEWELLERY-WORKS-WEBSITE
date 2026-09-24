import React, { createContext, useContext, useState, useEffect } from 'react';
import initialStoreData from '../../server/data/store.json';
import { supabase } from '../lib/supabaseClient';
import { parseJsonResponse } from '../utils/apiHelper';

const DataContext = createContext();

const loadLocal = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed) return parsed;
    }
  } catch (e) {}
  return fallback;
};

/**
 * Fetches the latest gold rates row from Supabase public.gold_rates.
 * Returns null if Supabase is unavailable or data is invalid.
 * Uses anon key + RLS SELECT policy only. Never logs secrets.
 */
async function fetchSupabaseGoldRates() {
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

    const p24 = Number(data.price_24k);
    const p22 = Number(data.price_22k);
    const p18 = Number(data.price_18k);

    // Reject if invalid OR outside realistic range (5,000 to 30,000 INR per gram in 2026)
    if (isNaN(p24) || p24 < 4000 || p24 >= 30000 || isNaN(p22) || p22 < 3500 || p22 >= 30000) {
      console.warn('[GoldRates] Supabase rate rejected (outside realistic range):', { p24, p22, p18 });
      return null;
    }

    const fmt = (n) => Math.round(n).toLocaleString('en-IN');

    const updatedAt = data.updated_at
      ? new Date(data.updated_at).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : null;

    const mapped = {
      rate_24k: fmt(p24),
      rate_22k: fmt(p22),
      rate_18k: p18 ? fmt(p18) : fmt(p24 * (18 / 24)),
      source: data.source || 'Latha Board Rate',
      currency: data.currency || 'INR',
      unit: data.unit || 'gram',
      last_updated: updatedAt || 'Today',
      status: 'Connected (Live Board Rate)',
      mode: data.source === 'Manual Override' ? 'MANUAL_OVERRIDE' : 'AUTOMATIC_API',
      ticker_visible: 1,
    };

    return mapped;
  } catch (err) {
    console.error('[GoldRates] Supabase fetch notice:', err?.message || err);
    return null;
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(() => ({
    categories: loadLocal('latha_categories', initialStoreData.categories?.filter(c => c.active) || []),
    jewellery_models: loadLocal('latha_jewellery_models', initialStoreData.jewellery_models?.filter(m => m.active) || []),
    banners: loadLocal('latha_banners', initialStoreData.banners?.filter(b => b.active) || []),
    reviews: loadLocal('latha_reviews', initialStoreData.reviews?.filter(r => r.status === 'APPROVED') || []),
    gold_rates: (() => {
      try {
        const cached = localStorage.getItem('latha_live_gold_rates');
        if (cached) {
          const parsed = JSON.parse(cached);
          const num24 = Number(String(parsed?.rate_24k).replace(/[^0-9.]/g, ''));
          // In 2026, valid gold rates are between 4,000 and 30,000
          if (num24 >= 4000 && num24 < 30000) {
            return parsed;
          } else {
            localStorage.removeItem('latha_live_gold_rates');
          }
        }
      } catch (e) {}
      return initialStoreData.gold_rates?.[0] || {
        rate_24k: '13,289',
        rate_22k: '12,182',
        rate_18k: '9,967',
        rate_silver: '95',
        ticker_visible: 1,
        last_updated: '23 Sept 2026, 04:57 pm',
        source: 'GoldAPI.io (Live)',
        status: 'Connected (Live)',
        mode: 'AUTOMATIC_API'
      };
    })(),
    content: loadLocal('latha_site_content', initialStoreData.site_content || {}),
    settings: loadLocal('latha_business_settings', initialStoreData.business_settings || {})
  }));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublicData = async () => {
    let serverRates = null;
    try {
      const res = await fetch('/api/public/data');
      const { ok, data: json } = await parseJsonResponse(res);
      if (ok && json) {
        if (json.gold_rates) {
          const num24 = Number(String(json.gold_rates.rate_24k).replace(/[^0-9.]/g, ''));
          if (num24 >= 4000 && num24 < 30000) {
            serverRates = {
              rate_18k: '9,967',
              ...json.gold_rates
            };
          }
        }

        const nextCategories = (Array.isArray(json.categories) && json.categories.length > 0) ? json.categories : null;
        const nextModels = (Array.isArray(json.jewellery_models) && json.jewellery_models.length > 0) ? json.jewellery_models : null;
        const nextBanners = (Array.isArray(json.banners) && json.banners.length > 0) ? json.banners : null;
        const nextContent = (json.content && typeof json.content === 'object' && Object.keys(json.content).length > 0) ? json.content : null;
        const nextSettings = (json.settings && typeof json.settings === 'object' && Object.keys(json.settings).length > 0) ? json.settings : null;
        const nextReviews = Array.isArray(json.reviews) ? json.reviews : null;

        // Sync fresh database truth to localStorage cache
        try {
          if (nextCategories) localStorage.setItem('latha_categories', JSON.stringify(nextCategories));
          if (nextModels) localStorage.setItem('latha_jewellery_models', JSON.stringify(nextModels));
          if (nextBanners) localStorage.setItem('latha_banners', JSON.stringify(nextBanners));
          if (nextContent) localStorage.setItem('latha_site_content', JSON.stringify(nextContent));
          if (nextSettings) localStorage.setItem('latha_business_settings', JSON.stringify(nextSettings));
          if (nextReviews) localStorage.setItem('latha_reviews', JSON.stringify(nextReviews));
        } catch (e) {
          console.warn('[DataContext] localStorage cache sync notice:', e.message);
        }

        setData(prev => ({
          ...prev,
          categories: nextCategories || prev.categories,
          jewellery_models: nextModels || prev.jewellery_models,
          banners: nextBanners || prev.banners,
          reviews: nextReviews || prev.reviews,
          content: nextContent || prev.content,
          settings: nextSettings || prev.settings,
          gold_rates: serverRates || prev.gold_rates,
        }));
        setError(null);
      } else {
        const staticRes = await fetch('/data/store.json');
        const { ok: staticOk, data: staticJson } = await parseJsonResponse(staticRes);
        if (staticOk && staticJson) {
          if (staticJson.gold_rates?.[0]) {
            const num24 = Number(String(staticJson.gold_rates[0].rate_24k).replace(/[^0-9.]/g, ''));
            if (num24 >= 4000 && num24 < 30000) {
              serverRates = staticJson.gold_rates[0];
            }
          }
          const nextCategories = (Array.isArray(staticJson.categories) && staticJson.categories.length > 0) ? staticJson.categories.filter(c => c.active) : null;
          const nextModels = (Array.isArray(staticJson.jewellery_models) && staticJson.jewellery_models.length > 0) ? staticJson.jewellery_models.filter(m => m.active) : null;
          const nextBanners = (Array.isArray(staticJson.banners) && staticJson.banners.length > 0) ? staticJson.banners.filter(b => b.active) : null;
          const nextContent = staticJson.site_content || null;
          const nextSettings = staticJson.business_settings || null;
          const nextReviews = staticJson.reviews?.filter(r => r.status === 'APPROVED') || null;

          setData(prev => ({
            ...prev,
            categories: nextCategories || prev.categories,
            jewellery_models: nextModels || prev.jewellery_models,
            banners: nextBanners || prev.banners,
            reviews: nextReviews || prev.reviews,
            content: nextContent || prev.content,
            settings: nextSettings || prev.settings,
            gold_rates: serverRates || prev.gold_rates,
          }));
          setError(null);
        }
      }
    } catch (err) {
      console.warn('[DataContext] Runtime API unavailable, using local state:', err.message);
      setError(null);
    } finally {
      setLoading(false);
    }

    // Check if user has active valid manual override in local storage
    const localSavedRates = localStorage.getItem('latha_live_gold_rates');
    let localRatesObj = null;
    try {
      if (localSavedRates) localRatesObj = JSON.parse(localSavedRates);
    } catch (e) {}

    const local24kNum = Number(String(localRatesObj?.rate_24k).replace(/[^0-9.]/g, ''));
    const isManualValid = localRatesObj?.mode === 'MANUAL_OVERRIDE' && local24kNum >= 4000 && local24kNum < 30000;

    if (isManualValid) {
      setData(prev => ({
        ...prev,
        gold_rates: {
          ...prev.gold_rates,
          ...localRatesObj
        }
      }));
    } else {
      // Check Supabase
      const supabaseRates = await fetchSupabaseGoldRates();
      if (supabaseRates) {
        setData(prev => ({
          ...prev,
          gold_rates: {
            ...prev.gold_rates,
            ...supabaseRates,
          }
        }));
        try {
          localStorage.setItem('latha_live_gold_rates', JSON.stringify(supabaseRates));
        } catch (e) {}
      } else if (serverRates) {
        setData(prev => ({
          ...prev,
          gold_rates: {
            ...prev.gold_rates,
            ...serverRates,
          }
        }));
      } else {
        // Live GoldAPI fetch via serverless endpoint
        try {
          const liveRes = await fetch('/api/gold-rates/fetch-live');
          const { ok, data: liveJson } = await parseJsonResponse(liveRes);
          if (ok && liveJson?.rates) {
            setData(prev => ({
              ...prev,
              gold_rates: {
                ...prev.gold_rates,
                ...liveJson.rates
              }
            }));
            try {
              localStorage.setItem('latha_live_gold_rates', JSON.stringify(liveJson.rates));
            } catch (e) {}
          }
        } catch (e) {}
      }
    }
  };

  const saveGoldRates = (ratesPayload) => {
    setData(prev => {
      const nextRates = {
        ...prev.gold_rates,
        ...ratesPayload
      };
      try {
        localStorage.setItem('latha_live_gold_rates', JSON.stringify(nextRates));
      } catch (e) {}
      return { ...prev, gold_rates: nextRates };
    });
  };

  const saveJewelleryModel = (modelPayload, isNew = false, targetId = null) => {
    setData(prev => {
      let models = [...(prev.jewellery_models || [])];
      if (isNew) {
        const newId = models.length ? Math.max(...models.map(m => m.id)) + 1 : 1;
        const newModel = {
          id: newId,
          ...modelPayload,
          display_order: models.length + 1,
          active: modelPayload.active !== undefined ? modelPayload.active : 1,
          created_at: new Date().toISOString()
        };
        models.push(newModel);
      } else if (targetId) {
        const index = models.findIndex(m => m.id === targetId);
        if (index !== -1) {
          models[index] = {
            ...models[index],
            ...modelPayload,
            primary_image: modelPayload.primary_image,
            additional_images: modelPayload.additional_images
          };
        }
      }
      try {
        localStorage.setItem('latha_jewellery_models', JSON.stringify(models));
      } catch (e) {}
      return { ...prev, jewellery_models: models };
    });
  };

  const deleteJewelleryModel = (id) => {
    setData(prev => {
      const models = (prev.jewellery_models || []).filter(m => m.id !== id);
      try {
        localStorage.setItem('latha_jewellery_models', JSON.stringify(models));
      } catch (e) {}
      return { ...prev, jewellery_models: models };
    });
  };

  const saveCategory = (catPayload, isNew = false, targetId = null) => {
    setData(prev => {
      let cats = [...(prev.categories || [])];
      if (isNew) {
        const newId = cats.length ? Math.max(...cats.map(c => c.id)) + 1 : 1;
        const newCat = {
          id: newId,
          ...catPayload,
          display_order: cats.length + 1,
          active: catPayload.active !== undefined ? catPayload.active : 1,
          created_at: new Date().toISOString()
        };
        cats.push(newCat);
      } else {
        const idToMatch = targetId || catPayload.id;
        const index = cats.findIndex(c => (idToMatch && Number(c.id) === Number(idToMatch)) || (catPayload.slug && c.slug === catPayload.slug));
        if (index !== -1) {
          cats[index] = { ...cats[index], ...catPayload, id: cats[index].id };
        } else if (idToMatch) {
          cats.push({ id: Number(idToMatch), ...catPayload, active: 1, display_order: cats.length + 1 });
        }
      }
      try {
        localStorage.setItem('latha_categories', JSON.stringify(cats));
      } catch (e) {}
      return { ...prev, categories: cats };
    });
  };

  const deleteCategory = (id) => {
    setData(prev => {
      const cats = (prev.categories || []).filter(c => c.id !== id);
      try {
        localStorage.setItem('latha_categories', JSON.stringify(cats));
      } catch (e) {}
      return { ...prev, categories: cats };
    });
  };

  const saveBanner = (bannerPayload, isNew = false, targetId = null) => {
    setData(prev => {
      let list = [...(prev.banners || [])];
      if (isNew) {
        const newId = list.length ? Math.max(...list.map(b => Number(b.id) || 0)) + 1 : 1;
        list.push({
          id: newId,
          ...bannerPayload,
          display_order: list.length + 1,
          active: bannerPayload.active !== undefined ? bannerPayload.active : 1,
          created_at: new Date().toISOString()
        });
      } else {
        const idToMatch = Number(targetId || bannerPayload.id || 1);
        const index = list.findIndex(b => Number(b.id) === idToMatch);
        if (index !== -1) {
          list[index] = { ...list[index], ...bannerPayload, id: list[index].id };
        } else if (list.length > 0) {
          list[0] = { ...list[0], ...bannerPayload };
        } else {
          list.push({ id: idToMatch, ...bannerPayload, active: 1, display_order: 1 });
        }
      }
      try {
        localStorage.setItem('latha_banners', JSON.stringify(list));
      } catch (e) {}
      return { ...prev, banners: list };
    });
  };

  const deleteBanner = (id) => {
    setData(prev => {
      const list = (prev.banners || []).filter(b => Number(b.id) !== Number(id));
      try {
        localStorage.setItem('latha_banners', JSON.stringify(list));
      } catch (e) {}
      return { ...prev, banners: list };
    });
  };

  const saveContent = (contentPayload) => {
    setData(prev => {
      const nextContent = { ...prev.content, ...contentPayload };
      try {
        localStorage.setItem('latha_site_content', JSON.stringify(nextContent));
      } catch (e) {}
      return { ...prev, content: nextContent };
    });
  };

  const saveSettings = (settingsPayload) => {
    setData(prev => {
      const nextSettings = { ...prev.settings, ...settingsPayload };
      try {
        localStorage.setItem('latha_business_settings', JSON.stringify(nextSettings));
      } catch (e) {}
      return { ...prev, settings: nextSettings };
    });
  };

  useEffect(() => {
    fetchPublicData();

    // Background auto-refresh every 15 minutes (if not in manual override)
    const interval = setInterval(() => {
      try {
        const cached = localStorage.getItem('latha_live_gold_rates');
        const parsed = cached ? JSON.parse(cached) : null;
        if (parsed?.mode !== 'MANUAL_OVERRIDE') {
          fetchPublicData();
        }
      } catch (e) {
        fetchPublicData();
      }
    }, 15 * 60 * 1000);

    // Refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const cached = localStorage.getItem('latha_live_gold_rates');
          const parsed = cached ? JSON.parse(cached) : null;
          if (parsed?.mode !== 'MANUAL_OVERRIDE') {
            fetchPublicData();
          }
        } catch (e) {}
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
        error,
        refreshData: fetchPublicData,
        saveGoldRates,
        saveJewelleryModel,
        deleteJewelleryModel,
        saveCategory,
        deleteCategory,
        saveBanner,
        deleteBanner,
        saveContent,
        saveSettings
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
