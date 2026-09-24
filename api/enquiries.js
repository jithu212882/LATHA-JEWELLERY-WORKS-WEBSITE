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
  return { enquiries: [] };
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

  // URL segments (/api/enquiries/123 or /api/enquiries/123/status)
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
  if (!Array.isArray(store.enquiries)) store.enquiries = [];

  const targetId = extractTargetId(req);

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  if (req.method === 'GET') {
    return res.status(200).json(store.enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  }

  if (req.method === 'POST') {
    const { name, mobile, email, jewellery_type, requirements } = body;
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }

    const newId = store.enquiries.length ? Math.max(...store.enquiries.map(e => Number(e.id) || 0)) + 1 : Date.now();
    const enquiry = {
      id: newId,
      name,
      mobile,
      email: email || '',
      jewellery_type: jewellery_type || 'Custom Design',
      requirements: requirements || '',
      status: 'NEW',
      internal_notes: '',
      created_at: new Date().toISOString()
    };

    store.enquiries.push(enquiry);
    saveStore(store);

    const waMsg = `Hello Latha Jewellery Works,%0A%0A*New Custom Jewellery Enquiry*%0A- *Name:* ${encodeURIComponent(name)}%0A- *Mobile:* ${encodeURIComponent(mobile)}%0A- *Email:* ${encodeURIComponent(email || 'N/A')}%0A- *Type:* ${encodeURIComponent(jewellery_type || 'Custom')}%0A- *Details:* ${encodeURIComponent(requirements || 'N/A')}`;
    const whatsappUrl = `https://wa.me/919487056064?text=${waMsg}`;

    return res.status(201).json({ enquiry, whatsappUrl });
  }

  if (req.method === 'PUT') {
    if (!targetId) {
      return res.status(400).json({ error: 'Missing enquiry ID' });
    }

    let index = store.enquiries.findIndex(e => Number(e.id) === Number(targetId));
    if (index === -1) {
      // If not in store yet, initialize entry so update never loses patron data
      const created = {
        id: targetId,
        name: body.name || 'Patron Enquiry',
        mobile: body.mobile || '',
        status: body.status || 'CONTACTED',
        internal_notes: body.internal_notes || '',
        created_at: new Date().toISOString()
      };
      store.enquiries.push(created);
      saveStore(store);
      return res.status(200).json(created);
    }

    if (body.status) store.enquiries[index].status = body.status;
    if (body.internal_notes !== undefined) store.enquiries[index].internal_notes = body.internal_notes;
    saveStore(store);
    return res.status(200).json(store.enquiries[index]);
  }

  if (req.method === 'DELETE') {
    if (targetId) {
      store.enquiries = store.enquiries.filter(e => Number(e.id) !== Number(targetId));
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Enquiry archived/deleted' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
