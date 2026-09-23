import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { banners: [] };
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
  if (!Array.isArray(store.banners)) store.banners = [];

  const index = store.banners.findIndex(b => b.id === id);

  if (req.method === 'GET') {
    if (index === -1) {
      return res.status(404).json({ error: 'Banner not found' });
    }
    return res.status(200).json(store.banners[index]);
  }

  if (req.method === 'PUT') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (index === -1) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const updatedBanner = {
      ...store.banners[index],
      ...body,
      id: id,
      active: body.active !== undefined ? (body.active ? 1 : 0) : store.banners[index].active
    };

    store.banners[index] = updatedBanner;
    saveStore(store);

    return res.status(200).json(updatedBanner);
  }

  if (req.method === 'DELETE') {
    if (index !== -1) {
      store.banners.splice(index, 1);
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Banner deleted' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
