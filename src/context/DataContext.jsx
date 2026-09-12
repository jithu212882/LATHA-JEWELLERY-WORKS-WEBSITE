import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({
    categories: [],
    jewellery_models: [],
    banners: [],
    reviews: [],
    gold_rates: {
      rate_22k: '6,850',
      rate_24k: '7,460',
      rate_silver: '92',
      ticker_visible: 1,
      last_updated: 'Today, 10:30 AM'
    },
    content: {},
    settings: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/data');
      if (!res.ok) throw new Error('Failed to load public data');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error('Error fetching public data:', err);
      setError(err.message);
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
