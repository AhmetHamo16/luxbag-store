const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000
  };
};

// Register User
exports.register = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Customer account registration is disabled. Only admin and cashier accounts can sign in.'
  });
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && !user.password) {
      return res.status(400).json({ success: false, message: 'This account does not have a password yet. Please use forgot password to set one.' });
    }
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!['admin', 'cashier'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'This login is only for admin and cashier accounts.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('jwt', refreshToken, getRefreshCookieOptions());

    res.status(200).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout User
exports.logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const newTokens = generateTokens(user._id);
    
    res.cookie('jwt', newTokens.refreshToken, getRefreshCookieOptions());

    res.status(200).json({ success: true, accessToken: newTokens.accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      setImmediate(async () => {
        const emailSent = await sendEmail({
          to: user.email,
          subject: 'Password Reset Request',
          type: 'passwordReset',
          data: { resetUrl }
        });

        if (!emailSent) {
          console.warn(`Password reset email could not be sent for ${user.email}.`);
        }
      });
    }

    res.status(200).json({ success: true, message: 'Password reset link sent to email if account exists.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }

    const { password } = req.body;
    if (!password || String(password).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  // Logic for verifying email via token goes here
  res.status(200).json({ success: true, message: 'Email verified successfully (Mock)' });
};
