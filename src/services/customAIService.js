/**
 * Frontend client service for Latha Jewellery Works Custom AI Chatbot.
 * Communicates strictly with the secure backend endpoint /api/custom-ai-chat.
 * Never exposes AI credentials or secret keys to the browser.
 */

export async function sendChatMessage(message, history = []) {
  try {
    const response = await fetch('/api/custom-ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.slice(-6)
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      reply: data.reply || 'Thank you for reaching out. Please contact Latha Jewellery Works at +91 9487056064 for immediate assistance.',
      provider: data.provider,
      grounded: data.grounded
    };
  } catch (error) {
    console.warn('[CustomAIService] Network or endpoint warning:', error.message);
    return {
      success: false,
      reply: 'We are currently connecting to the atelier network. For immediate assistance with today\'s gold rates or bespoke jewellery enquiries, please reach us on WhatsApp at +91 9487056064.',
      error: error.message
    };
  }
}