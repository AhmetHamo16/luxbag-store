const express = require('express');
const router = express.Router();
const { 
  changePassword, 
  getActivityLogs, 
  logoutAllSessions 
} = require('../controllers/securityController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.use(protect, admin); // Lock the entire schema boundary to Admins only

router.put('/change-password', changePassword);
router.get('/activity-logs', getActivityLogs);
router.post('/logout-all', logoutAllSessions);

module.exports = router;
