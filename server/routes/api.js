import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { store, saveStore } from '../db.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer Storage Configuration
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and AVIF image formats are allowed'));
    }
  }
});

// ==========================================
// 1. PUBLIC DATA ENDPOINT (Storefront Sync)
// ==========================================
router.get('/public/data', (req, res) => {
  const activeCategories = store.categories
    .filter(c => c.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeModels = store.jewellery_models
    .filter(m => m.active)
    .sort((a, b) => a.display_order - b.display_order);

  const activeBanners = store.banners
    .filter(b => b.active)
    .sort((a, b) => a.display_order - b.display_order);

  const approvedReviews = store.reviews
    .filter(r => r.status === 'APPROVED')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const goldRates = store.gold_rates[0] || {
    rate_22k: '6,850',
    rate_24k: '7,460',
    rate_silver: '92',
    ticker_visible: 1,
    last_updated: 'Today, 10:30 AM'
  };

  res.json({
    categories: activeCategories,
    jewellery_models: activeModels,
    banners: activeBanners,
    reviews: approvedReviews,
    gold_rates: goldRates,
    content: store.site_content,
    settings: store.business_settings
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid master username or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid master username or password' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username: user.username, role: user.role });
});

router.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ==========================================
// 3. JEWELLERY MODELS CRUD (Admin)
// ==========================================
router.get('/jewellery', (req, res) => {
  res.json(store.jewellery_models.sort((a, b) => a.display_order - b.display_order));
});

router.post('/jewellery', authenticateToken, (req, res) => {
  const { name, category_slug, description, min_weight, primary_image, additional_images, featured, active } = req.body;
  if (!name || !category_slug || !primary_image) {
    return res.status(400).json({ error: 'Model name, category, and primary image required' });
  }

  const newId = store.jewellery_models.length ? Math.max(...store.jewellery_models.map(m => m.id)) + 1 : 1;
  const newModel = {
    id: newId,
    name,
    category_slug,
    description: description || '',
    min_weight: min_weight || '',
    primary_image,
    additional_images: Array.isArray(additional_images) ? additional_images : [],
    featured: featured ? 1 : 0,
    active: active !== undefined ? (active ? 1 : 0) : 1,
    display_order: store.jewellery_models.length + 1,
    created_at: new Date().toISOString()
  };

  store.jewellery_models.push(newModel);
  saveStore();
  res.status(201).json(newModel);
});

router.put('/jewellery/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.jewellery_models.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Jewellery model not found' });
  }

  const existing = store.jewellery_models[index];
  const updated = {
    ...existing,
    ...req.body,
    featured: req.body.featured !== undefined ? (req.body.featured ? 1 : 0) : existing.featured,
    active: req.body.active !== undefined ? (req.body.active ? 1 : 0) : existing.active,
    display_order: req.body.display_order !== undefined ? req.body.display_order : existing.display_order
  };

  store.jewellery_models[index] = updated;
  saveStore();
  res.json(updated);
});

router.delete('/jewellery/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  store.jewellery_models = store.jewellery_models.filter(m => m.id !== id);
  saveStore();
  res.json({ message: 'Model deleted successfully' });
});

// ==========================================
// 4. CATEGORIES CRUD
// ==========================================
router.get('/categories', (req, res) => {
  res.json(store.categories.sort((a, b) => a.display_order - b.display_order));
});

router.post('/categories', authenticateToken, (req, res) => {
  const { name, slug, description, image_url, active } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: 'Category name and slug required' });
  }

  const newId = store.categories.length ? Math.max(...store.categories.map(c => c.id)) + 1 : 1;
  const newCat = {
    id: newId,
    slug: slug.toLowerCase().replace(/\s+/g, '-'),
    name,
    description: description || '',
    image_url: image_url || '',
    display_order: store.categories.length + 1,
    active: active !== undefined ? (active ? 1 : 0) : 1,
    created_at: new Date().toISOString()
  };

  store.categories.push(newCat);
  saveStore();
  res.status(201).json(newCat);
});

router.put('/categories/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.categories.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const existing = store.categories[index];
  const updated = {
    ...existing,
    ...req.body,
    active: req.body.active !== undefined ? (req.body.active ? 1 : 0) : existing.active,
    display_order: req.body.display_order !== undefined ? req.body.display_order : existing.display_order
  };

  store.categories[index] = updated;
  saveStore();
  res.json(updated);
});

