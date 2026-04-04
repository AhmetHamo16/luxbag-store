require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CANTAA_DIR = 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\CANTA\\cantaa';
const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const files = fs
      .readdirSync(CANTAA_DIR)
      .filter((file) => VALID_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort(naturalSort);

    const products = await Product.find({}, 'sku name images')
      .sort({ sku: 1 })
      .exec();

    console.log(`Found ${files.length} images to process.`);
    console.log(`Found ${products.length} products to update.`);

    if (files.length !== products.length) {
      throw new Error(
        `Image count (${files.length}) does not match product count (${products.length}).`
      );
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const file = files[i];
      const filePath = path.join(CANTAA_DIR, file);
      const publicId = `melora-products/${product.sku.toLowerCase()}`;

      console.log(`\n[${i + 1}/${products.length}] ${product.sku} <= ${file}`);
      console.log('  -> Uploading replacement image to Cloudinary...');
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: 'melora-products',
        public_id: product.sku.toLowerCase(),
        overwrite: true,
        invalidate: true,
        resource_type: 'image'
      });

      console.log(`  -> Upload successful: ${uploadResult.secure_url}`);

      product.images = [{
        url: uploadResult.secure_url,
        altText: product.name?.en || product.sku,
        isMain: true,
        sortOrder: 0
      }];

      await product.save();
      console.log(`  -> Product updated for SKU: ${product.sku}`);

      if (publicId) {
        console.log(`  -> Active Cloudinary public ID: ${publicId}`);
      }
    }

    console.log('\nAll done!');

  } catch (error) {
    console.error('Error during execution:', error);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

main();
