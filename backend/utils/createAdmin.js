const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../models/User');
  await User.deleteOne({ email: 'admin@melora.com' });
  await User.create({
    name: 'Admin',
    email: 'admin@melora.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    isActive: true
  });
  console.log('Admin created successfully!');
  process.exit(0);
};
run();
