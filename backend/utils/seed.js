const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' }); // Make sure it finds the .env at backend root

// Load models
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Delete existing data
    await Order.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    console.log('Existing data deleted successfully.');

    // 1. Insert admin user
    try {
      await User.create({
        name: 'Admin Melora',
        email: 'admin@melora.com',
        password: 'Admin@1234',
        role: 'admin'
      });
      console.log('Admin user inserted successfully.');
    } catch (userErr) {
      console.error('Failed to insert Admin User:', userErr);
      throw userErr;
    }

    // 2. Insert 4 categories
    const categoriesData = [
      { name: { en: 'Classic', ar: 'كلاسيك', tr: 'Klasik' }, slug: 'classic', description: { en: 'Classic bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Mini', ar: 'ميني', tr: 'Mini' }, slug: 'mini', description: { en: 'Mini bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Shoulder', ar: 'كتف', tr: 'Omuz' }, slug: 'shoulder', description: { en: 'Shoulder bags', ar: 'حقائب', tr: 'Çantalar' } },
      { name: { en: 'Evening', ar: 'سهرة', tr: 'Gece' }, slug: 'evening', description: { en: 'Evening bags', ar: 'حقائب', tr: 'Çantalar' } },
    ];
    
    const categories = await Category.insertMany(categoriesData);
    console.log('4 Categories inserted successfully.');

    // 3. Insert 6 products
    const productsData = [
      {
        name: { en: 'Timeless Elegance Classic', ar: 'أناقة كلاسيكية خالدة', tr: 'Zamansız Zarafet Klasik' },
        description: { en: 'A truly classic piece for everyday carry.', ar: 'قطعة كلاسيكية', tr: 'Günlük taşıma için' },
        price: 850,
        category: categories[0]._id, // Classic
        brand: 'Melora',
        stock: 50,
        isFeatured: true,
        sku: 'MEL-CLS-001',
        slug: 'timeless-elegance-classic',
        images: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800']
      },
      {
        name: { en: 'Petite Charm Mini', ar: 'ميني ساحر', tr: 'Küçük Cazibe Mini' },
        description: { en: 'A perfectly sized mini bag for essentials.', ar: 'حقيبة ميني صغيرة', tr: 'Günlük boy mini çanta' },
        price: 450,
        salePrice: 399,
        category: categories[1]._id, // Mini
        brand: 'Melora',
        stock: 50,
        isFeatured: true,
        sku: 'MEL-MIN-001',
        slug: 'petite-charm-mini',
        images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800']
      },
      {
        name: { en: 'Everyday Comfort Shoulder', ar: 'كتف مريحة يومية', tr: 'Günlük Rahat Omuz Çantası' },
        description: { en: 'Comfortable and spacious shoulder bag.', ar: 'حقيبة كتف واسعة', tr: 'Geniş omuz çantası' },
        price: 620,
        category: categories[2]._id, // Shoulder
        brand: 'Melora',
        stock: 50,
        isFeatured: true,
        sku: 'MEL-SHL-001',
        slug: 'everyday-comfort-shoulder',
        images: ['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800']
      },
      {
        name: { en: 'Starlight Evening Clutch', ar: 'كلتش سهرة مضيء', tr: 'Yıldızışığı Gece Çantası' },
        description: { en: 'Shine during your evening events.', ar: 'تألقي في سهراتك', tr: 'Gece davetleri için' },
        price: 980,
        category: categories[3]._id, // Evening
        brand: 'Melora',
        stock: 50,
        isFeatured: false,
        sku: 'MEL-EVN-001',
        slug: 'starlight-evening-clutch',
        images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800']
      },
      {
        name: { en: 'Modern Work Classic', ar: 'كلاسيك العمل الحديث', tr: 'Modern İş Klasik' },
        description: { en: 'Structured bag for the modern professional.', ar: 'حقيبة عمل منظمة', tr: 'İş hayatı için' },
        price: 1150,
        category: categories[0]._id, // Classic
        brand: 'Melora',
        stock: 50,
        isFeatured: false,
        sku: 'MEL-CLS-002',
        slug: 'modern-work-classic',
        images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800']
      },
      {
        name: { en: 'Weekend Mini Crossbody', ar: 'كروس بودي ميني لعطلة نهاية الأسبوع', tr: 'Haftasonu Mini Çapraz' },
        description: { en: 'Light and breezy for weekends.', ar: 'خفيفة لعطلات نهاية الأسبوع', tr: 'Haftasonu için hafif' },
        price: 320,
        category: categories[1]._id, // Mini
        brand: 'Melora',
        stock: 50,
        isFeatured: false,
        sku: 'MEL-MIN-002',
        slug: 'weekend-mini-crossbody',
        images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800']
      }
    ];

    await Product.insertMany(productsData);
    console.log('6 Products inserted successfully.');

    console.log('Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed process failed with error:', error.message || error);
    if (error.errors) {
       console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
};

seedData();
