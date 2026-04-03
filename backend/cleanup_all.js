require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  const result = await Product.deleteMany({});
  console.log('Deleted', result.deletedCount, 'products');
  process.exit(0);
});
