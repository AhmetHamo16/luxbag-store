const express = require('express');
const router = express.Router();
const { 
  addReview, 
  getReviewsByProduct, 
  deleteReview 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, addReview);
router.get('/:productId', getReviewsByProduct);
router.delete('/:id', protect, deleteReview);

module.exports = router;
