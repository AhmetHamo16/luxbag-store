const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.route('/')
  .get(getSettings) // Public read for storefront features
  .put(protect, admin, updateSettings); // Secure write for Admin Panel

module.exports = router;
