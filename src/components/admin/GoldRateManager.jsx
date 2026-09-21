import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function GoldRateManager() {
  const { gold_rates, refreshData } = useData();
  const { token } = useAuth();

  const [fetching, setFetching] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testApiKey, setTestApiKey] = useState('');

  const [manual24k, setManual24k] = useState(gold_rates?.rate_24k || '7,460');
  const [manual22k, setManual22k] = useState(gold_rates?.rate_22k || '6,850');
  const [manual18k, setManual18k] = useState(gold_rates?.rate_18k || '5,625');
  const [manualSilver, setManualSilver] = useState(gold_rates?.rate_silver || '92');

  const isManualMode = gold_rates?.mode === 'MANUAL_OVERRIDE';

  // Trigger Live GoldAPI.io Fetch
  const handleFetchLive = async () => {
    setFetching(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/gold-rates/fetch-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ api_key: testApiKey.trim() || undefined })
      });

      const json = await res.json();
      if (json.success) {
        setStatusMsg(json.message || 'Successfully fetched live rates from GoldAPI.io!');
        await refreshData();
      } else {
        setErrorMsg(json.message || 'GoldAPI.io request failed. Retaining last successful rates.');
      }
    } catch (err) {
      setErrorMsg(`Error connecting to backend: ${err.message}. Retaining last successful rates.`);
    } finally {
      setFetching(false);
    }
  };

  // Trigger Emergency Manual Override
  const handleManualOverride = async (e) => {
    e.preventDefault();
    setSavingOverride(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/gold-rates/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rate_24k: manual24k,
          rate_22k: manual22k,
          rate_18k: manual18k,
          rate_silver: manualSilver
        })
      });

      const json = await res.json();
      if (res.ok) {
        setStatusMsg('Emergency manual override published successfully.');
        await refreshData();
      }
    } catch (err) {
      setErrorMsg(`Failed to save manual override: ${err.message}`);
    } finally {
      setSavingOverride(false);
    }
  };

  // Restore Automatic Mode
  const handleRestoreAuto = async () => {
    setFetching(true);
    setStatusMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/gold-rates/restore-auto', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok) {
        setStatusMsg('Restored automatic GoldAPI.io market rate mode.');
        await refreshData();
      }
    } catch (err) {
      setErrorMsg('Error restoring automatic mode.');
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Bullion Pricing Engine (GoldAPI.io)
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Gold Rate Management
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-[#F5F2EB]/60">Engine Mode:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isManualMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isManualMode ? 'MANUAL OVERRIDE (EMERGENCY)' : 'AUTOMATIC API RATE'}
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {statusMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Status & Automatic Rate Display Card */}
      <div className="bg-[#181818] border border-accent-gold/30 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2A2A2A] pb-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-bold block mb-1">
              Central Gold Price Source
            </span>
            <h2 className="font-headline text-2xl font-bold text-[#F9F6F0]">
              {gold_rates?.source || 'GoldAPI.io (XAU/INR)'}
            </h2>
          </div>

          <button
            onClick={handleFetchLive}
            disabled={fetching}
            className="bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <span className={`material-symbols-outlined text-[18px] ${fetching ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{fetching ? 'Connecting GoldAPI.io...' : 'Fetch Live GoldAPI.io Rates Now'}</span>
          </button>
        </div>

        {/* Live Purities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121212] border border-[#2A2A2A] p-5 rounded-xl text-center">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold block mb-1">
              24K Gold Rate
            </span>
            <span className="font-headline text-2xl sm:text-3xl font-bold text-[#F9F6F0]">
              ₹{gold_rates?.rate_24k || '7,460'}
            </span>
            <span className="text-[10px] text-[#F5F2EB]/50 block mt-1">Per Gram</span>
          </div>

          <div className="bg-[#121212] border border-accent-gold/40 p-5 rounded-xl text-center shadow-lg">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold block mb-1">
              22K Gold Rate
            </span>
            <span className="font-headline text-2xl sm:text-3xl font-bold text-accent-gold">
              ₹{gold_rates?.rate_22k || '6,850'}
            </span>
            <span className="text-[10px] text-[#F5F2EB]/50 block mt-1">Per Gram</span>
          </div>

          <div className="bg-[#121212] border border-[#2A2A2A] p-5 rounded-xl text-center">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold block mb-1">
              18K Gold Rate
            </span>
            <span className="font-headline text-2xl sm:text-3xl font-bold text-[#F9F6F0]">
              ₹{gold_rates?.rate_18k || '5,625'}
            </span>
            <span className="text-[10px] text-[#F5F2EB]/50 block mt-1">Per Gram</span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-[#2A2A2A] text-xs text-[#F5F2EB]/70 font-light">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>Status:</strong> {gold_rates?.status || 'Connected'}
            </span>
          </div>

          <div>
            <strong>Last Successful Update:</strong> {gold_rates?.last_updated || 'Today'}
          </div>
        </div>
      </div>

      {/* Optional Emergency Manual Override Section */}
      <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-6 shadow-lg">
        <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4">
          <div>
            <h3 className="font-headline text-xl font-bold text-accent-gold uppercase">
              Optional Emergency Manual Override
            </h3>
            <p className="font-body text-xs text-[#F5F2EB]/60 mt-1">
              Use only in emergencies if GoldAPI.io is offline. Default source is automatic GoldAPI.io market rates.
            </p>
          </div>

          {isManualMode && (
            <button
              onClick={handleRestoreAuto}
              disabled={fetching}
              className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-[#121212] transition-colors"
            >
              Restore Automatic API Rates
            </button>
          )}
        </div>

        <form onSubmit={handleManualOverride} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/80 mb-2 font-medium">
                24K Gold (₹ / Gram)
              </label>
              <input
                type="text"
                value={manual24k}
                onChange={(e) => setManual24k(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-lg font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/80 mb-2 font-medium">
                22K Gold (₹ / Gram)
              </label>
              <input
                type="text"
                value={manual22k}
                onChange={(e) => setManual22k(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-lg font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/80 mb-2 font-medium">
                18K Gold (₹ / Gram)
              </label>
              <input
                type="text"
                value={manual18k}
                onChange={(e) => setManual18k(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-lg font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingOverride}
            className="w-full bg-[#242424] border border-amber-500/40 text-amber-400 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-[#121212] transition-colors disabled:opacity-50"
          >
            {savingOverride ? 'Publishing Override...' : 'Publish Emergency Manual Rate Override'}
          </button>
        </form>
      </div>
    </div>
  );
}
