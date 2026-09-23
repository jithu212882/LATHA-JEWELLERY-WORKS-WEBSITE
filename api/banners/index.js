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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const store = getStore();
  if (!Array.isArray(store.banners)) store.banners = [];

  if (req.method === 'GET') {
    return res.status(200).json(store.banners);
  }

  if (req.method === 'POST') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

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

  return res.status(405).json({ error: 'Method Not Allowed' });
}
