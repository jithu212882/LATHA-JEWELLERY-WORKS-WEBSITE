/**
 * Frontend client service for Latha Jewellery Works Atelier Concierge.
 * Communicates strictly with the backend endpoint /api/custom-ai-chat.
 * Features comprehensive offline/network-resilient grounded responses.
 */

const FALLBACK_GROUNDED_REPLY =
  "Welcome to Latha Jewellery Works (Established 1990 in Nadaikavu, Tamil Nadu). For custom bridal jewellery, today's live bullion rates, or bespoke goldsmithing, our atelier team is gladly available at +91 9487056064 (Phone/WhatsApp).";

const CLIENT_PRODUCTS = [
  { id: 1, name: 'Royal Interlock Gold Chain', route: '/product/1', minWeight: '24 Grams', purity: '22K (916 Hallmarked)', cat: 'Chains & Necklaces', catRoute: '/collections/chains-necklaces', kw: ['interlock', 'royal', 'chain'] },
  { id: 2, name: 'Traditional Ghungroo Kolus', route: '/product/2', minWeight: '35 Grams', purity: '22K Gold & Silver', cat: 'Kolus (Anklets)', catRoute: '/collections/kolus', kw: ['kolus', 'anklet', 'ghungroo'] },
  { id: 3, name: 'Antique Temple Jimki Kammal', route: '/product/3', minWeight: '12 Grams', purity: '22K (916 Hallmarked)', cat: 'Kammal (Earrings)', catRoute: '/collections/kammal', kw: ['jimki', 'kammal', 'jhumka', 'earring'] },
  { id: 4, name: 'Hand-Engraved Gold Bangles (Set of 4)', route: '/product/4', minWeight: '48 Grams', purity: '22K (916 Hallmarked)', cat: 'Bangles & Bracelets', catRoute: '/collections/bangles-bracelets', kw: ['bangle', 'bangles', 'valayal', 'kada'] },
  { id: 5, name: 'Regal Filigree Gold Ring', route: '/product/5', minWeight: '8 Grams', purity: '22K (916 Hallmarked)', cat: 'Rings', catRoute: '/collections/rings', kw: ['ring', 'filigree', 'signet'] },
  { id: 6, name: 'Classic Twisted Rope Chain', route: '/product/6', minWeight: '30 Grams', purity: '22K (916 Hallmarked)', cat: 'Chains & Necklaces', catRoute: '/collections/chains-necklaces', kw: ['rope', 'twisted'] },
  { id: 7, name: 'Heritage Bridal Haram', route: '/product/7', minWeight: '60 Grams', purity: '22K (916 Hallmarked)', cat: 'Chains & Necklaces', catRoute: '/collections/chains-necklaces', kw: ['bridal', 'haram', 'wedding necklace'] }
];

