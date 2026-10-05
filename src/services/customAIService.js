/**
 * Frontend client service for Latha Jewellery Works Custom AI Chatbot.
 * Communicates strictly with the secure backend endpoint /api/custom-ai-chat.
 * Never exposes AI credentials or secret keys to the browser.
 * Highly defensive against non-200 responses, network drops, and malformed JSON.
 */

const FALLBACK_ERROR_MESSAGE =
  "I'm unable to process that request right now. Please try again or contact Latha Jewellery Works directly on WhatsApp at +91 9487056064.";

export async function sendChatMessage(message, history = []) {
  try {
    const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 1000) : '';
    if (!cleanMessage) {
      return {
        success: false,
        reply: "Please type a question or jewellery enquiry to proceed.",
        grounded: true
      };
    }

    const cleanHistory = Array.isArray(history)
      ? history
          .filter((h) => h && typeof h === 'object' && h.text)
          .slice(-6)
          .map((h) => ({
            sender: h.sender === 'user' ? 'user' : 'assistant',
            text: typeof h.text === 'string' ? h.text.slice(0, 300) : ''
          }))
      : [];

    // 15 second request timeout safeguard
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch('/api/custom-ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: cleanMessage,
          history: cleanHistory
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Safely parse JSON
    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.warn('[CustomAIService] Response body was not valid JSON:', parseErr.message);
    }

    if (!response.ok || !data) {
      console.warn('[CustomAIService] HTTP Error from endpoint:', response.status);
      return {
        success: false,
        reply: (data && typeof data.error === 'string')
          ? `${data.error} Please contact Latha Jewellery Works at +91 9487056064.`
          : FALLBACK_ERROR_MESSAGE,
        error: `HTTP ${response.status}`
      };
    }

    const replyText = typeof data.reply === 'string' && data.reply.trim()
      ? data.reply.trim()
      : FALLBACK_ERROR_MESSAGE;

    return {
      success: true,
      reply: replyText,
      provider: data.provider || 'grounded_rules_engine',
      grounded: Boolean(data.grounded)
    };
  } catch (error) {
    console.warn('[CustomAIService] Network or endpoint warning:', error.message);
    return {
      success: false,
      reply: FALLBACK_ERROR_MESSAGE,
      error: error.message
    };
  }
}