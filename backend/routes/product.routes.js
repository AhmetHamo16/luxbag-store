const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductBySlug, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('images', 5), createProduct);

router.route('/:slug')
  .get(getProductBySlug);

// using ID for update/delete as typical in Admin panels
router.route('/:id')
  .put(protect, admin, upload.array('images', 5), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