router.delete('/categories/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  store.categories = store.categories.filter(c => c.id !== id);
  saveStore();
  res.json({ message: 'Category deleted successfully' });
});

// ==========================================
// 5. MEDIA LIBRARY & REAL IMAGE UPLOADS
// ==========================================
router.get('/media', (req, res) => {
  res.json(store.media.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.post('/media/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const section_tag = req.body.section_tag || 'General';
  const fileUrl = `/uploads/${req.file.filename}`;
  const newId = store.media.length ? Math.max(...store.media.map(m => m.id)) + 1 : 1;

  const mediaItem = {
    id: newId,
    filename: req.file.filename,
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    size: req.file.size,
    url: fileUrl,
    section_tag,
    created_at: new Date().toISOString()
  };

  store.media.push(mediaItem);
  saveStore();
  res.status(201).json(mediaItem);
});

router.delete('/media/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const item = store.media.find(m => m.id === id);
  if (item && item.filename) {
    const filePath = path.join(uploadDir, item.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
  store.media = store.media.filter(m => m.id !== id);
  saveStore();
  res.json({ message: 'Media item deleted' });
});

// ==========================================
// 6. BANNERS CRUD
// ==========================================
router.get('/banners', (req, res) => {
  res.json(store.banners.sort((a, b) => a.display_order - b.display_order));
});

router.post('/banners', authenticateToken, (req, res) => {
  const { title, subtitle, desktop_image, mobile_image, cta_label, cta_link, active } = req.body;
  const newId = store.banners.length ? Math.max(...store.banners.map(b => b.id)) + 1 : 1;
  const banner = {
    id: newId,
    title: title || 'New Banner',
    subtitle: subtitle || '',
    desktop_image: desktop_image || '',
    mobile_image: mobile_image || desktop_image || '',
    cta_label: cta_label || 'Enquire Now',
    cta_link: cta_link || '#catalogue',
    active: active !== undefined ? (active ? 1 : 0) : 1,
    display_order: store.banners.length + 1,
    created_at: new Date().toISOString()
  };

  store.banners.push(banner);
  saveStore();
  res.status(201).json(banner);
});

router.put('/banners/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.banners.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Banner not found' });

  const existing = store.banners[index];
  const updated = {
    ...existing,
    ...req.body,
    active: req.body.active !== undefined ? (req.body.active ? 1 : 0) : existing.active,
    display_order: req.body.display_order !== undefined ? req.body.display_order : existing.display_order
  };

  store.banners[index] = updated;
  saveStore();
  res.json(updated);
});

router.delete('/banners/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  store.banners = store.banners.filter(b => b.id !== id);
  saveStore();
  res.json({ message: 'Banner deleted' });
});

// ==========================================
// 7. GOLD RATES & HISTORY
// ==========================================
router.get('/gold-rates', (req, res) => {
  const current = store.gold_rates[0] || {
    rate_22k: '6,850',
    rate_24k: '7,460',
    rate_silver: '92',
    ticker_visible: 1,
    last_updated: 'Today, 10:30 AM'
  };
  res.json({ current, history: store.rate_history });
});

router.post('/gold-rates', authenticateToken, (req, res) => {
  const { rate_22k, rate_24k, rate_silver, ticker_visible } = req.body;
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const updated = {
    id: 1,
    rate_22k: rate_22k || '6,850',
    rate_24k: rate_24k || '7,460',
    rate_silver: rate_silver || '92',
    ticker_visible: ticker_visible ? 1 : 0,
    last_updated: `Today, ${nowStr}`
  };

  store.gold_rates = [updated];

  // Add history log entry
  const newHistId = store.rate_history.length ? Math.max(...store.rate_history.map(h => h.id)) + 1 : 1;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  store.rate_history.unshift({
    id: newHistId,
    date_str: dateStr,
    rate_22k: updated.rate_22k,
    change_amount: 'Updated'
  });

  saveStore();
  res.json(updated);
});

