const express = require('express');
const router = express.Router();
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
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'melora/receipts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
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

router.route('/upload')
  .post(protect, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    res.status(200).json({ success: true, url: req.file.path });
  });

const Order = require('../models/Order');

// NEW PUBLIC ROUTE — no auth middleware at all
router.post('/iban-submit', upload.single('receipt'), async (req, res) => {
  try {
    let orderData = JSON.parse(req.body.orderData);
    
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
        receiptImage: req.file ? req.file.path : null,
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
