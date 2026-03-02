const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    
    // Check for verified purchase
    const hasPurchased = await Order.findOne({ user: req.user._id, 'items.product': product, status: 'delivered' });
    
    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    // Update product rating and count manually or via mongoose hooks later
    const allReviews = await Review.find({ product });
    const newRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    
    await Product.findByIdAndUpdate(product, {
      rating: newRating,
      reviewCount: allReviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews by product
// @route   GET /api/reviews/:productId
// @access  Public
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product average
    const allReviews = await Review.find({ product: productId });
    const newRating = allReviews.length > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length : 0;
    
    await Product.findByIdAndUpdate(productId, {
      rating: newRating,
      reviewCount: allReviews.length
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
