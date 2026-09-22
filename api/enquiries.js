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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { name, mobile, email, jewellery_type, requirements } = req.body || {};
    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and mobile number are required' });
    }

    const store = getStore();
    const newId = store.enquiries?.length ? Math.max(...store.enquiries.map(e => e.id)) + 1 : Date.now();
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

    try {
      if (Array.isArray(store.enquiries)) {
        store.enquiries.push(enquiry);
        const storePath = path.join(process.cwd(), 'server/data/store.json');
        fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
      }
    } catch (e) {}

    const waMsg = `Hello Latha Jewellery Works,%0A%0A*New Custom Jewellery Enquiry*%0A- *Name:* ${encodeURIComponent(name)}%0A- *Mobile:* ${encodeURIComponent(mobile)}%0A- *Email:* ${encodeURIComponent(email || 'N/A')}%0A- *Type:* ${encodeURIComponent(jewellery_type || 'Custom')}%0A- *Details:* ${encodeURIComponent(requirements || 'N/A')}`;
    const whatsappUrl = `https://wa.me/919487056064?text=${waMsg}`;

    return res.status(201).json({ enquiry, whatsappUrl });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
