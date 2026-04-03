const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require('../models/User');

  await User.deleteOne({ email: 'cashier@melora.com' });
  await User.create({
    name: 'إياد',
    email: 'cashier@melora.com',
    password: 'Cashier@1234',
    role: 'cashier',
    isVerified: true,
    isActive: true
  });

  console.log('Cashier created successfully!');
  process.exit(0);
};

run();
