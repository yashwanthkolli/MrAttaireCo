require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');

const passport = require('passport');
require('./config/passport');

const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mr-attire';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database Connection
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://mrattireco.com', 'https://www.mrattireco.com', 'http://192.168.31.104:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(passport.initialize());
app.set('trust proxy', true);

// File Uploads
const fileUpload = require('express-fileupload');
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Mr. Attire & Co. backend is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const auth = require('./routes/auth');
const products = require('./routes/products');
const hero = require('./routes/hero');
const cart = require('./routes/cart');
const user = require('./routes/user');
const shipping = require('./routes/shipping');
const payment = require('./routes/payment');
const orders = require('./routes/order');
const coupons = require('./routes/coupon');
const country = require('./routes/country');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/products', products);
app.use('/api/v1/hero', hero);
app.use('/api/v1/cart', cart);
app.use('/api/v1/users', user);
app.use('/api/v1/shipping', shipping);
app.use('/api/v1/payments', payment);
app.use('/api/v1/orders', orders);
app.use('/api/v1/coupon', coupons);
app.use('/api/v1/country', country);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;