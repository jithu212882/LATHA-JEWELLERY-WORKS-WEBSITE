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
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id: rawId } = req.query || {};
  const id = parseInt(rawId);
  const store = getStore();
  if (!Array.isArray(store.reviews)) store.reviews = [];

  const index = store.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    const { status, featured } = req.body || {};
    if (status) store.reviews[index].status = status;
    if (featured !== undefined) store.reviews[index].featured = featured ? 1 : 0;

    try {
      const storePath = path.join(process.cwd(), 'server/data/store.json');
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {}

    return res.status(200).json(store.reviews[index]);
  }

  return res.status(200).json({ success: true });
}
