import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { reviews: [] };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id: rawId } = req.query || {};
  const id = parseInt(rawId);
  const store = getStore();
  if (!Array.isArray(store.reviews)) store.reviews = [];

  const index = store.reviews.findIndex(r => r.id === id);

  if (req.method === 'DELETE') {
    if (index !== -1) {
      store.reviews.splice(index, 1);
      try {
        const storePath = path.join(process.cwd(), 'server/data/store.json');
        fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
      } catch (e) {}
    }
    return res.status(200).json({ success: true, message: 'Review deleted' });
  }

  if (req.method === 'PUT') {
    if (index !== -1) {
      store.reviews[index] = {
        ...store.reviews[index],
        ...req.body,
        featured: req.body?.featured !== undefined ? (req.body.featured ? 1 : 0) : store.reviews[index].featured
      };
      try {
        const storePath = path.join(process.cwd(), 'server/data/store.json');
        fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
      } catch (e) {}
      return res.status(200).json(store.reviews[index]);
    }
    return res.status(200).json({ success: true, message: 'Review updated' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
