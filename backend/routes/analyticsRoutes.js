const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

// @desc    Increment page visit count
// @route   POST /api/analytics/visit
// @access  Public
router.post('/visit', async (req, res) => {
  try {
    const visitorId = String(req.body?.visitorId || '').trim();
    if (!visitorId) {
      return res.status(400).json({ success: false, message: 'visitorId is required' });
    }

    // Get local date in YYYY-MM-DD format
    const today = new Date();
    // Use the backend server's local date string or ISO 
    const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    let record = await Analytics.findOne({ date: dateStr });

    if (!record) {
      record = await Analytics.create({
        date: dateStr,
        visits: 1,
        uniqueVisitors: [visitorId],
      });

      return res.status(200).json({ success: true, visits: record.visits, counted: true });
    }

    if (record.uniqueVisitors.includes(visitorId)) {
      return res.status(200).json({ success: true, visits: record.visits, counted: false });
    }

    record.uniqueVisitors.push(visitorId);
    record.visits += 1;
    await record.save();

    res.status(200).json({ success: true, visits: record.visits, counted: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
