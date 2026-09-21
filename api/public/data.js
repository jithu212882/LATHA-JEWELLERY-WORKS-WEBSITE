import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return {};
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const store = getStore();

  const activeCategories = (store.categories || [])
    .filter(c => c.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeModels = (store.jewellery_models || [])
    .filter(m => m.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeBanners = (store.banners || [])
    .filter(b => b.active)
    .sort((a, b) => a.display_order - b.display_order);

  const approvedReviews = (store.reviews || [])
    .filter(r => r.status === 'APPROVED')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const goldRates = store.gold_rates?.[0] || {
    rate_22k: '6,850',
    rate_24k: '7,460',
    rate_18k: '5,625',
    rate_silver: '92',
    ticker_visible: 1,
    last_updated: 'Today, 10:30 AM'
  };

  res.status(200).json({
    categories: activeCategories,
    jewellery_models: activeModels,
    banners: activeBanners,
    reviews: approvedReviews,
    gold_rates: goldRates,
    content: store.site_content || {},
    settings: store.business_settings || {}
  });
}
