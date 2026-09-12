import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'store.json');
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let store = {
  users: [],
  categories: [],
  jewellery_models: [],
  banners: [],
  media: [],
  gold_rates: [],
  rate_history: [],
  enquiries: [],
  reviews: [],
  site_content: {},
  business_settings: {}
};

export function saveStore() {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function loadStore() {
  if (fs.existsSync(storePath)) {
    try {
      const data = fs.readFileSync(storePath, 'utf-8');
      store = { ...store, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error parsing store.json, initializing fresh store', e);
    }
  }
  seedInitialData();
}

function seedInitialData() {
  let dirty = false;

  // 1. Admin User
  if (store.users.length === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('LATHA2024', salt);
    store.users.push({
      id: 1,
      username: 'admin',
      password_hash: hash,
      role: 'admin',
      created_at: new Date().toISOString()
    });
    dirty = true;
  }

  // 2. Categories
  if (store.categories.length === 0) {
    store.categories = [
      { id: 1, slug: 'chain', name: 'Chains & Necklaces', description: 'Traditional South Indian chains, royal interlock, and heavy necklaces', display_order: 1, active: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnskaVKp4AGGJ79HeuyN4y4eMStueunvHzx12Hmb2ujC1ApDVQFiak_UH3jVcFbhBwb6cCO9-3iy42vxquH8x_cY3vFjxrI66X4grNpvOH3ai_XjfbWz1PE3jdivj0IC-sLGEoYhQcNrwt4IHnP1kyUPMEahTpb9kCd01Cu5_bH9LDSob6yISF95MGbG1asDCuOXW8bI_418peCJD2DOmaM5oWQ3HEE48Ln-9FXFdpTwnO_ie3TytU5w' },
      { id: 2, slug: 'kolus', name: 'Kolus (Anklets)', description: 'Handcrafted solid gold and silver kolus with ghungroo bells', display_order: 2, active: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARGVXDagX1I0wU7qeCCwtpbMzlW2w0l8sCdqvHXv2-QxCrdiPh7TX0m0Hd3mcS0QdHzcoeM3jEU4pd5jyBvkqVxjTzZxHDb0x35LpZH-i_e-fDoy10rc7wLGub-ZLDl-DgL1lTPj8SygN5AAVP_7RxyMVQMB3zGKfUUAwRcFING5YxPmGvDbpRkfB5mZc-cESp_NJHU26hF0sPgskmiYog0CQI2tp9FF5Ojw_hP94YUZcy42jhzYg' },
      { id: 3, slug: 'kammal', name: 'Kammal (Earrings)', description: 'Antique temple jimkis, jhumkas, chandeliers, and handcrafted studs', display_order: 3, active: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgXuR9HZ2L03yoh7a4cPcY3dmCjytQ6S3bjHybTIWpFN3-Q3gRZLwhnqvQb6W-Vc0KqXGSOoz3NK8j1cLutVDM0dqMvS1XTmm8QFeMAFXGaZ1qNo2piEPRgQRCSDzSt30sE4JW8HM6iX2zAKpxhKleZPCh2zNOha5rtx4hwdoKUiMsnF4_t1FlCSjl8JNrAM6Ecs2QyC8dYF01waC6UwOqV-z3g198ten31-6HiOnZpEaeuV-hAVdwRw' },
      { id: 4, slug: 'bangles', name: 'Bangles & Bracelets', description: 'Hand-engraved 22k gold bangles, antique kadas, and valayal sets', display_order: 4, active: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLl7BdsBtE3bAuXGjSQphqRGgSOlMSn-A62GrkIUdmng0l33UqV3OMvoX5GRSvt09wmFmLxmAzpFV4icbVbUyiviMQcMYUeFwY4xeGI-rnjeR97xrNVJ8H4ETGX16FsVbKGRGH_TppL9-XfcJkS07QQGLXFjJkQ4j4c--88RW24hElwfLSZCGIAp_weUgjY__PhS6AeXylhnRZV1QitOJmwJ88u72vxTEqSqUGCojkj2no13jOsskmaw' },
      { id: 5, slug: 'rings', name: 'Rings', description: 'Regal filigree engagement bands, signet rings, and gemstone studs', display_order: 5, active: 1, image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjH0Wf92nSb6Ea9999evorQ-Ofyk3D1-TfcWgvTtd11AFIcAjqcps2kNorL-vgVS41vhD91B03s2T5uHFjiPDfNY5Gky0DyihyQ37CchFeP5AIbtCCwgfv-YGZTmbG0WIK042p0OcaQjI3astHLHSVy8rUhi8UgTO-1AEzybWxxfquSXFF-L2jHCUNA2KihtbTyNPyBPwM_ufBvGWLoq4DlKdYhS0Ba-6s5ppWFzdwXp97rOrXjcN2LQ' }
    ];
    dirty = true;
  }

  // 3. Jewellery Models
  if (store.jewellery_models.length === 0) {
    store.jewellery_models = [
      {
        id: 1,
        name: 'Royal Interlock Gold Chain',
        category_slug: 'chain',
        description: 'Exquisite 22k gold interconnected link chain crafted for daily elegance and durability. Soft mirror-polished facets catch ambient light with unmatched brilliance.',
        min_weight: '24 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnskaVKp4AGGJ79HeuyN4y4eMStueunvHzx12Hmb2ujC1ApDVQFiak_UH3jVcFbhBwb6cCO9-3iy42vxquH8x_cY3vFjxrI66X4grNpvOH3ai_XjfbWz1PE3jdivj0IC-sLGEoYhQcNrwt4IHnP1kyUPMEahTpb9kCd01Cu5_bH9LDSob6yISF95MGbG1asDCuOXW8bI_418peCJD2DOmaM5oWQ3HEE48Ln-9FXFdpTwnO_ie3TytU5w',
        additional_images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAdyqWyacKcwed0EcL_evMH9PTAbGWOZOQfQa3DFmBDbeWMGrMGRh7b-OLywyYBpf-kskWsag-7wYtcefezebnthuPBq7zyjmAyDJnosk_FTP-QDbe1-K23aWGB7XtRbPWZS7fsbq9w4fYt9dOXBWsKMqMAN1_PLUl3wIcdoxyVdK4Ea1kjD1edK8VL71-XAKxmNQSSiAfuQ6YmBMtOBK7POhRR7BREqTQwMXM17oKqvaXgDDrNr5M5bw'],
        featured: 1,
        active: 1,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Traditional Ghungroo Kolus',
        category_slug: 'kolus',
        description: 'Heritage solid gold anklet adorned with delicate hand-assembled ghungroo bells that emit a rhythmic chime. A cherished family heirloom piece.',
        min_weight: '35 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARGVXDagX1I0wU7qeCCwtpbMzlW2w0l8sCdqvHXv2-QxCrdiPh7TX0m0Hd3mcS0QdHzcoeM3jEU4pd5jyBvkqVxjTzZxHDb0x35LpZH-i_e-fDoy10rc7wLGub-ZLDl-DgL1lTPj8SygN5AAVP_7RxyMVQMB3zGKfUUAwRcFING5YxPmGvDbpRkfB5mZc-cESp_NJHU26hF0sPgskmiYog0CQI2tp9FF5Ojw_hP94YUZcy42jhzYg',
        additional_images: [],
        featured: 1,
        active: 1,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Antique Temple Jimki Kammal',
        category_slug: 'kammal',
        description: 'Intricate antique finish gold jimki earrings adorned with natural ruby cabochons and freshwater pearl drops. Forged using traditional die-struck techniques.',
        min_weight: '12 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgXuR9HZ2L03yoh7a4cPcY3dmCjytQ6S3bjHybTIWpFN3-Q3gRZLwhnqvQb6W-Vc0KqXGSOoz3NK8j1cLutVDM0dqMvS1XTmm8QFeMAFXGaZ1qNo2piEPRgQRCSDzSt30sE4JW8HM6iX2zAKpxhKleZPCh2zNOha5rtx4hwdoKUiMsnF4_t1FlCSjl8JNrAM6Ecs2QyC8dYF01waC6UwOqV-z3g198ten31-6HiOnZpEaeuV-hAVdwRw',
        additional_images: [],
        featured: 1,
        active: 1,
        display_order: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Hand-Engraved Gold Bangles (Set of 4)',
        category_slug: 'bangles',
        description: 'Set of four solid 22k gold bangles featuring geometric floral engravings. Designed with rounded inner edges for maximum comfort and lifelong wear.',
        min_weight: '48 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLl7BdsBtE3bAuXGjSQphqRGgSOlMSn-A62GrkIUdmng0l33UqV3OMvoX5GRSvt09wmFmLxmAzpFV4icbVbUyiviMQcMYUeFwY4xeGI-rnjeR97xrNVJ8H4ETGX16FsVbKGRGH_TppL9-XfcJkS07QQGLXFjJkQ4j4c--88RW24hElwfLSZCGIAp_weUgjY__PhS6AeXylhnRZV1QitOJmwJ88u72vxTEqSqUGCojkj2no13jOsskmaw',
        additional_images: [],
        featured: 1,
        active: 1,
        display_order: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Regal Filigree Gold Ring',
        category_slug: 'rings',
        description: 'Classic 22k gold signet ring showcasing intricate filigree shoulders and a polished central crest. A regal statement piece suitable for all occasions.',
        min_weight: '8 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjH0Wf92nSb6Ea9999evorQ-Ofyk3D1-TfcWgvTtd11AFIcAjqcps2kNorL-vgVS41vhD91B03s2T5uHFjiPDfNY5Gky0DyihyQ37CchFeP5AIbtCCwgfv-YGZTmbG0WIK042p0OcaQjI3astHLHSVy8rUhi8UgTO-1AEzybWxxfquSXFF-L2jHCUNA2KihtbTyNPyBPwM_ufBvGWLoq4DlKdYhS0Ba-6s5ppWFzdwXp97rOrXjcN2LQ',
        additional_images: [],
        featured: 1,
        active: 1,
        display_order: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Classic Twisted Rope Chain',
        category_slug: 'chain',
        description: 'Robust 22k gold twisted rope chain with custom barrel lock clasp. Engineered with reinforced links for daily active wear.',
        min_weight: '30 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdyqWyacKcwed0EcL_evMH9PTAbGWOZOQfQa3DFmBDbeWMGrMGRh7b-OLywyYBpf-kskWsag-7wYtcefezebnthuPBq7zyjmAyDJnosk_FTP-QDbe1-K23aWGB7XtRbPWZS7fsbq9w4fYt9dOXBWsKMqMAN1_PLUl3wIcdoxyVdK4Ea1kjD1edK8VL71-XAKxmNQSSiAfuQ6YmBMtOBK7POhRR7BREqTQwMXM17oKqvaXgDDrNr5M5bw',
        additional_images: [],
        featured: 0,
        active: 1,
        display_order: 6,
        created_at: new Date().toISOString()
      },
      {
        id: 7,
        name: 'Heritage Bridal Haram',
        category_slug: 'chain',
        description: 'Grand South Indian temple haram necklace featuring emerald and ruby gemstone clusters set in 22k gold. Hand-forged over 120 artisan hours.',
        min_weight: '60 Grams',
        primary_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdOahHclHAsBUtElovuX4uYyCXaktJE1cuGdtppl7Hl0O05DUB__51kSRBU-bCpqO7FJIUSboLSL9YFVV34plW3gsNhg3a9vpdXYsJjtlAjB2yf2n3SdiuG5XO0a58T9JEXUm9-6QCc0t6IaQnQO4Pe_Hn0qeo_ndWIDMiJBjAJnSkIrnSe3C7eQru8iDDrzWljbjiOUM0VypUz6C5IYSO1_4yN0_pHxZN9LVsUTvrxGtqhDl56z2MfA',
        additional_images: [],
        featured: 1,
        active: 1,
        display_order: 7,
        created_at: new Date().toISOString()
      }
    ];
    dirty = true;
  }

  // 4. Banners
  if (store.banners.length === 0) {
    store.banners = [
      {
        id: 1,
        title: 'Crafting Unique Gold Ornaments Since 1990',
        subtitle: 'Where ancestral heritage meets uncompromising contemporary precision. Bespoke gold craftsmanship tailored to your most cherished milestones.',
        desktop_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAkWUGT7Fgqzp1aQblTwVWqhHMkBayKv-F3xfmcpRLMiJjJWhFNuSlAEQxhdaGCgp3i9WPIbA_ogfSZJf8PaTBfSqBb5Mo8ovhcYyY49R-wklPpAl8IGjuEb3UEvMOzLUHbLo4sdvYCSKKQ8C0kjhWTQZfKP4NoJxoRdLkx--H395QT_t0SImVRFcbznj6O-IJ84xsr5lCBxNUmJ9WcOODNdQxfPcGH9wyIA-Jlyg0Fi-NgYHy2hIUog',
        mobile_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAkWUGT7Fgqzp1aQblTwVWqhHMkBayKv-F3xfmcpRLMiJjJWhFNuSlAEQxhdaGCgp3i9WPIbA_ogfSZJf8PaTBfSqBb5Mo8ovhcYyY49R-wklPpAl8IGjuEb3UEvMOzLUHbLo4sdvYCSKKQ8C0kjhWTQZfKP4NoJxoRdLkx--H395QT_t0SImVRFcbznj6O-IJ84xsr5lCBxNUmJ9WcOODNdQxfPcGH9wyIA-Jlyg0Fi-NgYHy2hIUog',
        cta_label: 'Request Custom Design',
        cta_link: '#custom-enquiry',
        active: 1,
        display_order: 1
      }
    ];
    dirty = true;
  }

  // 5. Gold Rates
  if (store.gold_rates.length === 0) {
    store.gold_rates = [{
      id: 1,
      rate_22k: '6,850',
      rate_24k: '7,460',
      rate_silver: '92',
      ticker_visible: 1,
      last_updated: 'Today, 10:30 AM'
    }];
    store.rate_history = [
      { id: 1, date_str: 'Oct 24, 2024', rate_22k: '6,850', change_amount: '+25' },
      { id: 2, date_str: 'Oct 23, 2024', rate_22k: '6,825', change_amount: '+30' },
      { id: 3, date_str: 'Oct 22, 2024', rate_22k: '6,795', change_amount: '+15' }
    ];
    dirty = true;
  }

  // 6. Reviews
  if (store.reviews.length === 0) {
    store.reviews = [
      { id: 1, name: 'Rajesh Kumar', location: 'Chathencode', rating: 5, review_text: 'Latha Jewellery Works crafted our entire family wedding set. The finish of the gold and intricate temple design work is simply unmatched in the entire region. Highly trusted!', status: 'APPROVED', featured: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Anitha Suresh', location: 'Nadaikkavu', rating: 5, review_text: 'I gave a custom design for a necklace and earrings. They delivered it ahead of schedule with exact weight specifications and pristine purity. Exceptional craftsmanship.', status: 'APPROVED', featured: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'Murugan Pillai', location: 'Trivandrum Rural', rating: 5, review_text: 'Generations of our family have bought gold exclusively from Latha Jewellery Works. Their honesty and purity tests give absolute peace of mind.', status: 'APPROVED', featured: 1, created_at: new Date().toISOString() },
    ];
    dirty = true;
  }

  // 7. Enquiries
  if (store.enquiries.length === 0) {
    store.enquiries = [
      { id: 1, name: 'Rajesh Kumar', mobile: '+91 98450 12345', email: 'rajesh@example.com', jewellery_type: 'Necklace / Haram', requirements: 'Custom Antique Nakshi Necklace, min weight 45g', status: 'IN PROGRESS', internal_notes: 'Client requested ruby stone highlights.', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, name: 'Priya Sharma', mobile: '+91 94432 67890', email: 'priya@example.com', jewellery_type: 'Earrings / Kammal', requirements: 'Temple Jewellery Jhumka Set with pearl drops', status: 'COMPLETED', internal_notes: 'Delivered on Oct 20.', created_at: new Date(Date.now() - 172800000).toISOString() },
    ];
    dirty = true;
  }

  // 8. Site Content & Business Settings
  if (Object.keys(store.site_content).length === 0) {
    store.site_content = {
      hero_eyebrow: 'Established 1990 • Chathencode',
      hero_title: 'Crafting Unique Gold Ornaments Since 1990',
      hero_subtitle: 'Where ancestral heritage meets uncompromising contemporary precision. Bespoke gold craftsmanship tailored to your most cherished milestones.',
      about_eyebrow: 'Legacy of Excellence',
      about_title: 'Three Decades of Trusted Craftsmanship',
      about_description: 'For over 35 years, Latha Jewellery Works has stood as a beacon of purity and peerless artistry in Chathencode. Every piece that leaves our bench is a testament to generational techniques, unyielding integrity, and an uncompromising dedication to bespoke design.',
      about_years: '35+',
      about_purity: '100%',
      about_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCMMbqxjOFz1vdZSsKAC3MH8y3AApWLkwVUCI0QWAbbpe6WeLz0kP1d5n-7jpZ42Up_fIqLr_pwxIZCZvQAKh-v1HKvnBTlcbCdZLnSp9oYj0JVRPumTSMc8uiqsSlLho6htC7nRabJhBaXScQ1rZ302qLFRpfIL9jmdB_BOb5FtALnfDh5aUHDwTzPOzX4r-gHSO73GRWy-8hpQD3N1wvVWRg4TRaNngoC_Tjw3IeQxjyvymphe20nA',
      featured_title: 'The Heritage Bridal Haram',
      featured_description: 'Handcrafted over 120 meticulous hours by our master artisans, this grand bridal haram seamlessly fuses traditional South Indian motifs with peerless stone settings. An heirloom destined to be passed down through generations.',
      featured_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdOahHclHAsBUtElovuX4uYyCXaktJE1cuGdtppl7Hl0O05DUB__51kSRBU-bCpqO7FJIUSboLSL9YFVV34plW3gsNhg3a9vpdXYsJjtlAjB2yf2n3SdiuG5XO0a58T9JEXUm9-6QCc0t6IaQnQO4Pe_Hn0qeo_ndWIDMiJBjAJnSkIrnSe3C7eQru8iDDrzWljbjiOUM0VypUz6C5IYSO1_4yN0_pHxZN9LVsUTvrxGtqhDl56z2MfA'
    };
    dirty = true;
  }

  if (Object.keys(store.business_settings).length === 0) {
    store.business_settings = {
      business_name: 'Latha Jewellery Works',
      established_year: '1990',
      phone: '9487056064',
      whatsapp: '9487056064',
      email: 'contact@lathajewelleryworks.com',
      address: 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikkavu, Chathencode P.O.',
      google_maps_url: 'https://maps.google.com/?q=Chathencode+Nadaikkavu+Road+Near+Government+Primary+School+Chathencode',
      working_hours: 'Monday – Saturday: 9:30 AM – 8:00 PM | Sunday: By Appointment Only',
      meta_title: 'Latha Jewellery Works | Timeless Handcrafted Gold & Silver Masterpieces',
      meta_description: 'Discover authentic handcrafted gold jewelry, antique chains, kolus, and temple designs at Latha Jewellery Works in Chathencode.',
      logo_primary: '',
      logo_mobile: '',
      logo_footer: ''
    };
    dirty = true;
  }

  if (dirty) {
    saveStore();
  }
}

// Initial load
loadStore();

export { store };
