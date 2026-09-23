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
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const store = getStore();
  if (!Array.isArray(store.reviews)) store.reviews = [];

  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const segments = urlPath.split('/').filter(Boolean);
  const parsedId = parseInt(segments[segments.length - 1]);
  const targetId = !isNaN(parsedId) ? parsedId : (req.query?.id ? parseInt(req.query.id) : null);

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  // 1. ADMIN LIST: GET /api/reviews/admin
  if (urlPath.includes('/admin')) {
    return res.status(200).json(store.reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }

  // 2. PUBLIC SUBMISSION: POST /api/reviews
  if (req.method === 'POST') {
    const { name, location, rating, review_text } = body;
    if (!name || !review_text) {
      return res.status(400).json({ error: 'Name and review content are required' });
    }

    const newId = store.reviews.length ? Math.max(...store.reviews.map(r => r.id)) + 1 : Date.now();
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

    store.reviews.push(newReview);
    saveStore(store);

    return res.status(201).json({
      success: true,
      message: 'Review submitted for moderation',
      review: newReview
    });
  }

  // 3. EDIT / STATUS MODERATION: PUT /api/reviews/:id or /api/reviews/:id/status
  if (req.method === 'PUT') {
    const index = store.reviews.findIndex(r => r.id === targetId);
    if (index === -1) return res.status(404).json({ error: 'Review not found' });

    store.reviews[index] = {
      ...store.reviews[index],
      ...body,
      featured: body.featured !== undefined ? (body.featured ? 1 : 0) : store.reviews[index].featured,
      status: body.status || store.reviews[index].status
    };
    saveStore(store);
    return res.status(200).json(store.reviews[index]);
  }

  // 4. DELETE: DELETE /api/reviews/:id
  if (req.method === 'DELETE') {
    if (targetId) {
      store.reviews = store.reviews.filter(r => r.id !== targetId);
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Review deleted' });
  }

  // 5. PUBLIC LIST: GET /api/reviews (Approved reviews only)
  const approvedReviews = store.reviews
    .filter(r => r.status === 'APPROVED')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return res.status(200).json(approvedReviews);
}
