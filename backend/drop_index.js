require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    await mongoose.connection.db.collection('products').dropIndex('slug_1');
    console.log('Index dropped');
  } catch (error) {
    if (error.code === 27) {
      console.log('Index not found, continuing...');
    } else {
      console.error('Error dropping index:', error.message);
    }
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
