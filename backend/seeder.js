const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

// Connect DB
mongoose.connect(process.env.MONGODB_URI);

const importData = async () => {
  try {
    // Clear out existing data
    await Order.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();

    console.log('Cleared existing data.');

    // Create Admin User
    const admin = new User({
      name: 'Admin Melora',
      email: 'admin@melora.com',
      password: 'password123',
      role: 'admin'
    });
    // Triggers pre-save hook to hash password
    await admin.save();
    console.log('Admin user created.');

    const user1 = new User({
        name: 'Test Customer',
        email: 'user@melora.com',
        password: 'password123',
        role: 'user'
      });
      await user1.save();

    // Create Categories
    const categories = await Category.insertMany([
      { name: { en: 'Tote', ar: 'حقيبة كلاسيكية', tr: 'Omuz Çantası' }, slug: 'tote', description: { en: 'Tote bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Clutch', ar: 'حقيبة يد', tr: 'Portföy Çanta' }, slug: 'clutch', description: { en: 'Clutch bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Crossbody', ar: 'حقيبة كروس', tr: 'Omuz Askılı Çanta' }, slug: 'crossbody', description: { en: 'Crossbody bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Satchel', ar: 'ساتشيل', tr: 'El Çantası' }, slug: 'satchel', description: { en: 'Satchel bags', ar: 'حقائب', tr: 'Çantalar' } }
    ]);
    console.log('Categories created.');

    // Create Products
    const sampleProducts = [
      {
        name: { en: 'Classic Elegance Tote', ar: 'حقيبة كلاسيكية', tr: 'Klasik Zarif Çanta' },
        description: { en: 'The Classic Elegance Tote is crafted from premium Italian leather. It features a spacious interior, gold-tone hardware, and a timeless silhouette that transitions effortlessly from day to night. Perfectly sized to carry your daily essentials with style.', ar: 'وصف', tr: 'Açıklama' },
        price: 850,
        category: categories[0]._id,
        brand: 'Melora',
        stock: 15,
        sku: 'MEL-TTE-001',
        images: [
            'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800',
            'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800'
        ]
      },
      {
        name: { en: 'Midnight Suede Clutch', ar: 'حقيبة يد', tr: 'Gece Süet Portföy' },
        description: { en: 'Perfect for evenings out, this clutch is stunning. Features exquisite suede texture with minimal gold accents.', ar: 'وصف', tr: 'Açıklama' },
        price: 450,
        salePrice: 399,
        category: categories[1]._id,
        brand: 'Melora',
        stock: 5,
        sku: 'MEL-CLU-001',
        images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800']
      },
      {
        name: { en: 'Signature Crossbody', ar: 'حقيبة كروس', tr: 'Özel Seri Omuz Askılı' },
        description: { en: 'Our signature crossbody bag offers both functionality and undeniable style for the modern woman on the go.', ar: 'وصف', tr: 'Açıklama' },
        price: 620,
        category: categories[2]._id,
        brand: 'Melora',
        stock: 8,
        sku: 'MEL-CRB-001',
        images: ['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800']
      },
      {
        name: { en: 'Royal Leather Satchel', ar: 'حقيبة جلد', tr: 'Kraliyet Deri El Çantası' },
        description: { en: 'Command attention with the Royal Leather Satchel, featuring structured design and unmatched craftsmanship.', ar: 'وصف', tr: 'Açıklama' },
        price: 980,
        category: categories[3]._id,
        brand: 'Melora',
        stock: 3,
        sku: 'MEL-SAT-001',
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800']
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Products created.');

    console.log('Data Imported successfully! Admin: admin@melora.com / password123');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
      await Order.deleteMany();
      await User.deleteMany();
      await Product.deleteMany();
      await Category.deleteMany();
      console.log('Data Destroyed!');
      process.exit();
    } catch (error) {
      console.error(`Error with data destroy: ${error.message}`);
      process.exit(1);
    }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
