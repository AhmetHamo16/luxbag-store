const Coupon = require('../models/Coupon');

const calculateCouponDiscount = (coupon, purchaseAmount, shippingCost = 0) => {
  if (!coupon) return 0;

  if (coupon.discountType === 'percentage') {
    return Number(((purchaseAmount * coupon.discountValue) / 100).toFixed(2));
  }

  if (coupon.discountType === 'fixed') {
    return Math.min(Number(coupon.discountValue || 0), Number(purchaseAmount || 0));
  }

  if (coupon.discountType === 'free_shipping') {
    return Number(shippingCost || 0);
  }

  return 0;
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, purchaseAmount, shippingCost = 0 } = req.body;
    const userId = req.user._id; // Guaranteed by auth middleware in Private routes
    
    const coupon = await Coupon.findOne({ code, isActive: true });
    
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    
    if (purchaseAmount < coupon.minPurchaseAmount) {
      return res.status(400).json({ success: false, message: `Minimum purchase amount is ${coupon.minPurchaseAmount}` });
    }

    // Check individual user limits
    const userUsage = coupon.redeemedBy.find(r => r.user.toString() === userId.toString());
    if (userUsage && userUsage.count >= coupon.maxUsesPerUser) {
      return res.status(400).json({ success: false, message: `You have reached the maximum allowed uses (${coupon.maxUsesPerUser}) for this coupon` });
    }

    const discountAmount = calculateCouponDiscount(coupon, purchaseAmount, shippingCost);

    res.status(200).json({
      success: true,
      data: coupon,
      discountAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Coupon Status
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
