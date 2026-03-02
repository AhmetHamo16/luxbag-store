const express = require('express');
const router = express.Router();
const { 
  createPaymentIntent, 
  webhookHandler, 
  refundPayment 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/refund', protect, admin, refundPayment);

// WARNING: Webhook route expects raw body, configured in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

module.exports = router;
