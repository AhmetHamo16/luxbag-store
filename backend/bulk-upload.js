const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Update the sunglasses path when provided
const FOLDERS_TO_UPLOAD = [
  { localPath: 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\janta', cloudFolder: 'melora-products/bags' },
  { localPath: 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\parfum', cloudFolder: 'melora-products/perfumes' },
  { localPath: 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\saat', cloudFolder: 'melora-products/watches' },
  { localPath: 'C:\\Users\\Lenovo\\Desktop\\Melora\\luxbag\\gozluk', cloudFolder: 'melora-products/sunglasses' }
];

async function deleteExistingImages() {
  console.log('Deleting existing images from melora-products folder on Cloudinary...');
  try {
    let nextCursor = null;
    let deletedCount = 0;
    
    // Cloudinary's Admin API delete_resources_by_prefix will remove images recursively
    // if the prefix acts like a folder path.
    do {
      const result = await cloudinary.api.delete_resources_by_prefix('melora-products', { next_cursor: nextCursor });
      
      if (result.deleted) {
        deletedCount += Object.keys(result.deleted).length;
      }
      
      nextCursor = result.next_cursor;
    } while (nextCursor);
    
    console.log(`Deleted ${deletedCount} existing images from Cloudinary.`);
  } catch (error) {
    console.error('Error deleting existing images:', error);
  }
}

async function uploadImages() {
  const uploadResults = [];
  const itemsToUpload = [];
  
  console.log('\nScanning local folders for images...');
  
  // Gather all files to know the total count for the progress indicator
  for (const folderConfig of FOLDERS_TO_UPLOAD) {
    if (!fs.existsSync(folderConfig.localPath)) {
      console.warn(`Local path not found: ${folderConfig.localPath}`);
      continue;
    }
    
    const files = fs.readdirSync(folderConfig.localPath);
    for (const file of files) {
      // Basic image filter
      if (file.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        itemsToUpload.push({
          filePath: path.join(folderConfig.localPath, file),
          fileName: file,
          cloudFolder: folderConfig.cloudFolder
        });
      }
    }
  }

  const total = itemsToUpload.length;
  console.log(`Found ${total} images to upload.\n`);

  for (let i = 0; i < total; i++) {
    const item = itemsToUpload[i];
    try {
      // Upload using uploader API
      const result = await cloudinary.uploader.upload(item.filePath, {
        folder: item.cloudFolder,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });
      
      console.log(`Uploading ${i + 1}/${total}: ${item.fileName} ✓`);
      
      // Save result
      uploadResults.push({
        fileName: item.fileName,
        localFolder: item.cloudFolder.split('/').pop(), // e.g. "bags"
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (error) {
      console.error(`Uploading ${i + 1}/${total}: ${item.fileName} ❌ - Error: ${error.message}`);
    }
  }

  // Save results to results.json
  const resultsPath = path.join(__dirname, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(uploadResults, null, 2));
  console.log(`\nUpload complete. Results saved to ${resultsPath}`);
}

async function main() {
  console.log('--- Starting Cloudinary Bulk Upload ---');
  await deleteExistingImages();
  await uploadImages();
  console.log('--- Process Finished ---');
}

main();
