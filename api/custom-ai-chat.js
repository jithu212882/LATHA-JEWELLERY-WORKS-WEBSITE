import { buildChatContext } from '../server/knowledge/retriever.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || null;
const GROQ_API_KEY = process.env.GROQ_API_KEY || null;

async function callGemini(systemPrompt, userMessage, contextText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n[VERIFIED BUSINESS CONTEXT]:\n${contextText}\n\n[CUSTOMER QUESTION]:\n${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
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
      max_tokens: 600,
      messages: [
        { role: 'system', content: `${systemPrompt}\n\n[VERIFIED BUSINESS CONTEXT]:\n${contextText}` },
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

function generateGroundedFallback(userMessage, context) {
  const q = (userMessage || '').toLowerCase();

  if (context.needsGoldRate && context.goldRateContext) {
    return `${context.goldRateContext}\n\nPlease note that gold rates change daily in response to bullion market movements. You are welcome to contact our master goldsmiths at +91 9487056064 for exact custom design quotes.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('vanakkam') || q.includes('namaste')) {
    return "Welcome to Latha Jewellery Works! Established in 1990 in Chathencode, we handcraft authentic 22K (916) hallmarked gold ornaments, traditional bridal heirlooms, and silver pieces. How may I assist you today? You can ask about today's live gold rates, our jewellery collections, store timings, or custom designs.";
  }

  if (q.includes('where') || q.includes('location') || q.includes('address') || q.includes('timing') || q.includes('hour') || q.includes('phone') || q.includes('contact')) {
    return "Latha Jewellery Works is located at Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu (Plus Code: 74VX+7G Nadaikavu).\n\nWorking Hours: Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only).\nPhone & WhatsApp: +91 9487056064.";
  }

  if (q.includes('buy') || q.includes('order') || q.includes('cart') || q.includes('checkout') || q.includes('online')) {
    return "Our website is designed as a curated digital jewellery catalogue rather than an automated checkout store. To enquire about or order any piece, simply click the 'Enquire' button on the design or connect directly with our atelier on WhatsApp at +91 9487056064.";
  }

  if (q.includes('collection') || q.includes('category') || q.includes('bangle') || q.includes('chain') || q.includes('ring') || q.includes('earring') || q.includes('kolus') || q.includes('haram')) {
    return "We showcase five master collections:\n1. Chains & Necklaces (Royal interlock, rope chains, bridal harams)\n2. Kolus (Handcrafted gold & silver anklets)\n3. Kammal (Antique temple jimkis & studs)\n4. Bangles & Valayal (Hand-engraved 22K bangles)\n5. Rings (Filigree engagement & signet rings)\n\nYou can browse our live catalogue on the website or enquire about bespoke weights with our goldsmiths.";
  }

  if (q.includes('custom') || q.includes('make') || q.includes('exchange') || q.includes('repair') || q.includes('hallmark') || q.includes('old gold')) {
    return "At Latha Jewellery Works, our artisans specialize in bespoke goldsmithing. Bring any reference picture or heirloom piece, and we will hand-craft it to your desired purity (22K BIS 916) and weight. We also offer transparent old gold exchange and master restoration services.";
  }

  if (context.knowledgeSnippets) {
    return `Based on our atelier records:\n${context.knowledgeSnippets}\n\nFor more details or custom requests, feel free to call or WhatsApp us at +91 9487056064.`;
  }

  return "I don't have verified information about that specific query at the moment. Please contact Latha Jewellery Works directly at +91 9487056064 or visit our atelier in Nadaikavu, and our team will be delighted to assist you!";
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

    const userMessage = (body?.message || '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const context = await buildChatContext(userMessage);

    let contextParts = [];
    if (context.goldRateContext) {
      contextParts.push(`[LATEST VALIDATED GOLD RATES]: ${context.goldRateContext}`);
    }
    if (context.knowledgeSnippets) {
      contextParts.push(`[RELEVANT LATHA JEWELLERY KNOWLEDGE]:\n${context.knowledgeSnippets}`);
    }

    const contextText = contextParts.length > 0 ? contextParts.join('\n\n') : 'No specific knowledge chunk matched.';

    const systemPrompt = `You are the Atelier Concierge for Latha Jewellery Works (Est. 1990 in Chathencode, Tamil Nadu).
You provide helpful, elegant, and strictly grounded customer support for website visitors.

CRITICAL RULES:
1. ONLY answer using the verified business facts and validated gold rates provided in the context below.
2. If the user asks for gold rates, use ONLY the verified rates in the context. NEVER invent, guess, or extrapolate gold or silver prices.
3. If the requested information is not available in the context, clearly and politely say that you do not have verified details on that, and guide the customer to contact Latha Jewellery Works directly on WhatsApp/Phone at +91 9487056064.
4. The website is a digital catalogue showroom, NOT an online checkout store. For purchasing or custom orders, advise customers to enquire or message on WhatsApp.
5. Keep your tone polite, professional, luxurious, and concise. Avoid robotic cliches, markdown tables, or excessive emojis.`;

    let reply = null;
    let providerUsed = 'grounded_rules_engine';

    if (GEMINI_API_KEY) {
      try {
        reply = await callGemini(systemPrompt, userMessage, contextText);
        providerUsed = 'google_gemini';
      } catch (err) {
        console.warn('[CustomAI] Gemini call failed, falling back:', err.message);
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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CustomAI] API Error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
}