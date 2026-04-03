const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// @desc    Increment page visit count
// @route   POST /api/analytics/visit
// @access  Public
router.post('/visit', async (req, res) => {
  try {
    // Get local date in YYYY-MM-DD format
    const today = new Date();
    // Use the backend server's local date string or ISO 
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    
    const record = await Analytics.findOneAndUpdate(
      { date: dateStr },
      { $inc: { visits: 1 } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, visits: record.visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
