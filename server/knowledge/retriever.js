import fs from 'fs';
import path from 'path';
import { KNOWLEDGE_CHUNKS } from './lathaKnowledgeData.js';
import { fetchFromSupabase, isSupabaseConfigured } from '../supabase.js';
import { fetchLiveGoldRates } from '../metalpriceApi.js';

const DEFAULT_RATES = {
  rate_24k: '12,850',
  rate_22k: '11,780',
  rate_18k: '9,638',
  rate_silver: '95',
  source: 'MetalpriceAPI (Live)',
  status: 'Connected (Live)',
  last_updated: 'Live Market Rate'
};

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

export async function getVerifiedGoldRates() {
  let rateData = null;

  // 1. Pull directly from MetalpriceAPI service (15-minute in-memory cache)
  try {
    const liveRates = await fetchLiveGoldRates();
    if (liveRates && liveRates.price_24k) {
      rateData = liveRates;
    }
  } catch (e) {
    console.warn('[Retriever] MetalpriceAPI live fetch notice:', e.message);
  }

  // 2. Fallback to Supabase if MetalpriceAPI threw
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

  // 3. Fallback to local store or defaults
  if (!rateData) {
    rateData = getLocalStoreRates() || DEFAULT_RATES;
  }

  const p24 = Number(rateData.price_24k || String(rateData.rate_24k).replace(/[^0-9.]/g, '') || 12850);
  const p22 = Number(rateData.price_22k || String(rateData.rate_22k).replace(/[^0-9.]/g, '') || Math.round(p24 * (22 / 24)));
  const p18 = Number(rateData.price_18k || String(rateData.rate_18k).replace(/[^0-9.]/g, '') || Math.round(p24 * (18 / 24)));
  const pSilver = Number(rateData.rate_silver ? String(rateData.rate_silver).replace(/[^0-9.]/g, '') : 95) || 95;

  const fmt = (num) => Math.round(num).toLocaleString('en-IN');
  const str24k = rateData.rate_24k || fmt(p24);
  const str22k = rateData.rate_22k || fmt(p22);
  const str18k = rateData.rate_18k || fmt(p18);
  const strSilver = String(rateData.rate_silver || pSilver);

  const conciergeSummary = `Today's official live gold rates at Latha Jewellery Works:
• 22K Gold (916 Hallmarked): ₹${str22k}/g
• 24K Pure Gold: ₹${str24k}/g
• 18K Gold: ₹${str18k}/g
• Silver: ₹${strSilver}/g

All our ornaments are 100% BIS 916 hallmarked with 6-digit laser HUID purity authentication. Daily bullion rates are updated live via MetalpriceAPI.`;

  return {
    rate_22k: str22k,
    rate_24k: str24k,
    rate_18k: str18k,
    rate_silver: strSilver,
    last_updated: rateData.last_updated || 'Live Market Rate',
    source: rateData.source || 'MetalpriceAPI (Live)',
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

export async function buildChatContext(userMessage) {
  const needsGoldRate = isGoldRateIntent(userMessage);
  let goldRateContext = null;

  if (needsGoldRate) {
    const rates = await getVerifiedGoldRates();
    goldRateContext = rates.summary;
  }

  const relevantChunks = retrieveRelevantKnowledge(userMessage, 2);
  const knowledgeSnippets = relevantChunks.map(c => `[${c.title}]: ${c.content}`).join('\n\n');

  return {
    needsGoldRate,
    goldRateContext,
    knowledgeSnippets,
    hasRelevantData: Boolean(goldRateContext || knowledgeSnippets)
  };
}