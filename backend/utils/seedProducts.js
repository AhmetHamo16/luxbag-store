require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Free Unsplash Handbag Image Library (Strictly Verified List)
const handbagImages = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800",
  "https://images.unsplash.com/photo-1590739225287-bd31519780c3?w=800",
  "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800",
  "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=800",
  "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=800",
  "https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=800",
  "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4d3f?w=800"
];


const rawData = [
  { n: "Classic Leather Tote", c: "Classic", pr: 450 },
  { n: "Minimalist Crossbody", c: "Mini", pr: 250 },
  { n: "Quilted Evening Clutch", c: "Evening", pr: 320 },
  { n: "Structured Satchel", c: "Classic", pr: 580 },
  { n: "Woven Beach Bag", c: "Shoulder", pr: 210 },
  { n: "Vintage Box Bag", c: "Mini", pr: 400 },
  { n: "Hobo Suede Catchall", c: "Shoulder", pr: 650 },
  { n: "Crystal Embellished Minaudiere", c: "Evening", pr: 1200 },
  { n: "Saffiano Zip Tote", c: "Classic", pr: 890 },
  { n: "Micro Belt Bag", c: "Mini", pr: 280 },
  { n: "Bucket Drawstring Bag", c: "Shoulder", pr: 450 },
  { n: "Satin Envelope Clutch", c: "Evening", pr: 380 },
  { n: "Everyday Shopper", c: "Classic", pr: 350 },
  { n: "Chain Link Flap Bag", c: "Shoulder", pr: 950 },
  { n: "Velvet Kiss-Lock Pouch", c: "Evening", pr: 420 },
  { n: "Monogram Weekender", c: "Classic", pr: 1450 },
  { n: "Croco Embossed Mini", c: "Mini", pr: 300 },
  { n: "Pearlescent Minaudière", c: "Evening", pr: 2200 },
  { n: "Slouchy Hobo Tote", c: "Shoulder", pr: 480 },
  { n: "Convertible Crossbody", c: "Shoulder", pr: 290 },
  { n: "Ruched Handle Bag", c: "Classic", pr: 850 },
  { n: "Dome Satchel", c: "Classic", pr: 590 },
  { n: "Silk Knot Clutch", c: "Evening", pr: 600 },
  { n: "Woven Raffia Tote", c: "Classic", pr: 250 },
  { n: "Chainmail Pouch", c: "Evening", pr: 980 }
];

const initSeeder = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI in .env");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Make sure we have the required categories initialized
    const targetCategories = ['Classic', 'Mini', 'Shoulder', 'Evening'];
    let catMap = {};
    for (let c of targetCategories) {
      let doc = await Category.findOne({ 'name.en': c });
      if (!doc) {
        doc = await Category.create({
          name: { en: c, ar: 'فئة', tr: 'Kategori' },
          slug: c.toLowerCase(),
          isActive: true
        });
      }
      catMap[c] = doc._id;
    }

    // Build the 25 items
    let payload = [];
    for (let i = 0; i < 25; i++) {
        const item = rawData[i];
        
        // Generate pseudo-unique base data
        const tStamp = Date.now() + i;
        const generatedSlug = `${item.n.toLowerCase().replace(/\s+/g, '-')}-${tStamp}`;
        const generatedSku = `BAG-${tStamp.toString().slice(-6)}-${i}`;

        payload.push({
            name: { 
                en: item.n, 
                ar: item.n, // Removed 'حقيبة' prefix
                tr: item.n  // Removed 'Çanta' prefix
            },
            description: {
                en: `A truly luxurious ${item.n} designed for elegant outings and pristine durability. Crafted with premium materials for the ultimate Melora finish.`,
                ar: 'وصف الفخامة للحقيبة الأنيقة',
                tr: 'Zarif çantamızın lüks açıklaması'
            },
            price: item.pr,
            category: catMap[item.c],
            stock: 50,
            sku: generatedSku,
            slug: generatedSlug,
            images: [
              { url: handbagImages[i % handbagImages.length], isMain: true, altText: item.n, sortOrder: 0 }
            ],
            isActive: true,
            isFeatured: i < 6 || i === 16 || i === 20 || i === 24 
        });
    }

    // Insert payload
    for(let doc of payload) {
      await Product.create(doc);
    }
    
    console.log(`Successfully seeded ${payload.length} products with authentic Unsplash image assets.`);
    process.exit(0);

  } catch (error) {
    console.error('Seeder Error:', error);
    process.exit(1);
  }
};

initSeeder();
