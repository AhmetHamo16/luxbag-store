const User = require('../models/User');
const AdminActivityLog = require('../models/AdminActivityLog');

// @desc    Change Admin Password
// @route   PUT /api/security/change-password
// @access  Private/Admin
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Explicitly grab the user including the password field
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Activity Log
// @route   GET /api/security/activity-logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await AdminActivityLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout All Sessions
// @route   POST /api/security/logout-all
// @access  Private/Admin
exports.logoutAllSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Setting this date ensures any old JWT matching an earlier issued-at timestamp is rejected globally
    user.lastLogoutAllDate = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'All active sessions globally terminated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
