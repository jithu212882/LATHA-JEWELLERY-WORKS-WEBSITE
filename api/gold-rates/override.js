import store from '../../server/data/store.json' assert { type: 'json' };

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { rate_24k, rate_22k, rate_18k, rate_silver, ticker_visible } = body;

    const current = store.gold_rates?.[0] || {};
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const updated = {
      ...current,
      id: 1,
      rate_24k: rate_24k || current.rate_24k || '7,460',
      rate_22k: rate_22k || current.rate_22k || '6,850',
      rate_18k: rate_18k || current.rate_18k || '5,625',
      rate_silver: rate_silver || current.rate_silver || '92',
      ticker_visible: ticker_visible !== undefined ? (ticker_visible ? 1 : 0) : 1,
      last_updated: `${dateStr}, ${nowStr} (Manual)`,
      mode: 'MANUAL_OVERRIDE',
      status: 'Emergency Manual Override Active'
    };

    store.gold_rates = [updated];

    return res.status(200).json({
      success: true,
      message: 'Manual rate override published successfully',
      rates: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update manual rates' });
  }
}
