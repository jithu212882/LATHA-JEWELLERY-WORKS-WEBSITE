import fs from 'fs';
import path from 'path';
import { KNOWLEDGE_CHUNKS } from './lathaKnowledgeData.js';
import { fetchFromSupabase, isSupabaseConfigured } from '../supabase.js';
import { fetchLiveGoldRates } from '../metalpriceApi.js';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'can', 'what', 'how', 'with', 'this', 'that',
  'from', 'have', 'tell', 'sell', 'will', 'your', 'you', 'was', 'not', 'but',
  'any', 'our', 'all', 'give', 'want', 'need', 'know', 'does'
]);

function getLocalStoreRates() {
  try {
    const tmpPath = '/tmp/store.json';
    if (fs.existsSync(tmpPath)) {
      const parsed = JSON.parse(fs.readFileSync(tmpPath, 'utf-8'));
      if (parsed?.gold_rates?.[0]) return parsed.gold_rates[0];
    }
  } catch (e) {}

  try {
    const storePath = path.join(process.cwd(), 'server/data/store.json');
    if (fs.existsSync(storePath)) {
      const parsed = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
      if (parsed?.gold_rates?.[0]) return parsed.gold_rates[0];
    }
  } catch (e) {}

  return null;
}

/**
 * Retrieves the authoritative gold and silver rates.
 * Prioritizes the active rates passed directly from the website ticker / DataContext.
 * If not supplied, inspects the local data store (store.json), Supabase, or live rate service.
 */
export async function getVerifiedGoldRates(activeRates = null) {
  let rateData = null;

  // 1. If active rates were passed directly from the client ticker (DataContext)
  if (activeRates && (activeRates.rate_22k || activeRates.rate_24k || activeRates.price_22k || activeRates.price_24k)) {
    rateData = activeRates;
  }

  // 2. Otherwise check the shared store that feeds the UI and ticker
  if (!rateData) {
    rateData = getLocalStoreRates();
  }

  // 3. Fallback to Supabase if configured
  if (!rateData && isSupabaseConfigured()) {
    try {
      const sbRates = await fetchFromSupabase('gold_rates', 'id', false);
      if (sbRates && sbRates.length > 0) {
        rateData = sbRates[0];
      }
    } catch (e) {
      console.warn('[Retriever] Supabase gold rate fetch warning:', e.message);
    }
  }

  // 4. Fallback to live MetalpriceAPI service
  if (!rateData) {
    try {
      const liveRates = await fetchLiveGoldRates();
      if (liveRates && (liveRates.rate_22k || liveRates.price_24k)) {
        rateData = liveRates;
      }
    } catch (e) {
      console.warn('[Retriever] MetalpriceAPI live fetch notice:', e.message);
    }
  }

  // If completely unavailable, return safe dynamic object without guessing
  if (!rateData) {
    return {
      rate_22k: null,
      rate_24k: null,
      rate_18k: null,
      rate_silver: null,
      last_updated: 'Live Market Rate',
      source: 'Latha Jewellery Works',
      summary: "Live gold and silver rates are currently updating. Please refer to our website top ticker banner or contact our atelier directly on WhatsApp at +91 9487056064 for the exact moment-to-moment rate."
    };
  }

  const p24 = Number(rateData.price_24k || String(rateData.rate_24k || '').replace(/[^0-9.]/g, '') || 0);
  const p22 = Number(rateData.price_22k || String(rateData.rate_22k || '').replace(/[^0-9.]/g, '') || (p24 ? Math.round(p24 * (22 / 24)) : 0));
  const p18 = Number(rateData.price_18k || String(rateData.rate_18k || '').replace(/[^0-9.]/g, '') || (p24 ? Math.round(p24 * (18 / 24)) : 0));
  const pSilver = Number(rateData.rate_silver ? String(rateData.rate_silver).replace(/[^0-9.]/g, '') : (rateData.price_silver || 95)) || 95;

  const fmt = (num) => (num && !isNaN(num)) ? Math.round(num).toLocaleString('en-IN') : '';
  const str24k = rateData.rate_24k || (p24 ? fmt(p24) : '14,370');
  const str22k = rateData.rate_22k || (p22 ? fmt(p22) : '13,256');
  const str18k = rateData.rate_18k || (p18 ? fmt(p18) : '11,027');
  const strSilver = String(rateData.rate_silver || pSilver || '95');

  const conciergeSummary = `Today's official live gold rates at Latha Jewellery Works:
• 22K Gold (916 Hallmarked): ₹${str22k}/g
• 24K Pure Gold: ₹${str24k}/g
• 18K Gold: ₹${str18k}/g
• Silver: ₹${strSilver}/g

All our ornaments are 100% BIS 916 hallmarked with 6-digit laser HUID purity authentication. Daily bullion rates are updated live to match our atelier board rates.`;

  return {
    rate_22k: str22k,
    rate_24k: str24k,
    rate_18k: str18k,
    rate_silver: strSilver,
    last_updated: rateData.last_updated || 'Live Market Rate',
    source: rateData.source || 'Active Board Rate',
    summary: conciergeSummary
  };
}

export function isGoldRateIntent(query) {
  const q = (query || '').toLowerCase();
  const keywords = [
    'gold rate', 'gold price', 'rate', 'price per gram', '22k', '24k', '18k',
    'silver rate', 'silver price', 'today rate', 'today price', 'gram rate',
    'how much for gold', 'today gold', '22k price', '24k price', 'live rate',
    'current rate', 'gold cost', 'price of gold'
  ];
  return keywords.some(k => q.includes(k));
}

export function retrieveRelevantKnowledge(query, limit = 2) {
  if (!query || typeof query !== 'string') return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (rawTokens.length === 0) return [];

  const scoredChunks = KNOWLEDGE_CHUNKS.map(chunk => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerTitle = chunk.title.toLowerCase();

    for (const token of rawTokens) {
      if (chunk.keywords.includes(token)) {
        score += 3;
      }
      if (lowerTitle.includes(token)) {
        score += 2;
      }
      if (lowerContent.includes(token)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  return scoredChunks
    .filter(item => item.score >= 2) // Require at least a keyword or title match
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.chunk);
}

export async function buildChatContext(userMessage, activeRates = null) {
  const needsGoldRate = isGoldRateIntent(userMessage);
  let goldRateContext = null;
  let currentRates = null;

  if (needsGoldRate) {
    currentRates = await getVerifiedGoldRates(activeRates);
    goldRateContext = currentRates?.summary || null;
  }

  const relevantChunks = retrieveRelevantKnowledge(userMessage, 2);
  const knowledgeSnippets = relevantChunks.map(c => `[${c.title}]: ${c.content}`).join('\n\n');

  return {
    needsGoldRate,
    goldRateContext,
    currentRates,
    knowledgeSnippets,
    hasRelevantData: Boolean(goldRateContext || knowledgeSnippets)
  };
}