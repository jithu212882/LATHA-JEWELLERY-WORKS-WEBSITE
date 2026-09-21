export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
