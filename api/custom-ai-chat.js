/**
 * API handler for /api/custom-ai-chat
 * The official backend engine for Latha Atelier Concierge.
 * Grounded in verified store metadata, live bullion rates, product catalogue, and bespoke artisan services.
 */

import { GoogleGenAI } from '@google/genai';
import { buildChatContext, getVerifiedGoldRates } from '../server/knowledge/retriever.js';
import { handleDeliveryTracking } from '../server/deliveryService.js';
import { STORE_METADATA, VERIFIED_PRODUCTS, VERIFIED_CATEGORIES } from '../server/knowledge/lathaKnowledgeData.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
const GROQ_API_KEY = process.env.GROQ_API_KEY || null;

async function callGeminiSDK(systemPrompt, userMessage, contextText, history = []) {
  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: { 'User-Agent': 'latha-atelier-concierge' }
    }
  });

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const turn of history.slice(-6)) {
      if (turn && typeof turn.text === 'string' && turn.text.trim()) {
        contents.push({
          role: turn.sender === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text.trim() }]
        });
      }
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: `[VERIFIED ATELIER CONTEXT]:\n${contextText}\n\n[CUSTOMER INQUIRY]:\n${userMessage}` }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 650
    }
  });

  const text = response.text;
  if (!text) throw new Error('Empty text from Gemini SDK');
  return text.trim();
}

