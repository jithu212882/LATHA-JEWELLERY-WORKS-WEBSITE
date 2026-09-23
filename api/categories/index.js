import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { categories: [] };
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
  if (!Array.isArray(store.categories)) store.categories = [];

  if (req.method === 'GET') {
    return res.status(200).json(store.categories);
  }

  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

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

  return res.status(405).json({ error: 'Method Not Allowed' });
}
