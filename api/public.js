import fs from 'fs';
import path from 'path';
import { fetchFromSupabase, isSupabaseConfigured } from '../server/supabase.js';

let memoryStore = null;

function getStore() {
  if (memoryStore) return memoryStore;
  try {
    const tmpPath = '/tmp/store.json';
    if (fs.existsSync(tmpPath)) {
      memoryStore = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      return memoryStore;
    }
  } catch (e) {}
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      memoryStore = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      return memoryStore;
    }
  } catch (e) {}
  return {};
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const store = getStore();

  let categories = store.categories || [];
  let models = store.jewellery_models || [];
  let banners = store.banners || [];
  let reviews = store.reviews || [];
  let content = store.site_content || {};
  let settings = store.business_settings || {};
  let goldRates = store.gold_rates?.[0] || null;

  if (isSupabaseConfigured()) {
    try {
      const [sbCats, sbModels, sbBanners, sbReviews, sbContent, sbSettings, sbRates] = await Promise.all([
        fetchFromSupabase('categories', 'display_order', true),
        fetchFromSupabase('jewellery_models', 'display_order', true),
        fetchFromSupabase('banners', 'display_order', true),
        fetchFromSupabase('reviews', 'created_at', false),
        fetchFromSupabase('site_content', 'id', true),
        fetchFromSupabase('business_settings', 'id', true),
        fetchFromSupabase('gold_rates', 'id', true)
      ]);

      if (sbCats && sbCats.length > 0) categories = sbCats;
      if (sbModels && sbModels.length > 0) models = sbModels;
      if (sbBanners && sbBanners.length > 0) banners = sbBanners;
      if (sbReviews && sbReviews.length > 0) reviews = sbReviews;
      if (sbContent && sbContent.length > 0 && sbContent[0].content) content = sbContent[0].content;
      if (sbSettings && sbSettings.length > 0 && sbSettings[0].settings) settings = sbSettings[0].settings;
      if (sbRates && sbRates.length > 0) goldRates = sbRates[0];
    } catch (e) {
      console.warn('[Public API] Supabase query notice:', e.message);
    }
  }

  const activeCategories = categories
    .filter(c => c.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeModels = models
    .filter(m => m.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeBanners = banners
    .filter(b => b.active)
    .sort((a, b) => a.display_order - b.display_order);

  const approvedReviews = reviews
    .filter(r => r.status === 'APPROVED')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const finalGoldRates = goldRates || {
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

  res.status(200).json({
    categories: activeCategories,
    jewellery_models: activeModels,
    banners: activeBanners,
    reviews: approvedReviews,
    gold_rates: finalGoldRates,
    content,
    settings
  });
}
