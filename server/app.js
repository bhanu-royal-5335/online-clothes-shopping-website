const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Standard request logger in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // Ensure local static files/images can be requested from other origins
  })
);

// Cross Origin Resource Sharing config
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent back & forth
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use('/api', apiLimiter);

// Expose public static upload directory for product images fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Core api routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);

// Welcome landing route for API root
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background-color: #0a0a0a; color: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0;">
      <h1 style="color: #d4af37; font-size: 2.5rem; margin-bottom: 10px;">Rainbow Fashions API</h1>
      <p style="color: #a0a0a0; font-size: 1.1rem; max-width: 500px; line-height: 1.6;">
        The Express backend server is running successfully. Please access the React frontend client application to experience the store interface.
      </p>
      <a href="/api/health" style="margin-top: 20px; color: #d4af37; font-weight: bold; text-decoration: none; border: 1px solid #d4af37; padding: 8px 16px; rounded: 8px;">Check Health Status</a>
    </div>
  `);
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Fallback handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
