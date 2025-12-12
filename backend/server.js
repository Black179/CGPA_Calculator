const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const semesterRoutes = require('./routes/semester');
const adminRoutes = require('./routes/admin');

const app = express();

// Trust proxy for production deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable CORS for all routes with detailed logging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from origin: ${origin}`);
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*');
    console.log('Allowing all origins in development');
  } else {
    // In production, only allow specific origins
    const allowedOrigins = [
      /^https?:\/\/cgpa-calculator-aroj(-[a-z0-9]+)?\.vercel\.app$/,  // Main app
      /^https?:\/\/cgpa-calculator-backend(-[a-z0-9]+)?\.vercel\.app$/,  // Backend
      /^https?:\/\/localhost(:[0-9]+)?$/,  // Localhost with any port
      /^https?:\/\/127\.0\.0\.1(:[0-9]+)?$/  // 127.0.0.1 with any port
    ];

    // Check if the origin is allowed
    if (origin) {
      let isAllowed = false;
      for (const pattern of allowedOrigins) {
        if (typeof pattern === 'string' && pattern === origin) {
          isAllowed = true;
          break;
        } else if (pattern instanceof RegExp && pattern.test(origin)) {
          isAllowed = true;
          break;
        }
      }

      if (isAllowed) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`Origin ${origin} is allowed`);
      } else {
        console.log(`Origin ${origin} is not allowed`);
      }
    } else {
      console.log('No origin header, allowing request');
    }
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return res.status(200).end();
  }

  next();
});

// Regular CORS for non-OPTIONS requests
app.use(cors({
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CGPA Calculator API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
