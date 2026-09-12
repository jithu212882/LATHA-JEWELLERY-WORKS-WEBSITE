import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function GoldRateManager() {
  const { gold_rates, refreshData } = useData();
  const { token } = useAuth();

  const [rate22k, setRate22k] = useState(gold_rates?.rate_22k || '6,850');
  const [rate24k, setRate24k] = useState(gold_rates?.rate_24k || '7,460');
  const [rateSilver, setRateSilver] = useState(gold_rates?.rate_silver || '92');
  const [tickerVisible, setTickerVisible] = useState(!!gold_rates?.ticker_visible);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/gold-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rate_22k: rate22k,
          rate_24k: rate24k,
          rate_silver: rateSilver,
          ticker_visible: tickerVisible ? 1 : 0
        })
      });

      if (res.ok) {
        await refreshData();
        setMsg('Gold rates updated and live ticker synchronized!');
      }
    } catch (err) {
      console.error('Error updating rates:', err);
    } finally {
      setSaving(false);
    }
  };

  const adjustRate = (setter, currentVal, delta) => {
    const num = parseInt(currentVal.replace(/[^0-9]/g, '')) || 0;
    const newVal = Math.max(0, num + delta);
    setter(newVal.toLocaleString('en-IN'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Bullion Pricing Engine
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Gold Rate Management
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rate Controller Form */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-6 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            Publish Live Rates (Per Gram)
          </h3>

          {msg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold">
              {msg}
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                22K Gold Rate (₹ / Gram)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={rate22k}
                  onChange={(e) => setRate22k(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xl font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjustRate(setRate22k, rate22k, 25)}
                  className="px-3 py-3 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg hover:bg-accent-gold hover:text-[#121212] font-bold text-xs"
                >
                  +₹25
                </button>
                <button
                  type="button"
                  onClick={() => adjustRate(setRate22k, rate22k, -25)}
                  className="px-3 py-3 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg hover:bg-accent-gold hover:text-[#121212] font-bold text-xs"
                >
                  -₹25
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                24K Gold Rate (₹ / Gram)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={rate24k}
                  onChange={(e) => setRate24k(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xl font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjustRate(setRate24k, rate24k, 30)}
                  className="px-3 py-3 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg hover:bg-accent-gold hover:text-[#121212] font-bold text-xs"
                >
                  +₹30
                </button>
                <button
                  type="button"
                  onClick={() => adjustRate(setRate24k, rate24k, -30)}
                  className="px-3 py-3 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg hover:bg-accent-gold hover:text-[#121212] font-bold text-xs"
                >
                  -₹30
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Silver Rate (₹ / Gram)
              </label>
              <input
                type="text"
                required
                value={rateSilver}
                onChange={(e) => setRateSilver(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-xl font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="show-ticker"
                checked={tickerVisible}
                onChange={(e) => setTickerVisible(e.target.checked)}
                className="w-5 h-5 accent-accent-gold rounded"
              />
              <label htmlFor="show-ticker" className="text-sm text-[#F5F2EB] font-medium cursor-pointer">
                Display Live Gold Rate Ticker on Website Header
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-accent-gold text-[#121212] font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Live Rates Now'}
            </button>
          </form>

          <span className="text-[11px] text-[#F5F2EB]/50 block text-center">
            Last Updated: {gold_rates?.last_updated || 'Today'}
          </span>
        </div>

        {/* Info Box */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-6 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            Rate Publishing Guidelines
          </h3>
          <ul className="space-y-4 text-xs text-[#F5F2EB]/80 font-light leading-relaxed">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">info</span>
              <span>Publishing new rates immediately updates the header ticker across all public user sessions.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">verified</span>
              <span>Gold rates are stored in the local atelier database and persist across server restarts.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">price_change</span>
              <span>Use the quick ±₹25 / ±₹30 buttons for rapid daily market adjustments.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
