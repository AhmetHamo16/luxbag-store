const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function activateAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const result = await Product.updateMany(
      { sku: { $regex: /^(PERF|WATCH|GLASS)-/i } },
      { $set: { isActive: true, isPublished: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} products matching PERF, WATCH, GLASS.`);
    
    // Total active count
    const activeCount = await Product.countDocuments({ isActive: true });
    console.log(`Total active products in database: ${activeCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

activateAll();
