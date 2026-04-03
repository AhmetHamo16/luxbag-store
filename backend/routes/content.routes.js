const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/contentController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
  .get(getContent) // Public fetch for Storefront mounting
  .put(protect, admin, upload.single('heroImage'), updateContent); // Write endpoint w/ Cloudinary map

module.exports = router;