async function callGeminiRest(systemPrompt, userMessage, contextText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n[VERIFIED ATELIER CONTEXT]:\n${contextText}\n\n[CUSTOMER INQUIRY]:\n${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 650
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini REST error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini REST');
  return text.trim();
}

async function callOpenAICompatible(apiKey, baseUrl, model, systemPrompt, userMessage, contextText) {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.2,
      max_tokens: 650,
      messages: [
        { role: 'system', content: `${systemPrompt}\n\n[VERIFIED ATELIER CONTEXT]:\n${contextText}` },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from AI API');
  return text.trim();
}

/**
 * Deterministic, strictly grounded rules engine fallback.
 * Ensures the concierge answers with verified facts, live rates, specifications, and links
 * even without third-party AI keys or during network outages.
 */
function generateGroundedFallback(userMessage, context) {
  const deliveryReply = handleDeliveryTracking(userMessage);
  if (deliveryReply) return deliveryReply;

  const q = (userMessage || '').toLowerCase();

  // 1. Live Gold & Silver Rates
  if (context.needsGoldRate || q.includes('rate') || q.includes('gold price') || q.includes('silver') || q.includes('bullion') || q.includes('22k') || q.includes('24k') || q.includes('18k')) {
    const rates = context.currentRates;
    if (rates && (rates.rate_22k || rates.rate_24k)) {
      return `Today's Official Bullion Rates at Latha Jewellery Works:\n\n• 22K Standard Gold (BIS 916): ₹${rates.rate_22k}/g\n• 24K Pure Bullion Gold: ₹${rates.rate_24k}/g\n• 18K Diamond Gold: ₹${rates.rate_18k}/g\n• Silver: ₹${rates.rate_silver}/g\n\nAll our gold ornaments are 100% BIS 916 hallmarked with official 6-digit laser HUID verification. For custom weight orders or live bookings, connect directly with our atelier at ${STORE_METADATA.phone}.`;
    }
    if (context.goldRateContext) {
      return `${context.goldRateContext}\n\nDaily bullion rates are updated live to match our showroom board rates. For exact custom design quotes, call or WhatsApp our master goldsmiths at ${STORE_METADATA.phone}.`;
    }
  }

  // 2. Greetings
  if (/^(hello|hi|hey|vanakkam|namaste|good\s*(morning|afternoon|evening))\b/i.test(q)) {
    return `Vanakkam and welcome to Latha Jewellery Works! Established in 1990 in Nadaikavu, Tamil Nadu, we handcraft authentic 22K (916) BIS hallmarked gold ornaments, traditional bridal heirlooms, and silver articles.\n\nHow may I assist you today? You can ask me about:\n• Today's live gold & silver rates\n• Handcrafted collections (chains, harams, jimkis, bangles, kolus)\n• Bespoke custom design orders\n• Store location & visiting hours\n• Old gold exchange valuation`;
  }

  // 3. Store Location, Address & Visiting Hours
  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('map') || q.includes('timing') || q.includes('hour') || q.includes('open') || q.includes('sunday') || q.includes('close') || q.includes('bangalore') || q.includes('bengaluru')) {
    return `Latha Jewellery Works Flagship Atelier:\n\n📍 Address: ${STORE_METADATA.address}\n📌 Landmark: ${STORE_METADATA.landmark}\n🗺️ Google Maps Plus Code: ${STORE_METADATA.plusCode}\n🕒 Visiting Hours: ${STORE_METADATA.workingHours}\n📞 Direct Phone & WhatsApp: ${STORE_METADATA.phone}\n\nPlease note: Our single flagship atelier is located in Nadaikavu, Tamil Nadu. We welcome you to visit our showroom!`;
  }

  // 4. Contact Details & Human Escalation
  if (q.includes('contact') || q.includes('phone') || q.includes('whatsapp') || q.includes('call') || q.includes('reach') || q.includes('number') || q.includes('human') || q.includes('manager') || q.includes('owner') || q.includes('goldsmith') || q.includes('karigar')) {
    return `You can connect directly with our master goldsmiths and atelier team:\n\n• Phone & WhatsApp: ${STORE_METADATA.phone}\n• Email: ${STORE_METADATA.email}\n• Atelier Address: ${STORE_METADATA.address}\n• Timings: ${STORE_METADATA.workingHours}\n\nFor custom bridal enquiries or immediate personal consultation, tap the WhatsApp button or call us directly!`;
  }

  // 5. Matched Product Details & Specific Items
  if (context.matchedProducts && context.matchedProducts.length > 0) {
    const primary = context.matchedProducts[0];
    let reply = `Here are verified specifications for ${primary.name}:\n\n• Category: [${primary.category}](${primary.categoryRoute})\n• Minimum Crafted Weight: ${primary.minWeight}\n• Purity Standard: ${primary.purity}\n• Design Artistry: ${primary.description}\n• Product Page: [View ${primary.name} in Catalogue](${primary.route})\n\nEstimated Gold Value: Net Weight × Today's Live 22K Rate + Making Charges + 3% GST. Because live rates change daily, exact final quotes are confirmed at the atelier.`;

    if (context.matchedProducts.length > 1) {
      const others = context.matchedProducts.slice(1).map(p => `• [${p.name}](${p.route}) (${p.minWeight})`).join('\n');
      reply += `\n\nOther matching designs in our atelier:\n${others}`;
    }

    reply += `\n\nWould you like to enquire about this piece on WhatsApp or customize it to a specific weight?`;
    return reply;
  }

  // 6. Jewellery Collections Browsing
  if (q.includes('collection') || q.includes('category') || q.includes('categories') || q.includes('catalogue') || q.includes('show') || q.includes('what do you have')) {
    return `Explore our master jewellery collections at Latha Jewellery Works:\n\n1. [Chains & Necklaces](/collections/chains-necklaces): Royal interlock chains, twisted rope chains, chokers, and grand bridal harams.\n2. [Kolus / Anklets](/collections/kolus): Solid gold and 92.5 sterling silver handcrafted anklets with chiming bells.\n3. [Kammal / Earrings](/collections/kammal): Antique temple jimkis, jhumkas, and studs.\n4. [Bangles & Valayal](/collections/bangles-bracelets): Hand-engraved 22K gold bangles, kadas, and valayal sets.\n5. [Rings](/collections/rings): Regal filigree signet bands and engagement rings.\n\nYou can also [Browse All Masterpieces](/collections) or contact our atelier at ${STORE_METADATA.phone} for bespoke design requests.`;
  }

  // 7. Custom Orders & Bespoke Goldsmithing
  if (q.includes('custom') || q.includes('bespoke') || q.includes('make') || q.includes('order') || q.includes('design') || q.includes('sketch') || q.includes('photo') || q.includes('karigar')) {
    return `Bespoke Goldsmithing at Latha Jewellery Works:\n\nSince 1990, our master karigars craft custom bridal and temple ornaments:\n1. Share your reference photograph, heirloom sample, or hand sketch.\n2. Specify your preferred metal purity (22K BIS 916) and target weight in grams.\n3. Handcrafted in our Nadaikavu atelier using traditional South Indian techniques.\n4. Complete with official laser HUID hallmarking.\n\nTo consult directly with our master goldsmiths, reach out on WhatsApp at ${STORE_METADATA.phone} or visit our showroom.`;
  }

  // 8. Old Gold Exchange & Purity Testing
  if (q.includes('exchange') || q.includes('old gold') || q.includes('karatometer') || q.includes('spectrometer') || q.includes('test') || q.includes('melt')) {
    return `100% Transparent Old Gold Exchange:\n\n• Computerized Karatometer Testing: Evaluated transparently in your presence without damaging your ornaments.\n• Zero Melting Deduction: No arbitrary melting loss is deducted on pure assessed gold weight.\n• Full Market Value: The assessed pure gold is credited directly at the day's official live rate against new 22K 916 hallmarked ornaments or silver articles.`;
  }

  // 9. BIS Hallmark & HUID Certification
  if (q.includes('hallmark') || q.includes('bis') || q.includes('916') || q.includes('huid') || q.includes('certificate') || q.includes('purity') || q.includes('guarantee')) {
    return `100% BIS 916 Hallmark & Laser HUID Assurance:\n\nEvery gold piece crafted by Latha Jewellery Works carries the official three-part BIS hallmark:\n1. BIS Triangular Logo\n2. 916 Purity Indicator (22 Karat standard)\n3. 6-digit alphanumeric HUID (Hallmark Unique Identification) traceable via the Government BIS Care app.`;
  }

  // 10. Pricing & Making Charges Formula
  if (q.includes('price') || q.includes('cost') || q.includes('making charge') || q.includes('wastage') || q.includes('calculate') || q.includes('estimate') || q.includes('how much')) {
    return `Transparent Pricing Calculation Standard:\n\nFinal jewellery prices are computed strictly and transparently:\n• Gold Cost = Net Weight in Grams × Live Rate for Purity (22K / 18K / 24K)\n• Making Charges = Based on the intricate handcrafting hours of the master karigar\n• Applicable GST (3%)\n\nBecause live bullion rates fluctuate daily, exact final quotes are confirmed at the atelier on the day of your order. Call or WhatsApp ${STORE_METADATA.phone} for an instant quotation!`;
  }

  // 11. Clarification Question for Vague Queries
  if (q.includes('necklace') || q.includes('wedding') || q.includes('bridal') || q.includes('gift')) {
    return `We would be delighted to assist you! To help our master goldsmiths recommend the perfect design, could you clarify:\n\n1. Are you looking for daily-wear elegance (like our [Royal Interlock Gold Chain](/product/1) at 24g) or a grand traditional bridal piece (like our [Heritage Bridal Haram](/product/7) at 60g)?\n2. Do you have a preferred target weight range in grams?\n3. Would you like a piece from our current collection, or would you like to share a custom reference design?\n\nYou can also browse our [Chains & Necklaces Collection](/collections/chains-necklaces) or chat with us on WhatsApp at ${STORE_METADATA.phone}.`;
  }

  // 12. Knowledge Snippets Fallback
  if (context.knowledgeSnippets) {
    return `Based on our atelier records:\n\n${context.knowledgeSnippets}\n\nFor personal assistance, bespoke designs, or today's live rates, please connect directly with our atelier at ${STORE_METADATA.phone}.`;
  }

  // 13. General Safe Fallback
  return `Thank you for contacting Latha Jewellery Works. While I don't have verified records for that specific detail, our master goldsmiths in Nadaikavu, Tamil Nadu are glad to assist you personally.\n\nPlease connect directly on WhatsApp or call ${STORE_METADATA.phone}, and we will be delighted to help with our handcrafted collections, custom orders, or live rates!`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. POST is required.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const userMessage = (typeof body?.message === 'string' ? body.message : '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    // 1. Check Talabat delivery tracking intent first
    const deliveryReply = handleDeliveryTracking(userMessage);
    if (deliveryReply) {
      return res.status(200).json({
        success: true,
        reply: deliveryReply,
        provider: 'delivery_tracker',
        grounded: true,
        timestamp: new Date().toISOString()
      });
    }

    const activeRates = body?.activeRates || body?.gold_rates || null;
    const history = Array.isArray(body?.history) ? body.history : [];
    const context = await buildChatContext(userMessage, activeRates);

    let contextParts = [];

    // Store identity & policies
    contextParts.push(`[STORE METADATA & IDENTITY]:
Name: ${STORE_METADATA.name}
Founded: ${STORE_METADATA.establishedYear} in Nadaikavu, Tamil Nadu (over 34 years of handcrafted heritage)
Address: ${STORE_METADATA.address} (Plus Code: ${STORE_METADATA.plusCode})
Phone & WhatsApp: ${STORE_METADATA.phone}
Hours: ${STORE_METADATA.workingHours}
Hallmark Standard: ${STORE_METADATA.hallmarkStandard}
Old Gold Exchange: ${STORE_METADATA.exchangeStandard}
Showroom Note: ${STORE_METADATA.serviceModel}
IMPORTANT: The atelier is strictly in Nadaikavu, Tamil Nadu. Never mention Bangalore or Karnataka.`);

    // Active Live Rates
    if (context.currentRates && context.currentRates.rate_22k) {
      contextParts.push(`[ACTIVE VERIFIED BULLION RATES (MATCHING TOP TICKER BANNER)]:
• 22K Standard Gold (BIS 916): ₹${context.currentRates.rate_22k}/g
• 24K Pure Gold: ₹${context.currentRates.rate_24k}/g
• 18K Diamond Gold: ₹${context.currentRates.rate_18k}/g
• Silver: ₹${context.currentRates.rate_silver}/g
When answering rate questions, use ONLY these exact numbers.`);
    }

    // Matched Products with Links
    if (context.productContext) {
      contextParts.push(`[MATCHED PRODUCTS FROM CATALOGUE]:\n${context.productContext}`);
    }

    // Matched Categories
    if (context.categoryContext) {
      contextParts.push(`[MATCHED CATEGORIES]:\n${context.categoryContext}`);
    }

    // Knowledge Snippets
    if (context.knowledgeSnippets) {
      contextParts.push(`[VERIFIED KNOWLEDGE CHUNKS]:\n${context.knowledgeSnippets}`);
    }

    const contextText = contextParts.join('\n\n');

    const systemPrompt = `You are the official Atelier Concierge for "Latha Jewellery Works", a prestigious handcrafted fine jewellery atelier established in 1990 in Nadaikavu, Tamil Nadu.

STRICT INSTRUCTIONS:
1. ONLY state verified business facts, specifications, and prices provided in the verified context. NEVER invent product availability, prices, discounts, policies, or gemstone certifications.
2. For gold rates, cite the exact numbers from the context. All gold jewellery is 100% BIS 916 hallmarked with 6-digit laser HUID.
3. Pricing formula: Final Price = Net Weight (in grams) × Live Rate for purity + Making Charges (for artisan complexity) + 3% GST. Explain that exact quotes are confirmed at the atelier.
4. When mentioning products or categories, use markdown links like [Product Name](/product/:id) or [Category Name](/collections/:slug) so customers can navigate directly on the website.
5. If the customer inquiry is vague or broad, politely ask helpful clarifying questions (e.g., daily wear vs bridal, target weight in grams, or occasion).
6. Provide human contact escalation (+91 9487056064 on WhatsApp/Phone) for custom orders, bridal suites, and reservations.
7. Maintain an elegant, luxurious, warm, and professional tone. Avoid markdown tables or robotic clichés.`;

    let reply = null;
    let providerUsed = 'grounded_rules_engine';

    if (GEMINI_API_KEY) {
      try {
        reply = await callGeminiSDK(systemPrompt, userMessage, contextText, history);
        providerUsed = 'google_gemini_sdk';
      } catch (sdkErr) {
        console.warn('[CustomAI] Gemini SDK call failed, trying REST:', sdkErr.message);
        try {
          reply = await callGeminiRest(systemPrompt, userMessage, contextText);
          providerUsed = 'google_gemini_rest';
        } catch (restErr) {
          console.warn('[CustomAI] Gemini REST call failed, falling back:', restErr.message);
        }
      }
    } else if (OPENAI_API_KEY) {
      try {
        reply = await callOpenAICompatible(OPENAI_API_KEY, 'https://api.openai.com/v1', 'gpt-4o-mini', systemPrompt, userMessage, contextText);
        providerUsed = 'openai';
      } catch (err) {
        console.warn('[CustomAI] OpenAI call failed, falling back:', err.message);
      }
    } else if (GROQ_API_KEY) {
      try {
        reply = await callOpenAICompatible(GROQ_API_KEY, 'https://api.groq.com/openai/v1', 'llama-3.3-70b-versatile', systemPrompt, userMessage, contextText);
        providerUsed = 'groq';
      } catch (err) {
        console.warn('[CustomAI] Groq call failed, falling back:', err.message);
      }
    }

    if (!reply) {
      reply = generateGroundedFallback(userMessage, context);
      providerUsed = 'grounded_rules_engine';
    }

    return res.status(200).json({
      success: true,
      reply,
      provider: providerUsed,
      grounded: true,
      needsGoldRate: context.needsGoldRate,
      rates: context.currentRates || null,
      matchedProducts: context.matchedProducts || [],
      matchedCategories: context.matchedCategories || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CustomAI] Handler Error:', error);
    return res.status(200).json({
      success: true,
      reply: `Thank you for contacting Latha Jewellery Works. For immediate personal assistance with our handcrafted 22K BIS 916 collections or today's live bullion rates, please connect directly with our atelier at ${STORE_METADATA.phone} (Phone/WhatsApp).`,
      provider: 'safety_fallback',
      grounded: true
    });
  }
}