const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function listItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    let text = '=== PRODUCTS IN DB ===\n';
    const products = await Product.find({}, 'name sku bagType').lean();
    products.forEach(p => {
      text += `- [${p.sku}] ${p.name?.en || 'No Name'} (${p.bagType || 'N/A'})\n`;
    });

    text += '\n=== IMAGES IN results.json ===\n';
    const resultsPath = './results.json';
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      results.forEach((r, i) => {
        text += `${i+1}. ${r.fileName || r.filename} [Folder: ${r.localFolder || r.folder}]\n`;
      });
    }
    
    fs.writeFileSync('output-utf8.txt', text, 'utf8');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listItems();
