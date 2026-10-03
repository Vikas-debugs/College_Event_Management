const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./src/config/db');
const transporter = require('./src/config/mailer');
const { initCronJobs } = require('./src/services/cronService');
const errorHandler = require('./src/middleware/errorHandler');

// Connect to Database
connectDB();

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate Limiting (100 requests per 15 mins for general endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for uploaded banners & generated certificates
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    institution: 'Techno Institute of Higher Studies (TIHS), Lucknow',
    accreditation: 'NAAC Accredited | NCTE Approved | ISO 9001:2015',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/events', require('./src/routes/event.routes'));
app.use('/api/registrations', require('./src/routes/registration.routes'));
app.use('/api/payments', require('./src/routes/payment.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/certificates', require('./src/routes/certificate.routes'));
app.use('/api/feedback', require('./src/routes/feedback.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));

// Global Error Handler
app.use(errorHandler);

// Start Cron Automation Service
initCronJobs();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TIHS-CEMS Backend Running on port ${PORT}`);
  console.log(`📍 College: Techno Institute of Higher Studies (TIHS), Lucknow`);
  console.log(`🎓 Tagline: "Shaping Future Skilled Professionals"`);
  console.log(`⭐ NAAC Accredited | NCTE Approved | ISO 9001:2015`);
  console.log(`====================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