function getClientCustomFallback(lower, activeRates = null) {
  // 1. Live Gold & Silver Rates
  if (lower.includes('rate') || lower.includes('gold') || lower.includes('silver') || lower.includes('bullion') || lower.includes('22k') || lower.includes('24k') || lower.includes('18k')) {
    if (activeRates && (activeRates.rate_22k || activeRates.rate_24k)) {
      return `Today's Official Bullion Rates at Latha Jewellery Works:\n\n• 22K Standard Gold (BIS 916): ₹${activeRates.rate_22k}/g\n• 24K Pure Bullion Gold: ₹${activeRates.rate_24k}/g\n• 18K Diamond Gold: ₹${activeRates.rate_18k || '11,027'}/g\n• Silver: ₹${activeRates.rate_silver || '95'}/g\n\nAll our jewellery is 100% BIS 916 hallmarked with 6-digit laser HUID authentication. Live rates are updated daily. For live bookings, connect directly on WhatsApp at +91 9487056064.`;
    }
    return "For today's official live gold rates (22K, 24K, 18K, and Silver), please check our live rate ticker at the top of the website or connect directly with our master goldsmiths on WhatsApp at +91 9487056064.";
  }

  // 2. Greetings
  if (/^(hello|hi|hey|vanakkam|namaste|good\s*(morning|afternoon|evening))\b/i.test(lower)) {
    return "Vanakkam and welcome to Latha Jewellery Works! Established in 1990 in Nadaikavu, Tamil Nadu, our master goldsmiths handcraft authentic 22K (916) BIS hallmarked gold ornaments, bridal heirlooms, and silver articles.\n\nHow may I assist you today? You can ask about:\n• Today's live gold & silver rates\n• Handcrafted collections (chains, harams, jimkis, bangles, kolus)\n• Bespoke custom design orders\n• Store location & visiting hours\n• Old gold exchange valuation";
  }

  // 3. Human Escalation & Contact Assistance
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('call') || lower.includes('reach') || lower.includes('number') || lower.includes('human') || lower.includes('manager') || lower.includes('owner') || lower.includes('goldsmith') || lower.includes('karigar')) {
    return "You can connect directly with our master goldsmiths and atelier team:\n\n• Phone & WhatsApp: +91 9487056064\n• Email: lathajewelleryworks@gmail.com\n• Atelier Address: Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu\n• Timings: Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only)\n\nFor custom bridal orders, design consultations, or piece reservations, connect with us on WhatsApp (+91 9487056064) or call directly!";
  }

  // 4. Delivery Tracking
  if (/\b(track|tracking|delivery)\b/i.test(lower) || /\bwhere\s+(is|are|'s)\s+.*order\b/i.test(lower) || /\bstatus\s+of\s+.*order\b/i.test(lower)) {
    return "Please provide your Order ID (1 to 50) to verify your live delivery status.";
  }

  // 5. Products
  const matched = CLIENT_PRODUCTS.find(p => p.kw.some(k => lower.includes(k)));
  if (matched) {
    return `Verified specifications for ${matched.name}:\n\n• Category: [${matched.cat}](${matched.catRoute})\n• Minimum Crafted Weight: ${matched.minWeight}\n• Purity: ${matched.purity}\n• Product Page: [View ${matched.name}](${matched.route})\n\nEstimated Price: Net Weight × Today's Live 22K Rate + Making Charges + 3% GST. Exact final quotes are confirmed at our atelier. Would you like to consult our goldsmiths on WhatsApp (+91 9487056064)?`;
  }

  // 6. Collections
  if (lower.includes('collection') || lower.includes('category') || lower.includes('catalogue') || lower.includes('show') || lower.includes('what do you have')) {
    return `Explore our master jewellery collections:\n\n1. [Chains & Necklaces](/collections/chains-necklaces)\n2. [Kolus / Anklets](/collections/kolus)\n3. [Kammal / Earrings](/collections/kammal)\n4. [Bangles & Valayal](/collections/bangles-bracelets)\n5. [Rings](/collections/rings)\n\nYou can also [Browse Complete Collections](/collections) or WhatsApp us at +91 9487056064 for bespoke design quotes.`;
  }

  // 7. Store Location & Timings
  if (lower.includes('location') || lower.includes('where') || lower.includes('address') || lower.includes('timing') || lower.includes('hour') || lower.includes('open') || lower.includes('sunday') || lower.includes('bangalore') || lower.includes('bengaluru')) {
    return `Latha Jewellery Works Flagship Atelier:\n\n📍 Address: Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu (Plus Code: 74VX+7G Nadaikavu)\n🕒 Working Hours: Monday to Saturday from 9:30 AM to 8:00 PM (Sundays by appointment only)\n📞 Phone & WhatsApp: +91 9487056064\n\n(We are located in Nadaikavu, Tamil Nadu — no branches in Bangalore).`;
  }

  // 8. Custom & Bespoke Orders
  if (lower.includes('custom') || lower.includes('bespoke') || lower.includes('sketch') || lower.includes('photo') || (lower.includes('order') && !lower.includes('track'))) {
    return `Bespoke Goldsmithing at Latha Jewellery Works:\n\nSince 1990, our master karigars craft bespoke bridal and temple jewellery from your reference photographs, heirlooms, or sketches. Crafted in 22K BIS 916 hallmarked purity to your desired weight in grams. Connect directly on WhatsApp at +91 9487056064 to discuss your custom design.`;
  }

  // 9. Pricing Formula & Making Charges
  if (lower.includes('price') || lower.includes('cost') || lower.includes('making charge') || lower.includes('wastage') || lower.includes('calculate') || lower.includes('formula') || lower.includes('how much')) {
    return "Transparent Jewellery Price Calculation:\n\nFinal prices are calculated strictly and transparently:\n• Gold Value = Net Weight (in grams) × Live Rate for Purity (22K / 18K / 24K)\n• Making Charges = Based on the intricate handcrafting hours of the master karigar\n• Applicable GST (3%)\n\nBecause live bullion rates fluctuate daily, exact final quotes are confirmed at our atelier on the day of your order. Contact WhatsApp +91 9487056064 for an instant estimate.";
  }

  // 10. Helpful Clarifying Questions for Vague Queries
  if (lower.includes('necklace') || lower.includes('wedding') || lower.includes('bridal') || lower.includes('gift')) {
    return "We would be delighted to assist you! To help our master goldsmiths recommend the perfect design, could you clarify:\n\n1. Are you looking for daily-wear elegance (like our [Royal Interlock Gold Chain](/product/1) at 24g) or a grand traditional bridal piece (like our [Heritage Bridal Haram](/product/7) at 60g)?\n2. Do you have a preferred target weight range in grams?\n3. Would you like a piece from our current collection, or would you like to share a custom reference design?\n\nYou can also browse our [Chains & Necklaces Collection](/collections/chains-necklaces) or chat with us on WhatsApp at +91 9487056064.";
  }

  // 11. Old Gold Exchange
  if (lower.includes('exchange') || lower.includes('old gold') || lower.includes('karatometer')) {
    return `100% Transparent Old Gold Exchange:\n\n• Assessed transparently using computerized Karatometer spectrometer.\n• Zero melting deduction on pure gold weight.\n• Full market value credited against new 22K 916 hallmarked ornaments at live rates.`;
  }

  // 12. Hallmark & Certification
  if (lower.includes('hallmark') || lower.includes('huid') || lower.includes('bis')) {
    return `100% BIS 916 Hallmark Assurance:\n\nEvery gold ornament carries the official three-part BIS hallmark with triangular logo, 916 purity mark, and 6-digit laser HUID traceable via the official BIS Care app.`;
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
        grounded: Boolean(data.grounded),
        rates: data.rates || null,
        matchedProducts: data.matchedProducts || []
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
