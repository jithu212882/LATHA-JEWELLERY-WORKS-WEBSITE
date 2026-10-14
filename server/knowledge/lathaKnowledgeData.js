/**
 * Curated knowledge chunks for Latha Jewellery Works.
 * Grounded directly in official business records, catalogue models, and verified store specifications.
 * Used for targeted retrieval in the Latha Atelier Concierge.
 */

export const STORE_METADATA = {
  name: 'Latha Jewellery Works',
  tagline: 'Handcrafted 22K Gold & Silver Atelier',
  establishedYear: '1990',
  address: 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu',
  landmark: 'Near Government Primary School, Nadaikavu',
  plusCode: '74VX+7G Nadaikavu, Tamil Nadu',
  phone: '+91 9487056064',
  whatsapp: '+91 9487056064',
  whatsappLink: 'https://wa.me/919487056064',
  email: 'lathajewelleryworks@gmail.com',
  workingHours: 'Monday to Saturday: 9:30 AM – 8:00 PM. Sunday: Open by appointment only.',
  hallmarkStandard: '100% BIS 916 Hallmarked Gold with official 6-digit laser HUID verification (traceable via official BIS Care app)',
  exchangeStandard: 'Transparent old gold exchange evaluated using computerized Karatometer spectrometer with zero melting deduction on pure gold',
  serviceModel: 'Curated digital showroom and bespoke atelier. Orders and customization are coordinated via atelier visits or direct WhatsApp consultation (+91 9487056064).'
};

export const VERIFIED_PRODUCTS = [
  {
    id: 1,
    name: 'Royal Interlock Gold Chain',
    category: 'Chains & Necklaces',
    categorySlug: 'chains-necklaces',
    route: '/product/1',
    categoryRoute: '/collections/chains-necklaces',
    minWeight: '24 Grams',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Exquisite 22k gold interconnected link chain crafted for daily elegance and durability. Soft mirror-polished facets catch ambient light with unmatched brilliance.',
    keywords: ['royal', 'interlock', 'chain', 'links', 'necklace', 'daily wear', '24g', '24 grams']
  },
  {
    id: 2,
    name: 'Traditional Ghungroo Kolus',
    category: 'Kolus (Anklets)',
    categorySlug: 'kolus',
    route: '/product/2',
    categoryRoute: '/collections/kolus',
    minWeight: '35 Grams',
    purity: '22K Gold & 92.5 Sterling Silver',
    description: 'Heritage solid gold anklet adorned with delicate hand-assembled ghungroo bells that emit a rhythmic chime. A cherished family heirloom piece.',
    keywords: ['kolus', 'anklet', 'ghungroo', 'bells', 'silver', 'payal', '35g', '35 grams']
  },
  {
    id: 3,
    name: 'Antique Temple Jimki Kammal',
    category: 'Kammal (Earrings)',
    categorySlug: 'kammal',
    route: '/product/3',
    categoryRoute: '/collections/kammal',
    minWeight: '12 Grams',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Intricate antique finish gold jimki earrings adorned with natural ruby cabochons and freshwater pearl drops. Forged using traditional die-struck techniques.',
    keywords: ['kammal', 'jimki', 'jhumka', 'earring', 'ruby', 'pearl', 'temple', 'antique', '12g', '12 grams']
  },
  {
    id: 4,
    name: 'Hand-Engraved Gold Bangles (Set of 4)',
    category: 'Bangles & Bracelets',
    categorySlug: 'bangles-bracelets',
    route: '/product/4',
    categoryRoute: '/collections/bangles-bracelets',
    minWeight: '48 Grams (Set of 4)',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Set of four solid 22k gold bangles featuring geometric floral engravings. Designed with rounded inner edges for maximum comfort and lifelong wear.',
    keywords: ['bangles', 'bangle', 'valayal', 'kada', 'bracelet', 'set of 4', 'floral', '48g', '48 grams']
  },
  {
    id: 5,
    name: 'Regal Filigree Gold Ring',
    category: 'Rings',
    categorySlug: 'rings',
    route: '/product/5',
    categoryRoute: '/collections/rings',
    minWeight: '8 Grams',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Classic 22k gold signet ring showcasing intricate filigree shoulders and a polished central crest. A regal statement piece suitable for all occasions.',
    keywords: ['ring', 'filigree', 'signet', 'engagement', 'band', '8g', '8 grams']
  },
  {
    id: 6,
    name: 'Classic Twisted Rope Chain',
    category: 'Chains & Necklaces',
    categorySlug: 'chains-necklaces',
    route: '/product/6',
    categoryRoute: '/collections/chains-necklaces',
    minWeight: '30 Grams',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Robust 22k gold twisted rope chain with custom barrel lock clasp. Engineered with reinforced links for daily active wear.',
    keywords: ['rope', 'twisted', 'chain', 'barrel lock', 'necklace', '30g', '30 grams']
  },
  {
    id: 7,
    name: 'Heritage Bridal Haram',
    category: 'Chains & Necklaces',
    categorySlug: 'chains-necklaces',
    route: '/product/7',
    categoryRoute: '/collections/chains-necklaces',
    minWeight: '60 Grams',
    purity: '22K (916 BIS Hallmarked)',
    description: 'Grand South Indian temple haram necklace featuring emerald and ruby gemstone clusters set in 22k gold. Hand-forged over 120 artisan hours.',
    keywords: ['bridal', 'haram', 'wedding', 'necklace', 'emerald', 'ruby', 'temple', '60g', '60 grams']
  }
];

