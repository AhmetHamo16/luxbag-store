require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const folderPath = process.argv[2] || 'C:/Users/Lenovo/Desktop/cantaa';
const files = fs.readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

console.log(`Found ${files.length} images. Uploading...`);

const results = [];

const uploadNext = async (index) => {
  if (index >= files.length) {
    fs.writeFileSync('uploaded-images.json', JSON.stringify(results, null, 2));
    console.log('\n✅ Done! All URLs saved to uploaded-images.json');
    results.forEach(r => console.log(r.name, '->', r.url));
    process.exit(0);
    return;
  }
  const file = files[index];
  const filePath = path.join(folderPath, file);
  console.log(`Uploading ${index + 1}/${files.length}: ${file}`);
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'melora/products',
      timeout: 60000,
    });
    results.push({ name: file, url: result.secure_url });
    console.log(`✅ ${file} -> ${result.secure_url}`);
  } catch (err) {
    console.log(`❌ Failed: ${file} - ${err.message}`);
  }
  uploadNext(index + 1);
};

uploadNext(0);
