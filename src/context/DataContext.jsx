import React, { createContext, useContext, useState, useEffect } from 'react';
import initialStoreData from '../../server/data/store.json';

const DataContext = createContext();

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

        // Automatic Live GoldAPI.io Sync (Morning/Evening)
        if (json.gold_rates?.mode !== 'MANUAL_OVERRIDE') {
          fetch('/api/gold-rates/fetch-live', { method: 'POST' })
            .then(r => r.json())
            .then(liveJson => {
              if (liveJson?.success && liveJson?.rates) {
                setData(prev => ({
                  ...prev,
                  gold_rates: liveJson.rates
                }));
              }
            })
            .catch(() => {});
        }
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
