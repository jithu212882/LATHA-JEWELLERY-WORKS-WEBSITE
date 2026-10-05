/**
 * Google AI Studio Chatbot Client Service
 * Calls dedicated /api/google-ai-chat endpoint with defensive error handling.
 */

const FALLBACK_ERROR_MESSAGE = "I'm unable to process that request right now. Please try again or contact Latha Jewellery Works directly on WhatsApp at +91 9487056064.";

export async function sendGoogleAIChatMessage(message, history = []) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      success: false,
      reply: 'Please enter a valid message for the Google AI Studio atelier concierge.'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch('/api/google-ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        message: message.trim(),
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

    if (!response.ok || !data) {
      console.warn('[GoogleAIService] HTTP Error from endpoint:', response.status);
      return {
        success: false,
        reply: (data && typeof data.error === 'string')
          ? `${data.error} Please contact Latha Jewellery Works at +91 9487056064.`
          : FALLBACK_ERROR_MESSAGE
      };
    }

    return {
      success: true,
      reply: typeof data.reply === 'string' && data.reply.trim().length > 0
        ? data.reply.trim()
        : FALLBACK_ERROR_MESSAGE,
      source: data.source || 'google_ai_studio',
      rates: data.rates || null
    };

  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('[GoogleAIService] Network or endpoint warning:', error.message);
    return {
      success: false,
      reply: FALLBACK_ERROR_MESSAGE,
      error: error.message
    };
  }
}
