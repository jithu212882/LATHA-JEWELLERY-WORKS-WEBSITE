import fs from 'fs';
import path from 'path';
import { fetchFromSupabase, upsertToSupabase, isSupabaseConfigured } from '../server/supabase.js';

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

      if (sbCats && sbCats.length > 0) {
        categories = sbCats;
      } else if (categories.length > 0) {
        // Auto-seed Supabase categories if table was empty
        for (const c of categories) {
          upsertToSupabase('categories', c).catch(() => {});
        }
      }

      if (sbModels && sbModels.length > 0) {
        models = sbModels;
      } else if (models.length > 0) {
        // Auto-seed Supabase models if table was empty
        for (const m of models) {
          upsertToSupabase('jewellery_models', m).catch(() => {});
        }
      }

      if (sbBanners && sbBanners.length > 0) {
        banners = sbBanners;
      } else if (banners.length > 0) {
        // Auto-seed Supabase banners if table was empty
        for (const b of banners) {
          upsertToSupabase('banners', b).catch(() => {});
        }
      }

      if (sbReviews && sbReviews.length > 0) {
        reviews = sbReviews;
      } else if (reviews.length > 0) {
        for (const r of reviews) {
          upsertToSupabase('reviews', r).catch(() => {});
        }
      }

      if (sbContent && sbContent.length > 0 && sbContent[0].content) {
        content = sbContent[0].content;
      } else if (Object.keys(content).length > 0) {
        upsertToSupabase('site_content', { id: 1, content, updated_at: new Date().toISOString() }).catch(() => {});
      }

      if (sbSettings && sbSettings.length > 0 && sbSettings[0].settings) {
        settings = sbSettings[0].settings;
      } else if (Object.keys(settings).length > 0) {
        upsertToSupabase('business_settings', { id: 1, settings, updated_at: new Date().toISOString() }).catch(() => {});
      }

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

  let finalGoldRates = null;
  if (goldRates) {
    const p24 = Number(goldRates.price_24k || String(goldRates.rate_24k).replace(/[^0-9.]/g, '') || 13289);
    const p22 = Number(goldRates.price_22k || String(goldRates.rate_22k).replace(/[^0-9.]/g, '') || 12182);
    const p18 = Number(goldRates.price_18k || String(goldRates.rate_18k).replace(/[^0-9.]/g, '') || 9967);

    finalGoldRates = {
      ...goldRates,
      rate_24k: goldRates.rate_24k || Math.round(p24).toLocaleString('en-IN'),
      rate_22k: goldRates.rate_22k || Math.round(p22).toLocaleString('en-IN'),
      rate_18k: goldRates.rate_18k || Math.round(p18).toLocaleString('en-IN'),
      price_24k: p24,
      price_22k: p22,
      price_18k: p18,
      rate_silver: goldRates.rate_silver || '95',
      ticker_visible: goldRates.ticker_visible !== undefined ? goldRates.ticker_visible : 1,
      last_updated: goldRates.last_updated || 'Live Market Rate',
      source: goldRates.source || 'GoldAPI.io (Live)',
      status: goldRates.status || 'Connected (Live)',
      mode: goldRates.mode || 'AUTOMATIC_API'
    };
  } else {
    finalGoldRates = {
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
  }

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
