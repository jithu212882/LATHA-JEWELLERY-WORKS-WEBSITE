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
  return { reviews: [] };
}

function saveStore(store) {
  memoryStore = store;
  try {
    fs.writeFileSync('/tmp/store.json', JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {}
}

function extractTargetId(req) {
  const matchedPath = req.headers['x-matched-path'] || '';
  const urlPath = new URL(req.url, 'http://localhost').pathname;

  // Direct query param ?id=123
  if (req.query?.id && !isNaN(parseInt(req.query.id))) {
    return parseInt(req.query.id);
  }

  // Rewrite query param ?path=123 or ?path=123/status or ['123', 'status']
  const pathParam = Array.isArray(req.query?.path) ? req.query.path.join('/') : (req.query?.path || '');
  if (pathParam) {
    const parts = pathParam.split('/');
    for (const p of parts) {
      const n = parseInt(p);
      if (!isNaN(n)) return n;
    }
  }

  // URL segments (/api/reviews/123 or /api/reviews/123/status)
  const segments = (matchedPath || urlPath).split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const n = parseInt(segments[i]);
    if (!isNaN(n)) return n;
  }

  return null;
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

  const matchedPath = req.headers['x-matched-path'] || '';
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const fullCheck = `${urlPath} ${matchedPath} ${JSON.stringify(req.query || {})}`;
  const targetId = extractTargetId(req);

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  // 1. ADMIN LIST: GET /api/reviews/admin or query contains admin
  if (fullCheck.includes('admin') && req.method === 'GET') {
    return res.status(200).json(store.reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }

  // 2. PUBLIC SUBMISSION: POST /api/reviews
  if (req.method === 'POST') {
    const { name, location, rating, review_text } = body;
    if (!name || !review_text) {
      return res.status(400).json({ error: 'Name and review content are required' });
    }

    const newId = store.reviews.length ? Math.max(...store.reviews.map(r => Number(r.id) || 0)) + 1 : Date.now();
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
    if (!targetId) {
      return res.status(400).json({ error: 'Missing review ID' });
    }

    let index = store.reviews.findIndex(r => Number(r.id) === Number(targetId));
    if (index === -1) {
      // If review was submitted on another serverless container, initialize it here
      const newReview = {
        id: targetId,
        name: body.name || 'Patron Review',
        location: body.location || 'Hosur',
        rating: body.rating || 5,
        review_text: body.review_text || '',
        status: body.status || 'APPROVED',
        featured: body.featured ? 1 : 0,
        created_at: new Date().toISOString()
      };
      store.reviews.push(newReview);
      saveStore(store);
      return res.status(200).json(newReview);
    }

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
      store.reviews = store.reviews.filter(r => Number(r.id) !== Number(targetId));
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
