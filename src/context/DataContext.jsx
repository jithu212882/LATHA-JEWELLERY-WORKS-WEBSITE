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

    if (isNaN(p24) || p24 <= 0 || isNaN(p22) || p22 <= 0 || isNaN(p18) || p18 <= 0) {
      return null;
    }

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

    return mapped;
  } catch (err) {
    console.error('[GoldRates] Unexpected Supabase fetch error:', err?.message || err);
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
    content: loadLocal('latha_site_content', initialStoreData.site_content || {}),
    settings: loadLocal('latha_business_settings', initialStoreData.business_settings || {})
  }));

  const [loading, setLoading] = useState(false);
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/data');
      const { ok, data: json } = await parseJsonResponse(res);
      if (ok && json) {
        setData(prev => {
          const localModels = localStorage.getItem('latha_jewellery_models');
          const localCats = localStorage.getItem('latha_categories');
          const localBanners = localStorage.getItem('latha_banners');
          const localContent = localStorage.getItem('latha_site_content');
          const localSettings = localStorage.getItem('latha_business_settings');

          return {
            ...prev,
            categories: localCats ? JSON.parse(localCats) : (json.categories || prev.categories),
            jewellery_models: localModels ? JSON.parse(localModels) : (json.jewellery_models || prev.jewellery_models),
            banners: localBanners ? JSON.parse(localBanners) : (json.banners || prev.banners),
            reviews: json.reviews || prev.reviews,
            content: localContent ? JSON.parse(localContent) : (json.content || prev.content),
            settings: localSettings ? JSON.parse(localSettings) : (json.settings || prev.settings),
            gold_rates: prev.gold_rates,
          };
        });
        setError(null);
      } else {
        const staticRes = await fetch('/data/store.json');
        const { ok: staticOk, data: staticJson } = await parseJsonResponse(staticRes);
        if (staticOk && staticJson) {
          setData(prev => {
            const localModels = localStorage.getItem('latha_jewellery_models');
            const localCats = localStorage.getItem('latha_categories');
            const localBanners = localStorage.getItem('latha_banners');
            const localContent = localStorage.getItem('latha_site_content');
            const localSettings = localStorage.getItem('latha_business_settings');

            return {
              ...prev,
              categories: localCats ? JSON.parse(localCats) : (staticJson.categories?.filter(c => c.active) || prev.categories),
              jewellery_models: localModels ? JSON.parse(localModels) : (staticJson.jewellery_models?.filter(m => m.active) || prev.jewellery_models),
              banners: localBanners ? JSON.parse(localBanners) : (staticJson.banners?.filter(b => b.active) || prev.banners),
              reviews: staticJson.reviews?.filter(r => r.status === 'APPROVED') || prev.reviews,
              content: localContent ? JSON.parse(localContent) : (staticJson.site_content || prev.content),
              settings: localSettings ? JSON.parse(localSettings) : (staticJson.business_settings || prev.settings),
              gold_rates: prev.gold_rates,
            };
          });
          setError(null);
        }
      }
    } catch (err) {
      console.warn('[DataContext] Runtime API unavailable, using local state:', err.message);
      setError(null);
    } finally {
      setLoading(false);
    }

    const supabaseRates = await fetchSupabaseGoldRates();
    if (supabaseRates) {
      setData(prev => ({
        ...prev,
        gold_rates: {
          ...prev.gold_rates,
          ...supabaseRates,
        }
      }));
    }
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
      } else if (targetId) {
        const index = cats.findIndex(c => c.id === targetId);
        if (index !== -1) {
          cats[index] = { ...cats[index], ...catPayload };
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
        const newId = list.length ? Math.max(...list.map(b => b.id)) + 1 : 1;
        list.push({ id: newId, ...bannerPayload, display_order: list.length + 1, created_at: new Date().toISOString() });
      } else if (targetId) {
        const index = list.findIndex(b => b.id === targetId);
        if (index !== -1) list[index] = { ...list[index], ...bannerPayload };
      }
      try {
        localStorage.setItem('latha_banners', JSON.stringify(list));
      } catch (e) {}
      return { ...prev, banners: list };
    });
  };

  const deleteBanner = (id) => {
    setData(prev => {
      const list = (prev.banners || []).filter(b => b.id !== id);
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
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
        error,
        refreshData: fetchPublicData,
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
