require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  const result = await Product.deleteMany({ 'images': { $size: 0 }, image: { $exists: false } });
  console.log('Deleted products with no images:', result.deletedCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
