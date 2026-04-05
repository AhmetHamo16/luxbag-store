const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function updateDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const resultsPath = path.join(__dirname, 'results.json');
    if (!fs.existsSync(resultsPath)) {
      console.error('results.json not found!');
      process.exit(1);
    }
    
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    let updatedCount = 0;
    
    // We can use a set to track products we've already modified
    // in case there are multiple images for the same product to append them.
    const modifiedProducts = new Set(); 

    for (const item of results) {
      if (!item.fileName) continue;
      
      const nameWithoutExt = path.parse(item.fileName).name;
      const safeName = escapeRegExp(nameWithoutExt);

      // Perform a case-insensitive search matching either SKU or english Name
      let product = await Product.findOne({
        $or: [
          { sku: new RegExp('^' + safeName + '$', 'i') },
          { 'name.en': new RegExp('^' + safeName + '$', 'i') }
        ]
      });

      if (product) {
        if (!modifiedProducts.has(product._id.toString())) {
          // If this is the first image for this product in this run, replace existing
          product.images = [{
            url: item.url,
            altText: product.name?.en || nameWithoutExt,
            isMain: true,
            sortOrder: 0
          }];
          modifiedProducts.add(product._id.toString());
        } else {
          // Append if it's an additional image for the same product
          product.images.push({
            url: item.url,
            altText: product.name?.en || nameWithoutExt,
            isMain: false,
            sortOrder: product.images.length
          });
        }

        await product.save();
        updatedCount++;
        console.log(`Updated product: ${product.name.en} (SKU: ${product.sku}) with image: ${item.fileName}`);
      } else {
        console.log(`No match found for filename: ${item.fileName} \t(searched as '${nameWithoutExt}')`);
      }
    }

    console.log(`\n=================================\nSuccessfully updated ${modifiedProducts.size} unique products with ${updatedCount} image operations.\n=================================`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateDB();
