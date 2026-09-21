import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';
import { updateGoldRatesFromAPI } from './goldApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount API routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`✨ Latha Jewellery Works Server running on http://localhost:${PORT}`);
  // Initial GoldAPI.io auto fetch on server boot
  updateGoldRatesFromAPI().catch(err => console.error('GoldAPI boot sync error:', err));
  
  // Scheduled periodic gold rate update every 6 hours (21,600,000 ms)
  setInterval(() => {
    console.log('⏰ Running scheduled GoldAPI.io rate update...');
    updateGoldRatesFromAPI().catch(err => console.error('GoldAPI scheduled sync error:', err));
  }, 6 * 60 * 60 * 1000);
});
