const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductBySlug, 
  getProductById,
  createProduct, 
  updateProduct, 
  deleteProduct,
  duplicateProduct,
  bulkAction
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/bulk')
  .post(protect, admin, bulkAction);

router.route('/')
  .get(optionalAuth, getProducts)
  .post(protect, admin, upload.array('images', 10), createProduct);

router.route('/:slug')
  .get(getProductBySlug);

router.route('/:id/duplicate')
  .post(protect, admin, duplicateProduct);

// using ID for update/delete as typical in Admin panels
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.array('images', 10), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
