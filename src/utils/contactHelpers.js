/**
 * Contact & messaging utilities for Latha Jewellery Works
 */

/**
 * Builds an RFC-compliant mailto URI with pre-filled subject and structured inquiry template.
 * @param {string} email - Destination email address
 * @param {string} [customSubject] - Optional custom subject line
 * @param {string} [customBody] - Optional custom body text
 * @returns {string} Fully encoded mailto: URL
 */
export function getEmailMailtoUrl(email = 'lathajewelleryworks@gmail.com', customSubject = '', customBody = '') {
  const targetEmail = (email && email.trim()) || 'lathajewelleryworks@gmail.com';
  const subject = customSubject || 'Jewellery Enquiry — Latha Jewellery Works';
  const body = customBody || [
    'Hello Latha Jewellery Works,',
    '',
    'I would like to enquire about your handcrafted jewellery collections and custom orders.',
    '',
    '• Name: ',
    '• Phone / WhatsApp: ',
    '• Interested In: (e.g. Bridal Haram, 22K Gold Chain, Bangles, Kolus, Rings, Custom Design)',
    '• Message / Requirements: ',
    '',
    'Thank you!'
  ].join('\r\n');

  return `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
