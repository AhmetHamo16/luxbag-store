require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Product = require('./models/Product');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isRailwayUpload = (value = '') => /railway\.app\/uploads\/products/i.test(String(value || ''));

const uploadRemoteImage = async (url, publicIdBase) => {
  const result = await cloudinary.uploader.upload(url, {
    folder: 'melora/products',
    public_id: publicIdBase,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  });

  return result.secure_url;
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({
    images: {
      $elemMatch: {
        url: /railway\.app\/uploads\/products/i,
      },
    },
  });

  const migrated = [];
  const failed = [];

  for (const product of products) {
    let changed = false;

    for (let i = 0; i < product.images.length; i += 1) {
      const image = product.images[i];
      const currentUrl = image?.url || '';

      if (!isRailwayUpload(currentUrl)) {
        continue;
      }

      try {
        const nextUrl = await uploadRemoteImage(currentUrl, `${String(product.sku || product._id).toLowerCase()}-${i + 1}`);
        product.images[i].url = nextUrl;
        changed = true;
      } catch (error) {
        failed.push({
          sku: product.sku,
          productId: String(product._id),
          url: currentUrl,
          message: error.message,
        });
      }
    }

    if (changed) {
      await product.save();
      migrated.push({
        sku: product.sku,
        productId: String(product._id),
        imageCount: product.images.length,
      });
    }
  }

  console.log(JSON.stringify({ migrated, failed }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
