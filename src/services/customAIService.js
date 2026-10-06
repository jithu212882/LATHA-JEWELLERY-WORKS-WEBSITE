/**
 * Frontend client service for Latha Jewellery Works Custom AI Chatbot.
 * Communicates strictly with the secure backend endpoint /api/custom-ai-chat.
 * Never exposes AI credentials or secret keys to the browser.
 * Highly defensive against non-200 responses, network drops, and malformed JSON.
 */

const FALLBACK_GROUNDED_REPLY =
  "Welcome to Latha Jewellery Works. For custom bridal jewellery, live gold rates, or old gold exchange, our atelier is gladly available at +91 9487056064 (Phone/WhatsApp).";

function getClientCustomFallback(lower, activeRates = null) {
  if (lower.includes('rate') || lower.includes('gold') || lower.includes('silver')) {
    if (activeRates && (activeRates.rate_22k || activeRates.rate_24k)) {
      return `Today's Official Rates at Latha Jewellery Works:\n• 22K Gold (916 Hallmarked): ₹${activeRates.rate_22k}/g\n• 24K Pure Gold: ₹${activeRates.rate_24k}/g\n• 18K Gold: ₹${activeRates.rate_18k || '11,027'}/g\n• Silver: ₹${activeRates.rate_silver || '95'}/g\n\nAll jewellery is 100% BIS 916 hallmarked with 6-digit laser HUID purity authentication. Daily bullion rates are updated live to match our atelier board rates.`;
    }
    return "For today's official live gold rates (22K, 24K, 18K, and Silver), please check our live rate ticker banner at the top of the page or contact our atelier directly on WhatsApp at +91 9487056064.";
  }
  if (/\b(track|tracking|delivery)\b/i.test(lower) || /\bwhere\s+(is|are|'s)\s+.*order\b/i.test(lower) || /\bstatus\s+of\s+.*order\b/i.test(lower)) {
    return "Please provide your Order ID (1 to 50) to check your live delivery status.";
  }
  if (lower.includes('custom') || lower.includes('bespoke') || (lower.includes('order') && !lower.includes('track') && !lower.includes('where'))) {
    return "At Latha Jewellery Works, our generational karigars specialize in bespoke bridal and temple ornaments. Bring any reference picture or heirloom piece, and we will hand-craft it to your desired purity (22K BIS 916) and weight.";
  }
  if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('timing') || lower.includes('hour')) {
    return "Latha Jewellery Works is located at Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu.\nWorking Hours: Monday to Saturday 9:30 AM - 8:00 PM (Sundays by appointment only).\nPhone/WhatsApp: +91 9487056064.";
  }
  return FALLBACK_GROUNDED_REPLY;
}

export async function sendChatMessage(message, history = [], activeRates = null) {
  try {
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 1000) : '';
    if (!cleanMessage) {
      return {
        success: false,
        reply: "Please type a question or jewellery enquiry to proceed.",
        grounded: true
      };
    }

    const lower = cleanMessage.toLowerCase();

    const cleanHistory = Array.isArray(history)
      ? history
          .filter((h) => h && typeof h === 'object' && h.text)
          .slice(-6)
          .map((h) => ({
            sender: h.sender === 'user' ? 'user' : 'assistant',
            text: typeof h.text === 'string' ? h.text.slice(0, 300) : ''
          }))
      : [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let response;
    try {
      response = await fetch('/api/custom-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: cleanMessage,
          history: cleanHistory,
          activeRates: activeRates
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn('[CustomAIService] Response body was not valid JSON:', parseErr.message);
    }

    if (response.ok && data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
      return {
        success: true,
        reply: data.reply.trim(),
        provider: data.provider || 'grounded_rules_engine',
        grounded: Boolean(data.grounded)
      };
    }

    return {
      success: true,
      reply: (data && typeof data.reply === 'string') ? data.reply : getClientCustomFallback(lower, activeRates),
      provider: 'client_grounded_fallback',
      grounded: true
    };
  } catch (error) {
    console.warn('[CustomAIService] Network or endpoint warning:', error.message);
    const lower = typeof message === 'string' ? message.toLowerCase() : '';
    return {
      success: true,
      reply: getClientCustomFallback(lower, activeRates),
      provider: 'offline_grounded_fallback',
      grounded: true
    };
  }
}
