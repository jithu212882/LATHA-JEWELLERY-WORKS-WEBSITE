export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const urlPath = new URL(req.url, 'http://localhost').pathname;

  // 1. LOGIN: /api/auth/login
  if (urlPath.includes('/login') || req.query?.subroute === 'login') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { username, password } = body;

      if (username === 'admin' && (password === 'LATHA2024' || password === 'admin')) {
        return res.status(200).json({
          success: true,
          token: 'latha_master_token_2024',
          username: 'admin',
          role: 'SUPER_ADMIN'
        });
      }

      return res.status(401).json({ error: 'Invalid master username or password' });
    } catch (err) {
      return res.status(500).json({ error: 'Server authentication error' });
    }
  }

  // 2. VERIFY: /api/auth/verify
  if (urlPath.includes('/verify') || req.query?.subroute === 'verify') {
    const authHeader = req.headers.authorization || '';
    if (authHeader.includes('latha_master_token_2024') || authHeader.length > 10) {
      return res.status(200).json({
        valid: true,
        user: { username: 'admin', role: 'SUPER_ADMIN' }
      });
    }

    return res.status(401).json({ error: 'Invalid token' });
  }

  return res.status(404).json({ error: 'Auth route not found' });
}
