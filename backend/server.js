require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const validateEnv = require('./config/env');

const cookieParser = require('cookie-parser');
const compression = require('compression');

const app = express();
const { allowedOrigins } = validateEnv();
app.set('trust proxy', 1);
app.use(compression());

// Removed Stripe Webhooks and Routes

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const path = require('path');
const uploadsStaticMiddleware = [
    (req, res, next) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
    },
    express.static(path.join(__dirname, 'uploads'))
];
app.use('/uploads', ...uploadsStaticMiddleware);
app.use('/api/uploads', ...uploadsStaticMiddleware);

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('Melora API is running...');
});

app.get('/healthz', (req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/readyz', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const dbState = states[mongoose.connection.readyState] || 'unknown';
    const isReady = mongoose.connection.readyState === 1;

    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        database: dbState,
        timestamp: new Date().toISOString()
    });
});

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const couponRoutes = require('./routes/coupon.routes');
const settingRoutes = require('./routes/setting.routes');
const contentRoutes = require('./routes/content.routes');
const securityRoutes = require('./routes/security.routes');
const reviewRoutes = require('./routes/review.routes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// XML Sitemap Route
app.get('/sitemap.xml', async (req, res) => {
  try {
     const mongoose = require('mongoose');
     const Product = mongoose.model('Product');
     const products = await Product.find({}).select('slug _id updatedAt');
     const siteUrl = process.env.SITE_URL || process.env.CLIENT_URL || 'https://meloramoda.com';
     let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
     products.forEach(p => {
       const slug = p.slug || p._id;
       const date = p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
       xml += `
  <url>
    <loc>${siteUrl}/product/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
     });
     xml += `\n</urlset>`;
     res.header('Content-Type', 'application/xml');
     res.send(xml);
  } catch (err) {
     res.status(500).end();
  }
});

const apiLimiter = require('./middleware/rateLimit.middleware');

// Apply rate limiter to auth routes
app.use('/api/auth', apiLimiter, authRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

let server;

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => (error ? reject(error) : resolve()));
            });
        }
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close(false);
        }
        process.exit(0);
    } catch (error) {
        console.error(`Graceful shutdown failed: ${error.message}`);
        process.exit(1);
    }
};

const startServer = async () => {
    try {
        await connectDB();
        server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Server startup failed: ${error.message}`);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

startServer();
