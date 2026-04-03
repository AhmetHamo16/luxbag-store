require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const preferredSourceDir = path.join(__dirname, '..', '..', 'cantaa');
const legacySourceDir = path.join(__dirname, '..', '..', 'CANTA', 'cantaa');
const sourceDir = fs.existsSync(preferredSourceDir) ? preferredSourceDir : legacySourceDir;
const targetDir = path.join(__dirname, '..', 'uploads', 'products');

const categoryMap = [
  { key: 'classic', en: 'Classic', ar: 'كلاسيك', tr: 'Klasik' },
  { key: 'mini', en: 'Mini', ar: 'ميني', tr: 'Mini' },
  { key: 'shoulder', en: 'Shoulder', ar: 'كتف', tr: 'Omuz' },
  { key: 'evening', en: 'Evening', ar: 'سهرة', tr: 'Gece' }
];

const catalog = [
  { en: 'Melora Classic Grace', ar: 'ميلورا كلاسيك غريس', tr: 'Melora Klasik Zarafet', price: 1890, pieces: 1 },
  { en: 'Melora Mini Pearl', ar: 'ميلورا ميني بيرل', tr: 'Melora Mini Inci', price: 1640, pieces: 1 },
  { en: 'Melora Shoulder Aura', ar: 'ميلورا كتف أورا', tr: 'Melora Omuz Aura', price: 1780, pieces: 2 },
  { en: 'Melora Evening Glow', ar: 'ميلورا سهرة جلو', tr: 'Melora Gece Isiltisi', price: 2120, pieces: 1 },
  { en: 'Melora Classic Charm', ar: 'ميلورا كلاسيك تشارم', tr: 'Melora Klasik Cazibe', price: 1950, pieces: 1 },
  { en: 'Melora Mini Bloom', ar: 'ميلورا ميني بلوم', tr: 'Melora Mini Cicek', price: 1580, pieces: 1 },
  { en: 'Melora Shoulder Muse', ar: 'ميلورا كتف ميوز', tr: 'Melora Omuz Ilham', price: 1840, pieces: 2 },
  { en: 'Melora Evening Satin', ar: 'ميلورا سهرة ساتان', tr: 'Melora Gece Saten', price: 2260, pieces: 1 },
  { en: 'Melora Classic Velvet', ar: 'ميلورا كلاسيك فيلفت', tr: 'Melora Klasik Kadife', price: 2010, pieces: 1 },
  { en: 'Melora Mini Crystal', ar: 'ميلورا ميني كريستال', tr: 'Melora Mini Kristal', price: 1710, pieces: 1 },
  { en: 'Melora Shoulder Soft', ar: 'ميلورا كتف سوفت', tr: 'Melora Omuz Soft', price: 1765, pieces: 2 },
  { en: 'Melora Evening Royal', ar: 'ميلورا سهرة رويال', tr: 'Melora Gece Royal', price: 2380, pieces: 1 },
  { en: 'Melora Classic Ivory', ar: 'ميلورا كلاسيك آيفوري', tr: 'Melora Klasik Fildisi', price: 1930, pieces: 1 },
  { en: 'Melora Mini Chic', ar: 'ميلورا ميني شيك', tr: 'Melora Mini Sik', price: 1625, pieces: 1 },
  { en: 'Melora Shoulder Nova', ar: 'ميلورا كتف نوفا', tr: 'Melora Omuz Nova', price: 1815, pieces: 2 },
  { en: 'Melora Evening Moon', ar: 'ميلورا سهرة مون', tr: 'Melora Gece Ay', price: 2290, pieces: 1 },
  { en: 'Melora Classic Line', ar: 'ميلورا كلاسيك لاين', tr: 'Melora Klasik Cizgi', price: 2050, pieces: 1 },
  { en: 'Melora Mini Rose', ar: 'ميلورا ميني روز', tr: 'Melora Mini Gul', price: 1695, pieces: 1 },
  { en: 'Melora Shoulder Elite', ar: 'ميلورا كتف إيليت', tr: 'Melora Omuz Elite', price: 1885, pieces: 2 },
  { en: 'Melora Evening Noir', ar: 'ميلورا سهرة نوار', tr: 'Melora Gece Noir', price: 2440, pieces: 1 },
  { en: 'Melora Classic Silk', ar: 'ميلورا كلاسيك سيلك', tr: 'Melora Klasik Ipek', price: 1970, pieces: 1 },
  { en: 'Melora Mini Star', ar: 'ميلورا ميني ستار', tr: 'Melora Mini Yildiz', price: 1660, pieces: 1 },
  { en: 'Melora Shoulder Pure', ar: 'ميلورا كتف بيور', tr: 'Melora Omuz Pure', price: 1835, pieces: 2 },
  { en: 'Melora Evening Gem', ar: 'ميلورا سهرة جيم', tr: 'Melora Gece Mucevher', price: 2350, pieces: 1 },
  { en: 'Melora Classic Shine', ar: 'ميلورا كلاسيك شاين', tr: 'Melora Klasik Isik', price: 2080, pieces: 1 },
  { en: 'Melora Mini Touch', ar: 'ميلورا ميني تاتش', tr: 'Melora Mini Dokunus', price: 1735, pieces: 1 },
  { en: 'Melora Shoulder Luxe', ar: 'ميلورا كتف لوكس', tr: 'Melora Omuz Luks', price: 1910, pieces: 2 },
  { en: 'Melora Evening Pearl', ar: 'ميلورا سهرة بيرل', tr: 'Melora Gece Inci', price: 2480, pieces: 1 },
  { en: 'Melora Classic Aura', ar: 'ميلورا كلاسيك أورا', tr: 'Melora Klasik Aura', price: 1990, pieces: 1 },
  { en: 'Melora Mini Belle', ar: 'ميلورا ميني بيل', tr: 'Melora Mini Belle', price: 1685, pieces: 1 },
  { en: 'Melora Shoulder Wave', ar: 'ميلورا كتف ويف', tr: 'Melora Omuz Dalga', price: 1860, pieces: 2 },
  { en: 'Melora Evening Grace', ar: 'ميلورا سهرة غريس', tr: 'Melora Gece Zarafet', price: 2325, pieces: 1 },
  { en: 'Melora Classic Gold', ar: 'ميلورا كلاسيك غولد', tr: 'Melora Klasik Altin', price: 2140, pieces: 1 },
  { en: 'Melora Mini Aura', ar: 'ميلورا ميني أورا', tr: 'Melora Mini Aura', price: 1740, pieces: 1 },
  { en: 'Melora Shoulder Chic', ar: 'ميلورا كتف شيك', tr: 'Melora Omuz Sik', price: 1895, pieces: 2 },
  { en: 'Melora Evening Crystal', ar: 'ميلورا سهرة كريستال', tr: 'Melora Gece Kristal', price: 2520, pieces: 1 },
  { en: 'Melora Classic Prime', ar: 'ميلورا كلاسيك برايم', tr: 'Melora Klasik Prime', price: 2095, pieces: 1 },
  { en: 'Melora Mini Queen', ar: 'ميلورا ميني كوين', tr: 'Melora Mini Kralice', price: 1775, pieces: 1 },
  { en: 'Melora Shoulder Soft Gold', ar: 'ميلورا كتف سوفت غولد', tr: 'Melora Omuz Soft Gold', price: 1935, pieces: 2 },
  { en: 'Melora Evening Signature', ar: 'ميلورا سهرة سيغنتشر', tr: 'Melora Gece Signature', price: 2590, pieces: 1 }
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ensureCategories = async () => {
  const result = {};
  for (const category of categoryMap) {
    let doc = await Category.findOne({ slug: category.key });
    if (!doc) {
      doc = await Category.create({
        name: {
          en: category.en,
          ar: category.ar,
          tr: category.tr
        },
        slug: category.key,
        isActive: true
      });
    }
    result[category.key] = doc;
  }
  return result;
};

const run = async () => {
  try {
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source folder not found: ${sourceDir}`);
    }

    fs.mkdirSync(targetDir, { recursive: true });
    await mongoose.connect(process.env.MONGODB_URI);

    const categories = await ensureCategories();
    const files = fs
      .readdirSync(sourceDir)
      .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    let created = 0;
    let updated = 0;

    for (let index = 0; index < catalog.length; index += 1) {
      const file = files[index];
      const item = catalog[index];
      const categoryMeta = categoryMap[index % categoryMap.length];
      const category = categories[categoryMeta.key];
      const productNo = String(index + 1).padStart(3, '0');
      const sku = `CANTAA-${productNo}`;
      const slug = `${slugify(item.en)}-${productNo}`;
      const descriptionEn = `${item.en} from the Melora collection, curated from the local cantaa gallery for elegant daily and occasion styling.`;
      const descriptionAr = `${item.ar} من مجموعة ميلورا، بحضور أنيق يناسب الإطلالات اليومية والمناسبات الخاصة.`;
      const descriptionTr = `${item.tr}, Melora koleksiyonunda yer alan ve gunluk siklikla ozel davetler icin hazirlanan zarif bir canta tasarimidir.`;

      const existing = await Product.findOne({ sku });
      let imagePayload = existing?.images || [];

      if (file) {
        const ext = path.extname(file).toLowerCase() || '.jpeg';
        const targetFilename = `cantaa-${productNo}${ext}`;
        const targetPath = path.join(targetDir, targetFilename);
        fs.copyFileSync(path.join(sourceDir, file), targetPath);
        imagePayload = [
          {
            url: `/uploads/products/${targetFilename}`,
            altText: item.en,
            isMain: true,
            sortOrder: 0
          }
        ];
      }

      const payload = {
        name: { en: item.en, ar: item.ar, tr: item.tr },
        description: { en: descriptionEn, ar: descriptionAr, tr: descriptionTr },
        price: item.price,
        category: category._id,
        stock: 12,
        sku,
        slug,
        images: imagePayload,
        availableColors: [],
        availableSizes: [],
        specs: {
          brand: 'Melora',
          material: categoryMeta.key === 'evening' ? 'Luxe satin finish' : categoryMeta.key === 'classic' ? 'Structured premium leather' : 'Soft premium leather',
          piecesIncluded: item.pieces,
          barcode: sku,
          origin: 'Turkiye'
        },
        isActive: true,
        isPublished: true,
        isFeatured: index < 8,
        badges: index < 8 ? ['Featured'] : [],
        tags: ['cantaa', categoryMeta.key, 'melora-local']
      };

      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        await Product.create(payload);
        created += 1;
      }
    }

    console.log(`Imported local cantaa products. created=${created} updated=${updated} totalFiles=${files.length} catalog=${catalog.length}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
