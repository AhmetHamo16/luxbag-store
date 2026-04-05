const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { 
  createOrder, 
  getMyOrders, 
  getOrders, 
  updateOrderStatus, 
  cancelOrder,
  updateOrderToPaid,
  getAdminStats,
  getPosSummary,
  getOrderAlerts,
  getCurrentPosShift,
  openPosShift,
  closePosShift,
  getPosShifts,
  voidPosOrder,
  markOrderPreparing,
  exportOrdersCSV,
  getOrderById,
  createPosOrder
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { admin, adminOrCashier } = require('../middleware/admin.middleware');
const multer = require('multer');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
fs.mkdirSync(receiptsDir, { recursive: true });

const storage = hasCloudinaryConfig
  ? new (require('multer-storage-cloudinary').CloudinaryStorage)({
      cloudinary,
      params: {
        folder: 'melora/receipts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
    })
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, receiptsDir),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
        const safeBase = path
          .basename(file.originalname || 'receipt', ext)
          .replace(/[^a-zA-Z0-9_-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase() || 'receipt';
        cb(null, `${Date.now()}-${safeBase}${ext}`);
      },
    });

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    cb(new Error('Only image uploads are allowed for receipts'));
  }
});

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || 'https')
    .toString()
    .split(',')[0]
    .trim();
  return `${protocol}://${req.get('host')}`;
};

router.route('/upload')
  .post(protect, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const baseUrl = getRequestBaseUrl(req);
    const url = req.file.path && /^https?:\/\//i.test(req.file.path)
      ? req.file.path
      : `${baseUrl}/uploads/receipts/${req.file.filename}`;
    res.status(200).json({ success: true, url });
  });

const Order = require('../models/Order');

// NEW PUBLIC ROUTE — no auth middleware at all
router.post('/iban-submit', upload.single('receipt'), async (req, res) => {
  try {
    let orderData = JSON.parse(req.body.orderData);
    const baseUrl = getRequestBaseUrl(req);
    
    const newOrder = new Order({
      user: null,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      subtotal: orderData.subtotal,
      shippingCost: orderData.shippingCost || 0,
      discountAmount: orderData.discountAmount || 0,
      total: orderData.total || orderData.totalPrice,
      coupon: orderData.coupon || undefined,
      payment: {
        method: 'iban',
        receiptImage: req.file
          ? ((req.file.path && /^https?:\/\//i.test(req.file.path))
            ? req.file.path
            : `${baseUrl}/uploads/receipts/${req.file.filename}`)
          : null,
        status: 'pending_payment'
      },
      status: 'pending_payment',
      notes: orderData.notes || ''
    });

    const saved = await newOrder.save();
    res.status(201).json({ success: true, order: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.route('/')
  .post(optionalAuth, upload.single('receipt'), createOrder)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/stats')
  .get(protect, admin, getAdminStats);

router.route('/pos/summary')
  .get(protect, adminOrCashier, getPosSummary);

router.route('/alerts')
  .get(protect, adminOrCashier, getOrderAlerts);

router.route('/:id/prepare')
  .put(protect, adminOrCashier, markOrderPreparing);

router.route('/pos/shift/current')
  .get(protect, adminOrCashier, getCurrentPosShift);

router.route('/pos/shift/open')
  .post(protect, adminOrCashier, openPosShift);

router.route('/pos/shift/close')
  .post(protect, adminOrCashier, closePosShift);

router.route('/pos/shifts')
  .get(protect, admin, getPosShifts);

router.route('/:id/void-pos')
  .put(protect, adminOrCashier, voidPosOrder);

router.route('/pos')
  .post(protect, adminOrCashier, createPosOrder);

router.route('/export')
  .get(protect, admin, exportOrdersCSV);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

router.route('/:id/pay')
  .put(protect, admin, updateOrderToPaid);

module.exports = router;