// ==========================================
// 8. ENQUIRIES MANAGEMENT
// ==========================================
router.get('/enquiries', authenticateToken, (req, res) => {
  res.json(store.enquiries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.post('/enquiries', (req, res) => {
  const { name, mobile, email, jewellery_type, requirements } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ error: 'Name and mobile number are required' });
  }

  const newId = store.enquiries.length ? Math.max(...store.enquiries.map(e => e.id)) + 1 : 1;
  const enquiry = {
    id: newId,
    name,
    mobile,
    email: email || '',
    jewellery_type: jewellery_type || 'Custom Design',
    requirements: requirements || '',
    status: 'NEW',
    internal_notes: '',
    created_at: new Date().toISOString()
  };

  store.enquiries.push(enquiry);
  saveStore();

  // Also construct WhatsApp message URL for client convenience
  const waMsg = `Hello Latha Jewellery Works,%0A%0A*New Custom Jewellery Enquiry*%0A- *Name:* ${encodeURIComponent(name)}%0A- *Mobile:* ${encodeURIComponent(mobile)}%0A- *Email:* ${encodeURIComponent(email || 'N/A')}%0A- *Type:* ${encodeURIComponent(jewellery_type || 'Custom')}%0A- *Details:* ${encodeURIComponent(requirements || 'N/A')}`;
  const whatsappUrl = `https://wa.me/919487056064?text=${waMsg}`;

  res.status(201).json({ enquiry, whatsappUrl });
});

router.put('/enquiries/:id/status', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { status, internal_notes } = req.body;
  const index = store.enquiries.findIndex(e => e.id === id);
  if (index === -1) return res.status(404).json({ error: 'Enquiry not found' });

  if (status) store.enquiries[index].status = status;
  if (internal_notes !== undefined) store.enquiries[index].internal_notes = internal_notes;

  saveStore();
  res.json(store.enquiries[index]);
});

router.delete('/enquiries/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  store.enquiries = store.enquiries.filter(e => e.id !== id);
  saveStore();
  res.json({ message: 'Enquiry archived/deleted' });
});

// ==========================================
// 9. REVIEWS & MODERATION
// ==========================================
router.get('/reviews/admin', authenticateToken, (req, res) => {
  res.json(store.reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.post('/reviews', (req, res) => {
  const { name, location, rating, review_text } = req.body;
  if (!name || !review_text) {
    return res.status(400).json({ error: 'Name and review content are required' });
  }

  const newId = store.reviews.length ? Math.max(...store.reviews.map(r => r.id)) + 1 : 1;
  const newReview = {
    id: newId,
    name,
    location: location || 'Patron',
    rating: parseInt(rating) || 5,
    review_text,
    status: 'PENDING', // Public submissions require Admin moderation
    featured: 0,
    created_at: new Date().toISOString()
  };

  store.reviews.push(newReview);
  saveStore();
  res.status(201).json({ message: 'Review submitted for moderation', review: newReview });
});

router.put('/reviews/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.reviews.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Review not found' });

  store.reviews[index] = {
    ...store.reviews[index],
    ...req.body,
    featured: req.body.featured !== undefined ? (req.body.featured ? 1 : 0) : store.reviews[index].featured
  };

  saveStore();
  res.json(store.reviews[index]);
});

router.put('/reviews/:id/status', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { status, featured } = req.body;
  const index = store.reviews.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Review not found' });

  if (status) store.reviews[index].status = status;
  if (featured !== undefined) store.reviews[index].featured = featured ? 1 : 0;

  saveStore();
  res.json(store.reviews[index]);
});

router.delete('/reviews/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  store.reviews = store.reviews.filter(r => r.id !== id);
  saveStore();
  res.json({ message: 'Review deleted' });
});

// ==========================================
// 10. CONTENT & BUSINESS SETTINGS
// ==========================================
router.get('/content', (req, res) => {
  res.json(store.site_content);
});

router.put('/content', authenticateToken, (req, res) => {
  store.site_content = { ...store.site_content, ...req.body };
  saveStore();
  res.json(store.site_content);
});

router.get('/settings', (req, res) => {
  res.json(store.business_settings);
});

router.put('/settings', authenticateToken, (req, res) => {
  store.business_settings = { ...store.business_settings, ...req.body };
  saveStore();
  res.json(store.business_settings);
});

export default router;