export const VERIFIED_CATEGORIES = [
  {
    slug: 'chains-necklaces',
    name: 'Chains & Necklaces',
    route: '/collections/chains-necklaces',
    description: 'Royal interlock chains, heavy rope chains, traditional bridal harams, and chokers.',
    keywords: ['chain', 'chains', 'necklace', 'necklaces', 'haram', 'harams', 'choker']
  },
  {
    slug: 'kolus',
    name: 'Kolus (Anklets)',
    route: '/collections/kolus',
    description: 'Handcrafted solid gold and 92.5 sterling silver kolus adorned with traditional chiming ghungroo bells.',
    keywords: ['kolus', 'kolu', 'anklet', 'anklets', 'payal', 'ghungroo']
  },
  {
    slug: 'kammal',
    name: 'Kammal (Earrings)',
    route: '/collections/kammal',
    description: 'Antique temple jimkis, jhumkas, chandeliers, and handcrafted daily studs.',
    keywords: ['kammal', 'earring', 'earrings', 'jimki', 'jimkis', 'jhumka', 'studs']
  },
  {
    slug: 'bangles-bracelets',
    name: 'Bangles & Bracelets',
    route: '/collections/bangles-bracelets',
    description: 'Hand-engraved 22K gold bangles, antique kadas, and valayal sets.',
    keywords: ['bangles', 'bangle', 'valayal', 'kada', 'kadas', 'bracelet', 'bracelets']
  },
  {
    slug: 'rings',
    name: 'Rings',
    route: '/collections/rings',
    description: 'Regal filigree engagement bands, signet rings, and floral gemstone rings.',
    keywords: ['ring', 'rings', 'signet', 'band', 'engagement']
  }
];

