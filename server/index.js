require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
const path    = require('path');
const fs      = require('fs');

const app = express();

// ── CORS ──
const allowedOrigins = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^https:\/\/.*\.aithor\.com$/,
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const ok = allowedOrigins.some(p =>
      typeof p === 'string' ? p === origin : p.test(origin)
    );
    return ok ? callback(null, true) : callback(new Error('CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Create uploads dir (local dev) ──
try {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (_) {}

// ── MongoDB ──
let dbConnected = false;
const connectDB = async () => {
  if (dbConnected || mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set!');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    dbConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// ── Middleware: connect DB before every request ──
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── Routes ──
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin',        require('./routes/admin'));

// ── Health check ──
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  env: {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
  }
}));

// ── 404 ──
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Local dev: start HTTP server ──
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));
}

module.exports = app;
