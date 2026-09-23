import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { jewellery_models: [] };
}

function saveStore(store) {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const store = getStore();
  if (!Array.isArray(store.jewellery_models)) store.jewellery_models = [];

  if (req.method === 'GET') {
    return res.status(200).json(store.jewellery_models);
  }

  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

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

  return res.status(405).json({ error: 'Method Not Allowed' });
}
