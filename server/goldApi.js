import { store, saveStore } from './db.js';

/**
 * GoldAPI.io Integration Service
 * Endpoint: https://www.goldapi.io/api/price/XAU/INR
 * Header: x-access-token
 * Exposes NO API keys to frontend/client.
 */
export async function updateGoldRatesFromAPI(customApiKey = null) {
  const apiKey = customApiKey || process.env.GOLDAPI_KEY || process.env.GOLD_API_KEY || 'goldapi-07b38ebf247585a302d0df580bc43d17-io';

  const currentRates = store.gold_rates[0] || {
    rate_24k: '13,289',
    rate_22k: '12,182',
    rate_18k: '9,967',
    rate_silver: '95',
    ticker_visible: 1,
    last_updated: '23 Sept 2026, 04:57 pm',
    source: 'GoldAPI.io (Live)',
    status: 'Connected (Live)',
    mode: 'AUTOMATIC_API'
  };

  if (!apiKey) {
    console.log('ℹ️ GoldAPI.io Key (GOLDAPI_KEY) not found in process.env. Retaining last successful stored rates.');
    store.gold_rates = [{
      ...currentRates,
      source: currentRates.source || 'GoldAPI.io',
      status: currentRates.last_successful_update ? 'Connected (Cached)' : 'NO_API_KEY',
      mode: currentRates.mode || 'AUTOMATIC_API'
    }];
    saveStore();
    return {
      success: false,
      message: 'GOLDAPI_KEY not configured in server environment variables. Using last successful stored rates.',
      rates: store.gold_rates[0]
    };
  }

  try {
    const res = await fetch('https://www.goldapi.io/api/price/XAU/INR', {
      method: 'GET',
      headers: {
        'x-access-token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`⚠️ GoldAPI.io HTTP Error (${res.status}): ${errText}`);

      const fallbackRates = {
        ...currentRates,
        status: currentRates.last_successful_update ? `Last successful update (${currentRates.last_successful_update})` : `HTTP Error ${res.status}`,
        mode: currentRates.mode || 'AUTOMATIC_API'
      };
      store.gold_rates = [fallbackRates];
      saveStore();

      return {
        success: false,
        message: `GoldAPI.io returned HTTP ${res.status}. Retaining last successful rates.`,
        rates: fallbackRates
      };
    }

    const data = await res.json();

    // Extract per-gram values supplied directly by GoldAPI.io
    const p24 = Number(data.price_gram_24k);
    const p22 = Number(data.price_gram_22k);
    const p18 = Number(data.price_gram_18k);

    // Validate numeric values
    if (isNaN(p24) || p24 <= 0 || isNaN(p22) || p22 <= 0 || isNaN(p18) || p18 <= 0) {
      console.warn('⚠️ GoldAPI.io returned invalid numeric values:', data);
      return {
        success: false,
        message: 'Invalid numeric values received from GoldAPI.io. Retaining last successful rates.',
        rates: currentRates
      };
    }

    // Format for Indian Rupee display (e.g. ₹6,850 /g)
    const formatted24k = Math.round(p24).toLocaleString('en-IN');
    const formatted22k = Math.round(p22).toLocaleString('en-IN');
    const formatted18k = Math.round(p18).toLocaleString('en-IN');

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const timestampStr = `${dateStr}, ${timeStr}`;

    const updated = {
      id: 1,
      rate_24k: formatted24k,
      rate_22k: formatted22k,
      rate_18k: formatted18k,
      raw_24k: Math.round(p24),
      raw_22k: Math.round(p22),
      raw_18k: Math.round(p18),
      rate_silver: currentRates.rate_silver || '92',
      ticker_visible: currentRates.ticker_visible !== undefined ? currentRates.ticker_visible : 1,
      last_updated: timestampStr,
      last_successful_update: timestampStr,
      source: 'GoldAPI.io (XAU/INR)',
      currency: 'INR',
      unit: 'gram',
      api_timestamp: data.timestamp ? new Date(data.timestamp * 1000).toISOString() : now.toISOString(),
      status: 'Connected',
      mode: currentRates.mode === 'MANUAL_OVERRIDE' ? 'MANUAL_OVERRIDE' : 'AUTOMATIC_API'
    };

    store.gold_rates = [updated];

    // Add history log entry
    const newHistId = store.rate_history.length ? Math.max(...store.rate_history.map(h => h.id)) + 1 : 1;
    store.rate_history.unshift({
      id: newHistId,
      date_str: dateStr,
      rate_22k: formatted22k,
      rate_24k: formatted24k,
      rate_18k: formatted18k,
      source: 'GoldAPI.io (Automatic)',
      change_amount: 'Auto Updated'
    });

    if (store.rate_history.length > 30) {
      store.rate_history = store.rate_history.slice(0, 30);
    }

    saveStore();

    // Update public static asset if accessible
    try {
      import('fs').then(fs => {
        const publicStorePath = './public/data/store.json';
        if (fs.existsSync(publicStorePath)) {
          const content = JSON.parse(fs.readFileSync(publicStorePath, 'utf-8'));
          content.gold_rates = [updated];
          fs.writeFileSync(publicStorePath, JSON.stringify(content, null, 2), 'utf-8');
        }
      });
    } catch (e) {}

    console.log(`✅ GoldAPI.io Rates Updated Successfully: 24K=₹${formatted24k}/g, 22K=₹${formatted22k}/g, 18K=₹${formatted18k}/g`);
    return {
      success: true,
      message: 'Gold rates updated successfully from GoldAPI.io',
      rates: updated
    };
  } catch (err) {
    console.error('❌ Error updating gold rates from GoldAPI.io:', err);
    return {
      success: false,
      message: `Network error connecting to GoldAPI.io: ${err.message}. Retaining last successful rates.`,
      rates: currentRates
    };
  }
}
