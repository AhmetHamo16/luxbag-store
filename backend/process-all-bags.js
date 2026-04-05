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

    // 1. Read files
    const files = fs.readdirSync(BAGS_DIR).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

    console.log(`Found ${files.length} images in ${BAGS_DIR}`);

    // 2. Upload ALL to Cloudinary
    const uploadedImages = [];
    console.log(`Starting Cloudinary upload...`);
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
    console.log(`Total images successfully uploaded: ${uploadedImages.length}`);

    // 3. Assign 2 images per product sequentially
    const existingBags = await Product.find({ sku: { $regex: /^CANTAA-/i } }).sort({ sku: 1 });
    console.log(`Found ${existingBags.length} existing CANTAA products.`);

    let imageIndex = 0;
    
    // Assign to existing products first
    for (const product of existingBags) {
      const img1 = uploadedImages[imageIndex++];
      const img2 = uploadedImages[imageIndex++];

      const newImages = [];
      if (img1) newImages.push({ url: img1.url, altText: `${product.name.en} 1`, isMain: true, sortOrder: 0 });
      if (img2) newImages.push({ url: img2.url, altText: `${product.name.en} 2`, isMain: false, sortOrder: 1 });

      product.images = newImages;
      await product.save();
      console.log(`Updated existing bag: ${product.sku} with ${newImages.length} images.`);
      
      if (imageIndex >= uploadedImages.length) break;
    }

    // 4. Create new products for leftover images
    let newBagCount = 0;
    
    if (imageIndex < uploadedImages.length) {
      console.log(`There are ${uploadedImages.length - imageIndex} leftover images. Creating new Bag products...`);
      
      const bagsCategory = await Category.findOne({ slug: 'bags' }); 
      // If 'bags' doesn't exist, we might need a fallback. Usually models are categorized using ObjectId.
      // E-commerce usually has "Bags" / "çanta". We will try to find it.
      let categoryId = bagsCategory ? bagsCategory._id : existingBags[0].category;

      // Calculate starting SKU number
      // Find the max SKU to continue incrementing cleanly instead of assuming length
      let maxSkuNum = 0;
      for (const p of existingBags) {
        const numMatch = p.sku.match(/CANTAA-(\d+)/i);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          if (num > maxSkuNum) maxSkuNum = num;
        }
      }

      let currentSkuNum = maxSkuNum + 1;

      while (imageIndex < uploadedImages.length) {
        const img1 = uploadedImages[imageIndex++];
        const img2 = uploadedImages[imageIndex++]; // Could be undefined if odd number of leftovers
        
        let skuSuffix = String(currentSkuNum).padStart(3, '0');
        let sku = `CANTAA-${skuSuffix}`;
        let productName = `Melora Exclusive Bag ${currentSkuNum}`;

        const newImages = [];
        if (img1) newImages.push({ url: img1.url, altText: `${productName} 1`, isMain: true, sortOrder: 0 });
        if (img2) newImages.push({ url: img2.url, altText: `${productName} 2`, isMain: false, sortOrder: 1 });

        const newProduct = new Product({
          name: { en: productName, tr: productName, ar: productName },
          description: { en: 'Exclusive bag.', tr: 'Özel çanta.', ar: 'حقيبة حصرية.' },
          price: 0,
          sku,
          slug: `cantaa-${skuSuffix}`,
          category: categoryId,
          isActive: false,
          isPublished: false,
          bagType: 'general',
          images: newImages
        });

        await newProduct.save();
        console.log(`Created new bag: ${sku} with ${newImages.length} images.`);
        newBagCount++;
        currentSkuNum++;
      }
    }

    console.log(`\n=================================`);
    console.log(`Final Report:`);
    console.log(`Total Uploaded: ${uploadedImages.length}`);
    console.log(`Existing Bags Updated: ${Math.min(existingBags.length, Math.ceil(uploadedImages.length / 2))}`);
    console.log(`New Bags Created: ${newBagCount}`);
    console.log(`=================================`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
