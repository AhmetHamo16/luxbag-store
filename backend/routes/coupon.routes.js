const express = require('express');
const router = express.Router();
const { 
  validateCoupon, 
  getCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  toggleCouponStatus
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.post('/validate', protect, validateCoupon);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/:id/toggle')
  .put(protect, admin, toggleCouponStatus);

router.route('/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

module.exports = router;
