import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'latha-jewellery-secret-key-2024';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 1. Verify Admin JWT Authorization Token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing Admin token' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Unauthorized: Invalid or expired Admin token' });
  }

  // 2. Parse request body { path, contentType }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  const { path: filePath, contentType } = body || {};
  if (!filePath) {
    return res.status(400).json({ success: false, error: 'File path is required' });
  }

  // 3. Create Supabase Storage Signed Upload URL
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        success: true,
        useClientFallback: true,
        path: filePath,
        message: 'Supabase storage credentials pending on server'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .storage
      .from('jewellery-images')
      .createSignedUploadUrl(filePath);

    if (error || !data) {
      console.warn('[upload-url] Signed URL warning:', error?.message);
      return res.status(200).json({
        success: true,
        useClientFallback: true,
        path: filePath,
        error: error?.message || 'Failed to create signed upload URL'
      });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/jewellery-images/${filePath}`;

    return res.status(200).json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl
    });
  } catch (err) {
    console.error('[upload-url] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error generating upload authorization'
    });
  }
}
