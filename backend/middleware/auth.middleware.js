const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User making this request no longer exists.' });
    }
    
    // Check if user manually triggered "Logout All Sessions" after this token was natively issued
    if (req.user.lastLogoutAllDate && decoded.iat) {
      const issuedAt = decoded.iat * 1000;
      if (issuedAt < req.user.lastLogoutAllDate.getTime()) {
        return res.status(401).json({ success: false, message: 'Session expired by manual global logout. Please login again.' });
      }
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token, please login again' });
  }
};
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (err) {
    req.user = null;
  }
  next();
};

module.exports = { protect, optionalAuth };
