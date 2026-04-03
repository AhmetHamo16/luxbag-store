const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  getCategoryBySlug, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  reorderCategories,
  toggleCategoryStatus
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/reorder')
  .put(protect, admin, reorderCategories);

router.route('/')
  .get(getCategories)
  .post(protect, admin, upload.single('image'), createCategory);

router.route('/:slug')
  .get(getCategoryBySlug);

router.route('/:id/toggle')
  .put(protect, admin, toggleCategoryStatus);

router.route('/:id')
  .put(protect, admin, upload.single('image'), updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
