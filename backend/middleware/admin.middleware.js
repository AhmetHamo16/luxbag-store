const AdminActivityLog = require('../models/AdminActivityLog');

const trackAdminActivity = (req, res) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;

  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      try {
        let details = JSON.stringify(req.body || {});
        if (details.length > 200) details = details.substring(0, 200) + '...';
        await AdminActivityLog.create({
          admin: req.user._id,
          action: req.method,
          resource: req.originalUrl,
          details,
          ipAddress: req.ip
        });
      } catch (err) {
        console.error('Failed to log admin activity', err);
      }
    }
  });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    trackAdminActivity(req, res);
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin, access denied' });
  }
};

const adminOrCashier = (req, res, next) => {
  if (req.user && ['admin', 'cashier'].includes(req.user.role)) {
    if (req.user.role === 'admin') {
      trackAdminActivity(req, res);
    }
    return next();
  }

  return res.status(403).json({ success: false, message: 'Not authorized for staff access' });
};

module.exports = { admin, adminOrCashier };
