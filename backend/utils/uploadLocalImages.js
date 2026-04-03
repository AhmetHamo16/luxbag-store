require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const folderPath = 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\CANTA\\cantaa';

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');

    let category = await Category.findOne({ 'name.en': 'Classic' });
    if (!category) {
      console.log('Category "Classic" not found. Creating it...');
      category = await Category.create({
        name: { en: 'Classic', ar: 'كلاسيك', tr: 'Klasik' },
        description: { en: 'Classic collection', ar: 'مجموعة كلاسيكية', tr: 'Klasik koleksiyon' },
        isActive: true
      });
    }

    if (!fs.existsSync(folderPath)) {
      console.log(`Folder path does not exist: ${folderPath}`);
      process.exit(1);
    }

    const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
    console.log(`Found ${files.length} images. Starting one-by-one upload with 2s delay...`);

    let count = 1;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      try {
        console.log(`\n[${count}/${files.length}] Uploading ${file}...`);
        
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'melora/products',
          timeout: 30000, 
        });
        
        const sku = `CL-${Date.now()}-${count}`;
        const slug = `luxury-handbag-${Date.now()}-${count}`;

        const product = new Product({
          name: { en: `Luxury Handbag ${count}`, ar: `حقيبة يد فاخرة ${count}`, tr: `Lüks El Çantası ${count}` },
          description: { en: 'A beautiful structured luxury handbag. Perfect for any occasion.', ar: 'حقيبة يد فاخرة وجميلة.', tr: 'Güzel lüks bir el çantası.' },
          price: 500,
          category: category._id,
          stock: 50,
          isActive: true,
          isFeatured: true,
          isPublished: true,
          sku: sku,
          slug: slug,
          images: [{
            url: result.secure_url,
            isMain: true,
            sortOrder: 0
          }]
        });

        await product.save();
        console.log(`✅ Done: ${file} -> Product: ${product.name.en} (SKU: ${sku})`);
        
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (err) {
        console.log(`❌ Failed: ${file} — ${err.message}`);
      } finally {
        count++;
      }
    }

    console.log('\n🎉 Finished processing all images!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
};

run();
