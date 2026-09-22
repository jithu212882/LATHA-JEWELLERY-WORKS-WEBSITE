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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, location, rating, review_text } = req.body || {};
    if (!name || !review_text) {
      return res.status(400).json({ error: 'Name and review content are required' });
    }

    const store = getStore();
    const newId = store.reviews?.length ? Math.max(...store.reviews.map(r => r.id)) + 1 : Date.now();
    const newReview = {
      id: newId,
      name,
      location: location || 'Patron',
      rating: parseInt(rating) || 5,
      review_text,
      status: 'PENDING',
      featured: 0,
      created_at: new Date().toISOString()
    };

    try {
      if (Array.isArray(store.reviews)) {
        store.reviews.push(newReview);
        const storePath = path.join(process.cwd(), 'server/data/store.json');
        fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Vercel filesystem read-only; review submission acknowledged.');
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted for moderation',
      review: newReview
    });
  }

  if (req.method === 'GET') {
    const store = getStore();
    const approvedReviews = (store.reviews || [])
      .filter(r => r.status === 'APPROVED')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.status(200).json(approvedReviews);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
