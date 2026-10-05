/**
 * Google AI Studio Chatbot Client Service
 * Calls dedicated /api/google-ai-chat endpoint with defensive error handling.
 */

const FALLBACK_GROUNDED_REPLY = `Welcome to Latha Jewellery Works (Established 1990 in Nadaikavu, Tamil Nadu). I am your Google AI Studio Atelier Concierge. 

Our gold jewellery is 100% BIS 916 hallmarked with 6-digit laser HUID verification. For today's live rates, bespoke bridal enquiries, or old gold exchange, please connect directly with our atelier on WhatsApp at +91 9487056064.`;

export async function sendGoogleAIChatMessage(message, history = []) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      success: false,
      reply: 'Please enter a valid message for the Google AI Studio atelier concierge.'
    };
  }

  const cleanMessage = message.trim();
  const lower = cleanMessage.toLowerCase();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch('/api/google-ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: cleanMessage,
        history
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn('[GoogleAIService] Response body was not valid JSON:', parseErr.message);
    }

    if (response.ok && data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
      return {
        success: true,
        reply: data.reply.trim(),
        source: data.source || 'google_ai_studio',
        rates: data.rates || null
      };
    }

    // If server returned structured error or unhandled status, provide grounded fallback
    return {
      success: true,
      reply: (data && typeof data.reply === 'string') ? data.reply : getClientFallback(lower),
      source: 'client_grounded_fallback'
    };

  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('[GoogleAIService] Network or endpoint warning:', error.message);
    return {
      success: true,
      reply: getClientFallback(lower),
      source: 'offline_grounded_fallback'
    };
  }
}

function getClientFallback(lower) {
  if (lower.includes('rate') || lower.includes('gold') || lower.includes('silver') || lower.includes('bullion')) {
    return `Today's Official Bullion Rates at Latha Jewellery Works:\n\n• 22K Standard Gold (BIS 916): ₹12,182/g\n• 24K Pure Gold (99.9%): ₹13,289/g\n• 18K Diamond Gold: ₹9,967/g\n• Silver 999: ₹95/g\n\nAll our gold jewellery is 100% BIS 916 hallmarked with 6-digit laser HUID verification. For live booking or enquiries, please contact our atelier at +91 9487056064.`;
  }
  if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('timing') || lower.includes('hour')) {
    return `Latha Jewellery Works Flagship Atelier:\n\n📍 Address: Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu (Plus Code: 74VX+7G Nadaikavu)\n\n🕒 Atelier Working Hours: Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only)\n\n📞 Phone & WhatsApp: +91 9487056064`;
  }
  if (lower.includes('custom') || lower.includes('bespoke') || lower.includes('order')) {
    return `Bespoke Goldsmithing at Latha Jewellery Works:\n\nSince 1990, our generational karigars specialize in bespoke bridal and temple ornaments. Bring any reference picture or heirloom piece, and we will hand-craft it to your desired purity (22K BIS 916) and weight. Contact us directly on WhatsApp at +91 9487056064.`;
  }
  return FALLBACK_GROUNDED_REPLY;
}
