/**
 * API handler for /api/google-ai-chat
 * Dedicated backend endpoint for the Google AI Studio Chatbot on Latha Jewellery Works.
 * Completely independent of Botpress and Antigravity Custom AI endpoints.
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;

// Official Verified Store Ground Truth for Latha Jewellery Works
const VERIFIED_STORE_INFO = {
  name: 'Latha Jewellery Works',
  tagline: 'Handcrafted 22K Gold & Silver Atelier',
  established: '1990',
  city: 'Nadaikavu / Chathencode',
  state: 'Tamil Nadu',
  country: 'India',
  address: 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu (Plus Code: 74VX+7G Nadaikavu)',
  phone: '+91 9487056064',
  whatsapp: '+91 9487056064',
  email: 'lathajewelleryworks@gmail.com',
  workingHours: 'Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only)',
  hallmark: '100% BIS 916 Hallmarked Gold with 6-digit laser HUID verification',
  exchangePolicy: 'Transparent old gold exchange tested via computerized Karatometer with zero melting loss deduction on pure gold',
  collections: [
    'Chains & Bridal Harams (Royal interlock, rope chains, traditional bridal necklaces)',
    'Kolus (Handcrafted gold & 92.5 sterling silver anklets)',
    'Kammal (Antique temple jimkis, studs, drop earrings)',
    'Bangles & Valayal (Hand-engraved 22K bangles, traditional kadas)',
    'Rings (Filigree engagement, floral, and signet rings)',
    'Silver Artefacts (Heirloom pooja articles, deepams, silver vessels)'
  ],
  digitalShowroomNote: 'The website functions as an authentic digital catalogue showroom. For custom orders, bespoke bridal suites, or piece reservations, customers are guided to visit the atelier or message on WhatsApp.'
};

/**
 * Retrieves current verified live rates from local store cache or default verified values.
 */
function getVerifiedRates() {
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

  return {
    rate_22k: '12,256',
    rate_24k: '13,370',
    rate_18k: '10,027',
    rate_silver: '95'
  };
}

/**
 * Deterministic grounded fallback response generator when Gemini API is unconfigured or unavailable.
 */
