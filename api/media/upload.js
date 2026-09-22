export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    if (body && body.fileData) {
      return res.status(200).json({
        id: Date.now(),
        url: body.fileData,
        section_tag: body.section_tag || 'General',
        created_at: new Date().toISOString()
      });
    }

    return res.status(200).json({
      id: Date.now(),
      url: body?.url || '',
      section_tag: body?.section_tag || 'General',
      created_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Media upload processing failed' });
  }
}
