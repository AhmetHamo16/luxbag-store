const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const BAGS_DIR = 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\janta';

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Step 1: Count exact files
    let files = fs.readdirSync(BAGS_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

    console.log(`\n--- STEP 1 ---`);
    console.log(`Exact image files found in janta folder: ${files.length}`);

    // Step 2: Re-upload ALL images
    console.log(`\n--- STEP 2 ---`);
    console.log(`Uploading ${files.length} images to Cloudinary...`);
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(BAGS_DIR, file);
      
      try {
        const uploadRes = await cloudinary.uploader.upload(filePath, {
          folder: 'melora-products/bags',
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });
        
        uploadedImages.push({
          url: uploadRes.secure_url,
          filename: file
        });
        console.log(`Uploading ${i + 1}/${files.length}: ${file} ✓`);
      } catch (err) {
        console.error(`Failed to upload ${file}:`, err.message);
      }
    }

    // Step 3: Update existing 41 products (index 0 - 40)
    console.log(`\n--- STEP 3 ---`);
    const existingBags = await Product.find({ sku: { $regex: /^CANTAA-/i } }).sort({ sku: 1 });
    console.log(`Found ${existingBags.length} existing CANTAA products. Updating 1-to-1...`);

    let imageIndex = 0;
    let updatedCount = 0;

    for (let i = 0; i < existingBags.length; i++) {
      if (imageIndex >= uploadedImages.length) break;
      
      const product = existingBags[i];
      const img = uploadedImages[imageIndex++];

      product.images = [{
        url: img.url,
        altText: `${product.name.en || 'Melora Bag'} 1`,
        isMain: true,
        sortOrder: 0
      }];
      
      await product.save();
      updatedCount++;
    }
    console.log(`Successfully updated ${updatedCount} existing products.`);

    // Step 4: Create NEW bag products for remaining images
    console.log(`\n--- STEP 4 ---`);
    
    // Get category 
    let bagsCategory = await Category.findOne({ slug: 'bags' });
    if (!bagsCategory && existingBags.length > 0) {
      bagsCategory = { _id: existingBags[0].category };
    }

    let createdCount = 0;

    if (imageIndex < uploadedImages.length) {
      console.log(`Creating new products for remaining ${uploadedImages.length - imageIndex} images...`);
      
      let currentSkuNum = 42; 
      // Safe boundary check: we know we have 41 existing, CANTAA-041. So next is 42.
      // But verify just to be robust
      let maxSku = 41;
      for (const p of existingBags) {
        const match = p.sku.match(/CANTAA-(\d+)/i);
        if (match && parseInt(match[1]) > maxSku) maxSku = parseInt(match[1]);
      }
      currentSkuNum = maxSku + 1;

      while (imageIndex < uploadedImages.length) {
        const img = uploadedImages[imageIndex++];
        
        let skuSuffix = String(currentSkuNum).padStart(3, '0');
        let sku = `CANTAA-${skuSuffix}`;
        let productName = `Melora Bag ${currentSkuNum}`;

        const newProduct = new Product({
          name: { en: productName, tr: productName, ar: productName },
          description: { en: 'Exclusive bag.', tr: 'Özel çanta.', ar: 'حقيبة حصرية.' },
          price: 1000,
          sku,
          slug: `cantaa-${skuSuffix}`,
          category: bagsCategory._id,
          isActive: true,
          isPublished: true,
          bagType: 'general',
          images: [{
            url: img.url,
            altText: productName,
            isMain: true,
            sortOrder: 0
          }]
        });

        await newProduct.save();
        createdCount++;
        console.log(`Created new bag: ${sku} (${productName}) from ${img.filename}`);
        currentSkuNum++;
      }
    }

    // Step 5: Confirm total active bag products count
    console.log(`\n--- STEP 5 ---`);
    const activeBagCount = await Product.countDocuments({ sku: { $regex: /^CANTAA-/i }, isActive: true });
    
    console.log(`\n=================================`);
    console.log(`Summary:`);
    console.log(`Total Uploaded Images: ${uploadedImages.length}`);
    console.log(`Existing Bags Updated: ${updatedCount}`);
    console.log(`New Bags Created: ${createdCount}`);
    console.log(`Total Active CANTAA Bags in MongoDB: ${activeBagCount}`);
    console.log(`=================================\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
