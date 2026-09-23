import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { enquiries: [] };
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
  if (!Array.isArray(store.enquiries)) store.enquiries = [];

  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const segments = urlPath.split('/').filter(Boolean);
  const parsedId = parseInt(segments[segments.length - 1]);
  const targetId = !isNaN(parsedId) ? parsedId : (req.query?.id ? parseInt(req.query.id) : null);

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

    const newId = store.enquiries.length ? Math.max(...store.enquiries.map(e => e.id)) + 1 : Date.now();
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
    const index = store.enquiries.findIndex(e => e.id === targetId);
    if (index === -1) return res.status(404).json({ error: 'Enquiry not found' });
    if (body.status) store.enquiries[index].status = body.status;
    if (body.internal_notes !== undefined) store.enquiries[index].internal_notes = body.internal_notes;
    saveStore(store);
    return res.status(200).json(store.enquiries[index]);
  }

  if (req.method === 'DELETE') {
    if (targetId) {
      store.enquiries = store.enquiries.filter(e => e.id !== targetId);
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Enquiry archived/deleted' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
