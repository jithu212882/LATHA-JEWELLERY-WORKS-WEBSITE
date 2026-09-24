import fs from 'fs';
import path from 'path';

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
  return { categories: [], jewellery_models: [], banners: [], site_content: {}, business_settings: {} };
}

function saveStore(store) {
  memoryStore = store;
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
  try {
    fs.writeFileSync('/tmp/store.json', JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const matchedPath = req.headers['x-matched-path'] || '';
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const fullCheck = `${urlPath} ${matchedPath} ${JSON.stringify(req.query || {})}`;
  const store = getStore();

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  // Extract ID from pathname or query
  let parsedId = NaN;
  const segments = (matchedPath || urlPath).split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const n = parseInt(segments[i]);
    if (!isNaN(n)) {
      parsedId = n;
      break;
    }
  }
  const pathParam = Array.isArray(req.query?.path) ? req.query.path.join('/') : (req.query?.path || '');
  let queryId = NaN;
  if (pathParam) {
    const parts = pathParam.split('/');
    for (const p of parts) {
      const n = parseInt(p);
      if (!isNaN(n)) {
        queryId = n;
        break;
      }
    }
  }
  const targetId = !isNaN(parsedId) ? parsedId : (!isNaN(queryId) ? queryId : (req.query?.id ? parseInt(req.query.id) : null));

  // ==========================================
  // 1. CATEGORIES CRUD (/api/categories)
  // ==========================================
  if (fullCheck.includes('categories')) {
    if (!Array.isArray(store.categories)) store.categories = [];

    if (req.method === 'GET') {
      if (targetId) {
        const cat = store.categories.find(c => c.id === targetId);
        if (!cat) return res.status(404).json({ error: 'Category not found' });
        return res.status(200).json(cat);
      }
      return res.status(200).json(store.categories);
    }

    if (req.method === 'POST') {
      const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => Number(c.id) || 0)) + 1 : 1;
      const newCategory = {
        id: newId,
        name: body.name || '',
        slug: body.slug || (body.name ? body.name.toLowerCase().replace(/\s+/g, '-') : `cat-${newId}`),
        description: body.description || '',
        image_url: body.image_url || '',
        display_order: body.display_order !== undefined ? Number(body.display_order) : store.categories.length + 1,
        active: body.active !== undefined ? (body.active ? 1 : 0) : 1
      };
      store.categories.push(newCategory);
      saveStore(store);
      return res.status(201).json(newCategory);
    }

    if (req.method === 'PUT') {
      const index = store.categories.findIndex(c => c.id === targetId);
      if (index === -1) return res.status(404).json({ error: 'Category not found' });
      const updated = {
        ...store.categories[index],
        ...body,
        id: targetId,
        active: body.active !== undefined ? (body.active ? 1 : 0) : store.categories[index].active
      };
      store.categories[index] = updated;
      saveStore(store);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (targetId) {
        store.categories = store.categories.filter(c => c.id !== targetId);
        saveStore(store);
      }
      return res.status(200).json({ success: true, message: 'Category deleted' });
    }
  }

  // ==========================================
  // 2. JEWELLERY MODELS CRUD (/api/jewellery)
  // ==========================================
  if (fullCheck.includes('jewellery')) {
    if (!Array.isArray(store.jewellery_models)) store.jewellery_models = [];

    if (req.method === 'GET') {
      if (targetId) {
        const item = store.jewellery_models.find(m => m.id === targetId);
        if (!item) return res.status(404).json({ error: 'Jewellery model not found' });
        return res.status(200).json(item);
      }
      return res.status(200).json(store.jewellery_models);
    }

    if (req.method === 'POST') {
      const newId = store.jewellery_models.length > 0 ? Math.max(...store.jewellery_models.map(m => Number(m.id) || 0)) + 1 : 1;
      const newModel = {
        id: newId,
        name: body.name || '',
        category_slug: body.category_slug || 'chain',
        description: body.description || '',
        min_weight: body.min_weight || '',
        primary_image: body.primary_image || '',
        additional_images: Array.isArray(body.additional_images) ? body.additional_images : [],
        featured: body.featured !== undefined ? (body.featured ? 1 : 0) : 0,
        active: body.active !== undefined ? (body.active ? 1 : 0) : 1,
        display_order: body.display_order !== undefined ? Number(body.display_order) : store.jewellery_models.length + 1,
        created_at: new Date().toISOString()
      };
      store.jewellery_models.push(newModel);
      saveStore(store);
      return res.status(201).json(newModel);
    }

    if (req.method === 'PUT') {
      const index = store.jewellery_models.findIndex(m => m.id === targetId);
      if (index === -1) return res.status(404).json({ error: 'Jewellery model not found' });
      const current = store.jewellery_models[index];
      const updated = {
        ...current,
        ...body,
        id: targetId,
        primary_image: body.primary_image !== undefined ? body.primary_image : current.primary_image,
        additional_images: Array.isArray(body.additional_images) ? body.additional_images : current.additional_images,
        featured: body.featured !== undefined ? (body.featured ? 1 : 0) : current.featured,
        active: body.active !== undefined ? (body.active ? 1 : 0) : current.active
      };
      store.jewellery_models[index] = updated;
      saveStore(store);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (targetId) {
        store.jewellery_models = store.jewellery_models.filter(m => m.id !== targetId);
        saveStore(store);
      }
      return res.status(200).json({ success: true, message: 'Jewellery model deleted' });
    }
  }

  // ==========================================
  // 3. BANNERS CRUD (/api/banners)
  // ==========================================
  if (fullCheck.includes('banners')) {
    if (!Array.isArray(store.banners)) store.banners = [];

    if (req.method === 'GET') {
      if (targetId) {
        const banner = store.banners.find(b => Number(b.id) === Number(targetId));
        if (!banner) return res.status(404).json({ error: 'Banner not found' });
        return res.status(200).json(banner);
      }
      return res.status(200).json(store.banners);
    }

    if (req.method === 'POST') {
      const newId = store.banners.length > 0 ? Math.max(...store.banners.map(b => Number(b.id) || 0)) + 1 : 1;
      const newBanner = {
        id: newId,
        title: body.title || '',
        subtitle: body.subtitle || '',
        desktop_image: body.desktop_image || '',
        mobile_image: body.mobile_image || '',
        cta_label: body.cta_label || '',
        cta_link: body.cta_link || '',
        active: body.active !== undefined ? (body.active ? 1 : 0) : 1,
        display_order: body.display_order !== undefined ? Number(body.display_order) : store.banners.length + 1
      };
      store.banners.push(newBanner);
      saveStore(store);
      return res.status(201).json(newBanner);
    }

    if (req.method === 'PUT') {
      const idToMatch = Number(targetId || body.id || 1);
      let index = store.banners.findIndex(b => Number(b.id) === idToMatch);
      if (index === -1) {
        if (store.banners.length > 0) {
          index = 0;
        } else {
          const created = { id: 1, ...body, active: body.active !== undefined ? (body.active ? 1 : 0) : 1 };
          store.banners.push(created);
          saveStore(store);
          return res.status(200).json(created);
        }
      }
      const updated = {
        ...store.banners[index],
        ...body,
        id: store.banners[index].id,
        active: body.active !== undefined ? (body.active ? 1 : 0) : store.banners[index].active
      };
      store.banners[index] = updated;
      saveStore(store);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (targetId) {
        store.banners = store.banners.filter(b => b.id !== targetId);
        saveStore(store);
      }
      return res.status(200).json({ success: true, message: 'Banner deleted' });
    }
  }

  // ==========================================
  // 4. SITE CONTENT (/api/content)
  // ==========================================
  if (fullCheck.includes('content')) {
    if (!store.site_content) store.site_content = {};
    if (req.method === 'GET') {
      return res.status(200).json(store.site_content);
    }
    if (req.method === 'PUT') {
      store.site_content = { ...store.site_content, ...body };
      saveStore(store);
      return res.status(200).json(store.site_content);
    }
  }

  // ==========================================
  // 5. BUSINESS SETTINGS (/api/settings)
  // ==========================================
  if (fullCheck.includes('settings')) {
    if (!store.business_settings) store.business_settings = {};
    if (req.method === 'GET') {
      return res.status(200).json(store.business_settings);
    }
    if (req.method === 'PUT') {
      store.business_settings = { ...store.business_settings, ...body };
      saveStore(store);
      return res.status(200).json(store.business_settings);
    }
  }

  return res.status(404).json({ error: 'Store resource not found' });
}
