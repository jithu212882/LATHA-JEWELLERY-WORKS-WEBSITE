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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id: rawId } = req.query || {};
  const id = parseInt(rawId);
  const store = getStore();
  if (!Array.isArray(store.categories)) store.categories = [];

  const index = store.categories.findIndex(c => c.id === id);

  if (req.method === 'GET') {
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    return res.status(200).json(store.categories[index]);
  }

  if (req.method === 'PUT') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedCategory = {
      ...store.categories[index],
      ...body,
      id: id,
      active: body.active !== undefined ? (body.active ? 1 : 0) : store.categories[index].active
    };

    store.categories[index] = updatedCategory;
    saveStore(store);

    return res.status(200).json(updatedCategory);
  }

  if (req.method === 'DELETE') {
    if (index !== -1) {
      store.categories.splice(index, 1);
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Category deleted' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
