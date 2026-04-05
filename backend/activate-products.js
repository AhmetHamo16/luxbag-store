const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');

async function activateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB. Activating new products...');

    // Fetch categories to ensure correct assignment
    const perfumesCategory = await Category.findOne({ slug: 'perfumes' });
    const watchesCategory = await Category.findOne({ slug: 'watches' });
    const sunglassesCategory = await Category.findOne({ slug: 'sunglasses' });

    if (!perfumesCategory || !watchesCategory || !sunglassesCategory) {
      console.warn('One or more categories could not be found. Check your database slugs.');
    }

    let perfRes = { modifiedCount: 0 };
    let watchRes = { modifiedCount: 0 };
    let glassRes = { modifiedCount: 0 };

    if (perfumesCategory) {
      perfRes = await Product.updateMany(
        { sku: { $regex: /^PERF-/i } },
        { $set: { isActive: true, isPublished: true, category: perfumesCategory._id } }
      );
    }

    if (watchesCategory) {
      watchRes = await Product.updateMany(
        { sku: { $regex: /^WATCH-/i } },
        { $set: { isActive: true, isPublished: true, category: watchesCategory._id } }
      );
    }

    if (sunglassesCategory) {
      glassRes = await Product.updateMany(
        { sku: { $regex: /^GLASS-/i } },
        { $set: { isActive: true, isPublished: true, category: sunglassesCategory._id } }
      );
    }

    console.log(`Perfume Products activated: ${perfRes.modifiedCount}`);
    console.log(`Watch Products activated: ${watchRes.modifiedCount}`);
    console.log(`Sunglasses Products activated: ${glassRes.modifiedCount}`);
    
    console.log('Activation Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error activating products:', err);
    process.exit(1);
  }
}

activateProducts();
