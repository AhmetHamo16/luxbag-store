const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getOrders, 
  updateOrderStatus, 
  cancelOrder 
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/cancel')
  .put(protect, cancelOrder);

module.exports = router;
