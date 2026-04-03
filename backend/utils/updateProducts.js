require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const enNames = ["Classic Tote", "Evening Clutch", "Shoulder Bag", "Mini Crossbody", "Quilted Flap", "Chain Bag", "Bucket Tote", "Structured Satchel", "Hobo Bag", "Zip Around", "Top Handle", "Envelope Clutch", "Drawstring Bag", "Flap Bag", "Saddle Bag", "Croc Embossed", "Suede Tote", "Velvet Clutch", "Patent Leather", "Woven Bag"];
const arNames = ["حقيبة كلاسيك", "حقيبة سهرة", "حقيبة كتف", "حقيبة صغيرة", "حقيبة مبطنة", "حقيبة بسلسلة", "حقيبة دلو", "حقيبة منظمة", "حقيبة هوبو", "حقيبة بسحاب", "حقيبة يد", "حقيبة مغلف", "حقيبة بشريط", "حقيبة فلاب", "حقيبة سادل", "حقيبة جلد تمساح", "حقيبة سويدي", "حقيبة مخمل", "حقيبة جلد لامع", "حقيبة منسوجة"];
const trNames = ["Klasik Çanta", "Gece Çantası", "Omuz Çantası", "Mini Çanta", "Kapitone Çanta", "Zincirli Çanta", "Kova Çanta", "Yapılandırılmış Çanta", "Hobo Çanta", "Fermuarlı Çanta", "Saplı Çanta", "Zarf Çanta", "İpli Çanta", "Kapak Çanta", "Eyer Çanta", "Timsah Desenli", "Süet Çanta", "Kadife Çanta", "Rugan Çanta", "Örgü Çanta"];

const categoryNames = [
    { en: 'Classic', ar: 'كلاسيك', tr: 'Klasik' },
    { en: 'Mini', ar: 'صغيرة', tr: 'Mini' },
    { en: 'Shoulder', ar: 'كتف', tr: 'Omuz' },
    { en: 'Evening', ar: 'سهرة', tr: 'Gece' }
];

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected.');

        // 1. Ensure Categories exist
        const catIds = [];
        for (const catObj of categoryNames) {
            let cat = await Category.findOne({ 'name.en': catObj.en });
            if (!cat) {
                console.log(`Creating missing category: ${catObj.en}`);
                cat = await Category.create({
                    name: catObj,
                    description: catObj,
                    isActive: true
                });
            }
            catIds.push(cat._id);
        }

        // 2. Fetch all recently created "Luxury Handbag" products
        let products = await Product.find({ 'name.en': /^Luxury Handbag/ }).sort({ createdAt: 1 });
        
        if (products.length === 0) {
            console.log("No generic 'Luxury Handbag' products found. Fetching ALL products instead to ensure update.");
            products = await Product.find({}).sort({ createdAt: 1 });
        }
        
        console.log(`Found ${products.length} products to update across the database.`);
        
        let count = 0;
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            
            // Random price between 1500 and 2500
            const randomPrice = Math.floor(Math.random() * (2500 - 1500 + 1)) + 1500;
            product.price = randomPrice;
            
            // Name rotation array (modulus logic ensures we cycle gracefully if over 20 images)
            const nameIndex = i % enNames.length;
            product.name = {
                en: enNames[nameIndex],
                ar: arNames[nameIndex],
                tr: trNames[nameIndex]
            };
            
            // Category rotation
            const catIndex = i % catIds.length;
            product.category = catIds[catIndex];
            
            // Featured logic (only first 12 get featured badge)
            product.isFeatured = i < 12;
            
            await product.save();
            count++;
        }
        
        console.log(`\n✅ SUCCESSFULLY UPDATED: ${count} products formatted accurately!`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update products:', err);
        process.exit(1);
    }
}

run();