function generateGroundedFallbackResponse(userMessage, currentRates) {
  const lower = (userMessage || '').toLowerCase();

  // 1. Live Gold & Silver Rates
  if (lower.includes('rate') || lower.includes('gold price') || lower.includes('silver') || lower.includes('bullion') || lower.includes('purity') || lower.includes('22k') || lower.includes('24k') || lower.includes('18k')) {
    return `Today's Official Bullion Rates at Latha Jewellery Works:\n\n• 22K Standard Gold (BIS 916): ₹${currentRates.rate_22k}/g\n• 24K Pure Gold (99.9%): ₹${currentRates.rate_24k}/g\n• 18K Diamond Gold: ₹${currentRates.rate_18k}/g\n• Silver 999: ₹${currentRates.rate_silver}/g\n\nAll our gold jewellery is 100% BIS 916 hallmarked with official 6-digit laser HUID verification. For custom weight designs or bullion bookings, please contact our atelier at ${VERIFIED_STORE_INFO.phone}.`;
  }

  // 2. Store Location, Address, Hours & Timings (Strictly Nadaikavu, NO Bengaluru)
  if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('timing') || lower.includes('hour') || lower.includes('open') || lower.includes('sunday') || lower.includes('bengaluru') || lower.includes('bangalore')) {
    return `Latha Jewellery Works Flagship Atelier:\n\n📍 Address: ${VERIFIED_STORE_INFO.address}\n\n🕒 Atelier Working Hours:\n${VERIFIED_STORE_INFO.workingHours}\n\n📞 Phone & WhatsApp: ${VERIFIED_STORE_INFO.phone}\n\nNote: We are located in Nadaikavu, Tamil Nadu. We welcome you to visit our showroom!`;
  }

  // 3. Contact Details
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('call') || lower.includes('reach') || lower.includes('email') || lower.includes('number')) {
    return `Contact Latha Jewellery Works:\n\n• Phone & WhatsApp: ${VERIFIED_STORE_INFO.phone}\n• Email: ${VERIFIED_STORE_INFO.email}\n• Location: ${VERIFIED_STORE_INFO.address}\n• Timings: ${VERIFIED_STORE_INFO.workingHours}`;
  }

  // 4. Custom & Bespoke Jewellery Orders
  if (lower.includes('custom') || lower.includes('bespoke') || lower.includes('cad') || lower.includes('design') || lower.includes('order') || lower.includes('bridal') || lower.includes('wedding')) {
    return `Bespoke Goldsmithing at Latha Jewellery Works:\n\nSince 1990, our generational karigars specialize in bespoke bridal and temple ornaments:\n1. Bring or send your reference design / heirloom photo.\n2. Choose metal purity (22K BIS 916) and custom weight.\n3. Handcrafted with traditional South Indian goldsmithing techniques.\n4. Official laser HUID hallmarking.\n\nTo consult with our master goldsmiths, message or call us on WhatsApp at ${VERIFIED_STORE_INFO.phone}.`;
  }

  // 5. Old Gold Exchange & Purity Testing
  if (lower.includes('exchange') || lower.includes('old gold') || lower.includes('karatometer') || lower.includes('test') || lower.includes('melt')) {
    return `100% Transparent Old Gold Exchange:\n\n• Tested in front of you using computerized Karatometer spectrometer.\n• Zero melting loss deduction on pure assessed gold weight.\n• Full market value credited directly against current live rates.\n• Valid for exchange against handcrafted 22K 916 hallmarked ornaments or silver articles.`;
  }

  // 6. Collections
  if (lower.includes('collection') || lower.includes('category') || lower.includes('haram') || lower.includes('bangle') || lower.includes('chain') || lower.includes('ring') || lower.includes('earring') || lower.includes('kolus')) {
    return `Signature Collections at Latha Jewellery Works:\n\n${VERIFIED_STORE_INFO.collections.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nYou can browse our curated digital catalogue on the website or contact us at ${VERIFIED_STORE_INFO.phone} for bespoke enquiries.`;
  }

  // 7. Hallmark & Certification
  if (lower.includes('hallmark') || lower.includes('huid') || lower.includes('bis') || lower.includes('certificate') || lower.includes('purity')) {
    return `100% BIS 916 Hallmark Assurance:\n\nEvery gold piece crafted by Latha Jewellery Works carries the official three-part BIS hallmark:\n1. BIS Triangular Logo\n2. 916 Purity Mark (22 Karat)\n3. 6-digit alphanumeric HUID (Hallmark Unique Identification) traceable via the official BIS Care app.`;
  }

  // 8. General Welcome Fallback
  return `Welcome to Latha Jewellery Works (Established 1990 in Nadaikavu, Tamil Nadu). I am your Google AI Studio Atelier Concierge. You can ask me about today's live gold rates, handcrafted 22K hallmarked collections, store timings, or custom bridal goldsmithing. For immediate personal assistance, connect with our atelier at ${VERIFIED_STORE_INFO.phone}.`;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Valid query message is required.' });
    }

    const trimmedMessage = message.trim();
    const currentRates = getVerifiedRates();

    // Check if Gemini API Key is configured
    if (!GEMINI_API_KEY) {
      const fallbackReply = generateGroundedFallbackResponse(trimmedMessage, currentRates);
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        source: 'grounded_rules_engine',
        provider: 'google_ai_studio_offline',
        rates: currentRates
      });
    }

    // Initialize Google GenAI client with official SDK
    const ai = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-latha-jewellery'
        }
      }
    });

    const systemInstruction = `You are the official Google AI Studio Concierge for "Latha Jewellery Works", a heritage handcrafted fine jewellery atelier established in 1990 in Nadaikavu, Tamil Nadu.

STRICT FACTUAL GROUND TRUTH (SOURCE OF TRUTH):
- Business Name: Latha Jewellery Works
- Founded: 1990
- Showroom Address: Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu (Plus Code: 74VX+7G Nadaikavu)
- Phone & WhatsApp: +91 9487056064
- Working Hours: Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only)
- Purity Standards: 100% BIS 916 Hallmarked Gold with 6-digit laser HUID verification
- Old Gold Exchange: Assessed via computerized Karatometer with zero melting loss deduction on pure gold
- Website Role: Curated digital catalogue showroom (NOT automated e-commerce cart/checkout). All custom orders and purchases are coordinated via showroom visit or WhatsApp.

TODAY'S VERIFIED LIVE BULLION RATES:
- 22K Standard Gold (BIS 916): ₹${currentRates.rate_22k}/gram
- 24K Pure Bullion Gold (99.9%): ₹${currentRates.rate_24k}/gram
- 18K Diamond Gold: ₹${currentRates.rate_18k}/gram
- Silver 999: ₹${currentRates.rate_silver}/gram

CRITICAL RULES:
1. NEVER use or mention Bengaluru, Bangalore, Karnataka, or fake phone numbers. The atelier is strictly in Nadaikavu, Tamil Nadu, and phone is +91 9487056064.
2. For gold rates, use ONLY the verified rates provided above. NEVER invent, extrapolate, or estimate gold or silver prices.
3. NEVER invent discounts, percentage sales, stock counts, or unverified gemstone certifications.
4. If asked about an unrelated topic or info not present in the verified facts above, state that you do not have verified details on that and politely invite the customer to call or WhatsApp Latha Jewellery Works at +91 9487056064.
5. Keep your tone polite, luxurious, respectful, and concise.`;

    // Prepare contents array for Gemini with history
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn && typeof turn.text === 'string' && turn.text.trim()) {
          contents.push({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.text.trim() }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: trimmedMessage }]
    });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          topP: 0.9
        }
      });

      const reply = response.text || generateGroundedFallbackResponse(trimmedMessage, currentRates);

      return res.status(200).json({
        success: true,
        reply,
        source: 'gemini_grounded',
        provider: 'google_ai_studio',
        rates: currentRates
      });
    } catch (apiError) {
      console.warn('[GoogleAI] Gemini API error (using grounded fallback):', apiError.message);
      const fallbackReply = generateGroundedFallbackResponse(trimmedMessage, currentRates);
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        source: 'grounded_knowledge_fallback',
        provider: 'google_ai_studio_fallback',
        rates: currentRates
      });
    }

  } catch (error) {
    console.error('[GoogleAI] Unexpected handler error:', error.message);
    const rates = getVerifiedRates();
    return res.status(200).json({
      success: true,
      reply: "Thank you for contacting Latha Jewellery Works. For immediate assistance with our 22K hallmarked collections or today's live gold rates, please connect with our atelier directly at +91 9487056064.",
      source: 'safety_fallback',
      provider: 'google_ai_studio'
    });
  }
}
