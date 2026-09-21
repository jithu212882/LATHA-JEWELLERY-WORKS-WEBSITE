import store from '../../server/data/store.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (store.gold_rates?.[0]) {
    store.gold_rates[0].mode = 'AUTOMATIC_API';
    store.gold_rates[0].status = 'Connected';
  }

  return res.status(200).json({
    success: true,
    message: 'Restored automatic GoldAPI.io rate mode',
    rates: store.gold_rates?.[0]
  });
}
