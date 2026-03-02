const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    user = await User.create({ name, email, password });
    
    // SEND WELCOME EMAIL
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Melora Boutique',
      type: 'welcome',
      data: { name: user.name }
    });
    
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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
    
    res.cookie('jwt', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ success: true, accessToken: newTokens.accessToken });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    // Mock token for now
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      type: 'passwordReset',
      data: { resetUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/MOCK_TOKEN` }
    });
  }
  res.status(200).json({ success: true, message: 'Password reset link sent to email if account exists.' });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  // Logic for verifying token and updating password goes here
  res.status(200).json({ success: true, message: 'Password reset successful (Mock)' });
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  // Logic for verifying email via token goes here
  res.status(200).json({ success: true, message: 'Email verified successfully (Mock)' });
};
