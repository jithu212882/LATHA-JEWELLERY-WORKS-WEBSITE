export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    const fileData = body?.fileData || body?.url || '';

    if (!fileData) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided for upload'
      });
    }

    return res.status(200).json({
      success: true,
      id: Date.now(),
      url: fileData,
      section_tag: body?.section_tag || 'General',
      created_at: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Media upload serverless processing failed'
    });
  }
}
