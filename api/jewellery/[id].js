import fs from 'fs';
import path from 'path';

function getStore() {
  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    }
  } catch (e) {}
  return { jewellery_models: [] };
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
  if (!Array.isArray(store.jewellery_models)) store.jewellery_models = [];

  const index = store.jewellery_models.findIndex(m => m.id === id);

  if (req.method === 'GET') {
    if (index === -1) {
      return res.status(404).json({ error: 'Jewellery model not found' });
    }
    return res.status(200).json(store.jewellery_models[index]);
  }

  if (req.method === 'PUT') {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (index === -1) {
      return res.status(404).json({ error: 'Jewellery model not found' });
    }

    const currentModel = store.jewellery_models[index];
    const updatedModel = {
      ...currentModel,
      ...body,
      id: id,
      primary_image: body.primary_image !== undefined ? body.primary_image : currentModel.primary_image,
      additional_images: Array.isArray(body.additional_images) ? body.additional_images : currentModel.additional_images,
      featured: body.featured !== undefined ? (body.featured ? 1 : 0) : currentModel.featured,
      active: body.active !== undefined ? (body.active ? 1 : 0) : currentModel.active
    };

    store.jewellery_models[index] = updatedModel;
    saveStore(store);

    return res.status(200).json(updatedModel);
  }

  if (req.method === 'DELETE') {
    if (index !== -1) {
      store.jewellery_models.splice(index, 1);
      saveStore(store);
    }
    return res.status(200).json({ success: true, message: 'Jewellery model deleted' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
