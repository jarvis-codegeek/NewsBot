import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import newsRoutes from './routes/news.js';
import aiRoutes from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    framework: 'React + TypeScript + Vite + Express',
  });
});

// Determine static assets folder (prefer compiled React build in dist/)
const distPath = path.join(__dirname, '../dist');
const publicPath = path.join(__dirname, '../public');
const staticPath = fs.existsSync(distPath) ? distPath : publicPath;

app.use(express.static(staticPath));

// Fallback to React index.html
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath);
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 NewsBot AI Server is live on port ${PORT}`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`⚡ Frontend: React + TypeScript (Vite)`);
  console.log(`🧠 Gemini AI Key: ${process.env.GEMINI_API_KEY ? 'Configured ✅' : 'Not Set (Using Heuristic Engine) ⚠️'}`);
  console.log(`=========================================`);
});
