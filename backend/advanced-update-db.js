const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');
const Category = require('./models/Category');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let updatedCount = 0;
    let createdCount = 0;

    const resultsPath = path.join(__dirname, 'results.json');
    if (!fs.existsSync(resultsPath)) {
      console.error('results.json not found!');
      process.exit(1);
    }
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    // Step 1: Existing bag products CANTAA-001 to CANTAA-040
    console.log('\n--- Step 1: Updating Existing Bag Products ---');
    const existingBags = await Product.find({ sku: { $regex: /^CANTAA-/i } }).sort({ sku: 1 });
    
    // We filter bag images to ensure we only use the bag images
    const bagImages = results.filter(r => r.folder === 'melora-products/bags' || r.localFolder === 'bags');

    if (existingBags.length > 0) {
      for (let i = 0; i < existingBags.length; i++) {
        const product = existingBags[i];
        
        // Sequential 2 images per product
        const img1 = bagImages[i * 2];
        const img2 = bagImages[i * 2 + 1];

        const newImages = [];
        if (img1) {
          newImages.push({ url: img1.url, altText: `${product.name.en} 1`, isMain: true, sortOrder: 0 });
        }
        if (img2) {
          newImages.push({ url: img2.url, altText: `${product.name.en} 2`, isMain: false, sortOrder: 1 });
        }

        if (newImages.length > 0) {
          product.images = newImages;
          await product.save();
          updatedCount++;
          console.log(`Updated ${product.sku} (${product.name.en}) with ${newImages.length} images.`);
        }
      }
    } else {
      console.log('No existing CANTAA products found to update.');
    }

    // Helper function to get or create category
    async function getOrCreateCategory(enName, trName, arName, slug) {
      let category = await Category.findOne({ slug });
      if (!category) {
        category = new Category({
          name: { en: enName, tr: trName, ar: arName },
          slug,
          isActive: true
        });
        await category.save();
        console.log(`Created new Category: ${enName}`);
      }
      return category;
    }

    // Step 2: New products for Perfumes, Watches, Sunglasses
    console.log('\n--- Step 2: Creating New Products ---');
    const perfumesCategory = await getOrCreateCategory('Perfumes', 'Parfümler', 'عطور', 'perfumes');
    const watchesCategory = await getOrCreateCategory('Watches', 'Saatler', 'ساعات', 'watches');
    const sunglassesCategory = await getOrCreateCategory('Sunglasses', 'Gözlükler', 'نظارات شمسية', 'sunglasses');

    const perfumes = results.filter(r => r.folder === 'melora-products/perfumes' || r.localFolder === 'perfumes');
    const watches = results.filter(r => r.folder === 'melora-products/watches' || r.localFolder === 'watches');
    const sunglasses = results.filter(r => r.folder === 'melora-products/sunglasses' || r.localFolder === 'sunglasses');

    async function createProducts(items, baseName, skuPrefix, categoryId) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const productName = `${baseName} ${i + 1}`;
        // Ensure SKU is unique, auto-increment padding
        let skuSuffix = String(i + 1).padStart(3, '0');
        let sku = `${skuPrefix}-${skuSuffix}`;

        try {
          const newProduct = new Product({
            name: { en: productName, tr: productName, ar: productName },
            description: { 
              en: `Elegant ${baseName.toLowerCase()}`, 
              tr: `Zarif ${baseName.toLowerCase()}`, 
              ar: `راقي ${baseName.toLowerCase()}` 
            },
            price: 0,
            sku,
            slug: `${skuPrefix.toLowerCase()}-${skuSuffix}`,
            category: categoryId,
            isActive: false,
            isPublished: false,
            images: [{
              url: item.url,
              altText: productName,
              isMain: true,
              sortOrder: 0
            }]
          });

          await newProduct.save();
          createdCount++;
          console.log(`Created ${sku} (${productName}) from image ${item.fileName || item.filename}`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`Warning: SKU ${sku} already exists, skipping.`);
          } else {
            console.error(`Error creating ${sku}:`, err.message);
          }
        }
      }
    }

    if (perfumes.length > 0) {
      await createProducts(perfumes, 'Melora Perfume', 'PERF', perfumesCategory._id);
    }
    if (watches.length > 0) {
      await createProducts(watches, 'Melora Watch', 'WATCH', watchesCategory._id);
    }
    if (sunglasses.length > 0) {
      await createProducts(sunglasses, 'Melora Sunglasses', 'GLASS', sunglassesCategory._id);
    }

    console.log(`\n=================================`);
    console.log(`Operation Complete!`);
    console.log(`Bag Products updated: ${updatedCount}`);
    console.log(`New Products created: ${createdCount}`);
    console.log(`=================================`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error in script:', error);
    process.exit(1);
  }
}

main();