export const KNOWLEDGE_CHUNKS = [
  {
    id: 'brand_overview',
    category: 'brand',
    title: 'Brand Heritage & Atelier Overview',
    keywords: ['about', 'latha', 'history', 'established', '1990', 'who', 'story', 'heritage', 'atelier', 'experience', 'founder', 'legacy'],
    content: 'Latha Jewellery Works was established in 1990 in Nadaikavu / Chathencode, Tamil Nadu. With over 34 years of unbroken goldsmithing heritage, our generational master karigars specialize in authentic handcrafted 22K (916) BIS hallmarked gold ornaments, traditional South Indian temple jewellery, antique bridal heirlooms, and sterling silver craftsmanship.'
  },
  {
    id: 'store_location_contact',
    category: 'store_info',
    title: 'Store Location, Contact & Timings',
    keywords: ['location', 'address', 'where', 'map', 'directions', 'timings', 'hours', 'open', 'close', 'sunday', 'phone', 'whatsapp', 'call', 'contact', 'nadaikavu', 'chathencode'],
    content: 'Store Location & Timings:\n• Address: Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikavu, Tamil Nadu.\n• Plus Code: 74VX+7G Nadaikavu, Tamil Nadu.\n• Phone & WhatsApp: +91 9487056064 (Direct Atelier Support).\n• Email: lathajewelleryworks@gmail.com.\n• Working Hours: Monday to Saturday from 9:30 AM to 8:00 PM. Sundays open by appointment only.\n(Note: We are located in Nadaikavu, Tamil Nadu — we have no branches in Bangalore or Karnataka).'
  },
  {
    id: 'business_model_catalogue',
    category: 'brand',
    title: 'Digital Catalogue & Personal Enquiry Model',
    keywords: ['buy', 'order', 'purchase', 'online', 'cart', 'checkout', 'payment', 'delivery', 'shipping', 'ecommerce', 'reserve'],
    content: 'Latha Jewellery Works functions as a curated digital showroom and bespoke goldsmith atelier. Rather than an impersonal automated checkout cart, every order is personally crafted and tailored to customer specifications. Customers can browse collections online and click "Enquire" or connect directly via WhatsApp (+91 9487056064) to confirm piece availability, customize weight, or arrange an atelier consultation.'
  },
  {
    id: 'jewellery_collections',
    category: 'collections',
    title: 'Master Jewellery Collections & Direct Page Links',
    keywords: ['collections', 'categories', 'category', 'items', 'jewellery', 'types', 'bangles', 'chains', 'necklaces', 'earrings', 'kammal', 'kolus', 'anklets', 'rings', 'bridal', 'harams', 'valayal'],
    content: 'Our handcrafted master collections include:\n1. Chains & Necklaces ([Browse Chains](/collections/chains-necklaces)): Royal interlock chains, twisted rope chains, chokers, and grand bridal harams.\n2. Kolus / Anklets ([Browse Kolus](/collections/kolus)): Solid gold and 92.5 sterling silver handcrafted anklets with chiming bells.\n3. Kammal / Earrings ([Browse Kammal](/collections/kammal)): Antique temple jimkis, jhumkas, and studs.\n4. Bangles & Valayal ([Browse Bangles](/collections/bangles-bracelets)): Hand-engraved 22K gold bangles, kadas, and valayal sets.\n5. Rings ([Browse Rings](/collections/rings)): Regal filigree signet bands and engagement rings.\n6. Complete Bridal Suites: Custom temple and wedding suites created bespoke for brides.'
  },
  {
    id: 'bespoke_craftsmanship_services',
    category: 'services',
    title: 'Bespoke Custom Orders & Goldsmithing Services',
    keywords: ['custom', 'customized', 'bespoke', 'make', 'order', 'karigar', 'craft', 'photo', 'sketch', 'heirloom', 'weight', 'bridal order'],
    content: 'Bespoke Goldsmithing Services at Latha Jewellery Works:\n• Custom Crafting from References: Bring or send any photograph, heirloom sample, or hand sketch. Our generational master karigars will hand-forge it to your exact desired weight and purity (22K BIS 916).\n• Personalized Consultation: Discuss design intricacies, stone setting (natural rubies, emeralds, pearls), and length specifications directly with master artisans.\n• Laser HUID Hallmarking: Every custom piece is independently tested and laser hallmarked before delivery.\n• Connect on WhatsApp at +91 9487056064 to start your bespoke jewellery enquiry.'
  },
  {
    id: 'old_gold_exchange',
    category: 'exchange_policy',
    title: '100% Transparent Old Gold Exchange Policy',
    keywords: ['exchange', 'old gold', 'karatometer', 'spectrometer', 'test', 'melt', 'melting loss', 'purity test', 'trade in'],
    content: 'Transparent Old Gold Exchange Policy:\n• Computerized Karatometer Testing: Old gold purity is evaluated transparently in front of you using an advanced spectrometer without damaging your ornaments.\n• Zero Melting Deduction: No arbitrary melting loss is deducted on pure assessed gold weight.\n• Live Rate Valuation: Full market value is credited directly according to the day\'s official live rate against new 22K 916 hallmarked jewellery or silver articles.'
  },
  {
    id: 'hallmark_certification',
    category: 'quality_assurance',
    title: '100% BIS 916 Hallmark Assurance & 6-Digit Laser HUID',
    keywords: ['hallmark', 'bis', '916', 'huid', 'laser', 'certificate', 'purity', 'authenticity', '22k', 'guarantee'],
    content: '100% BIS 916 Hallmark & Laser HUID Assurance:\nEvery gold ornament crafted by Latha Jewellery Works bears the official Bureau of Indian Standards (BIS) mark with:\n1. BIS Triangle Logo\n2. 916 Purity Indicator (22 Karat standard)\n3. 6-digit laser alphanumeric HUID (Hallmark Unique Identification) traceable via the official Government BIS Care app.'
  },
  {
    id: 'pricing_transparency',
    category: 'pricing_policy',
    title: 'Pricing Calculation Formula & Making Charges',
    keywords: ['price', 'cost', 'making charges', 'wastage', 'calculation', 'total', 'estimate', 'how much', 'formula'],
    content: 'Jewellery Price Calculation Standard:\nFinal jewellery quotes are computed strictly and transparently:\n• Gold Value = Net Weight in Grams × Current Live Rate for Purity (22K / 18K / 24K)\n• Making Charges = Based on the intricate handcrafting hours of the master karigar\n• Applicable GST (3%)\nBecause bullion market rates change daily, exact final prices are confirmed at the atelier on the day of order placement.'
  }
];
