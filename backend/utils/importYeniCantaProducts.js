require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const Category = require('../models/Category');

const sourceDir = path.join(__dirname, '..', '..', 'yeni canta');
const targetDir = path.join(__dirname, '..', 'uploads', 'products');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const categoryMap = [
  { key: 'classic', en: 'Classic', ar: 'كلاسيك', tr: 'Klasik', material: 'Structured premium leather' },
  { key: 'mini', en: 'Mini', ar: 'ميني', tr: 'Mini', material: 'Soft premium leather' },
  { key: 'shoulder', en: 'Shoulder', ar: 'كتف', tr: 'Omuz', material: 'Supple premium leather' },
  { key: 'evening', en: 'Evening', ar: 'سهرة', tr: 'Gece', material: 'Luxe satin finish' },
];

const names = [
  ['Melora Velvet Touch', 'ميلورا فيلفت تاتش', 'Melora Velvet Touch'],
  ['Melora Soft Pearl', 'ميلورا سوفت بيرل', 'Melora Soft Pearl'],
  ['Melora Golden Muse', 'ميلورا غولدن ميوز', 'Melora Golden Muse'],
  ['Melora Satin Glow', 'ميلورا ساتان جلو', 'Melora Satin Glow'],
  ['Melora Ivory Bloom', 'ميلورا آيفوري بلوم', 'Melora Ivory Bloom'],
  ['Melora Mini Charm', 'ميلورا ميني تشارم', 'Melora Mini Charm'],
  ['Melora Shoulder Grace', 'ميلورا كتف غريس', 'Melora Omuz Grace'],
  ['Melora Royal Night', 'ميلورا رويال نايت', 'Melora Royal Night'],
  ['Melora Classic Aura', 'ميلورا كلاسيك أورا', 'Melora Klasik Aura'],
  ['Melora Mini Shine', 'ميلورا ميني شاين', 'Melora Mini Shine'],
  ['Melora Soft Line', 'ميلورا سوفت لاين', 'Melora Soft Line'],
  ['Melora Evening Pearl', 'ميلورا سهرة بيرل', 'Melora Gece Pearl'],
  ['Melora Luxe Form', 'ميلورا لوكس فورم', 'Melora Luxe Form'],
  ['Melora Daily Chic', 'ميلورا ديلي شيك', 'Melora Daily Chic'],
  ['Melora Signature Glow', 'ميلورا سيغنتشر جلو', 'Melora Signature Glow'],
];

const prices = [1890, 1720, 1980, 2240, 1910, 1690, 1860, 2310, 1940, 1750, 1830, 2380, 2010, 1770, 2290];

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
          tr: category.tr,
        },
        slug: category.key,
        isActive: true,
      });
    }

    result[category.key] = doc;
  }

  return result;
};

const getDescription = (item, category) => ({
  en: `${item[0]} is a refined new arrival from Melora Moda, selected for elegant daily styling and polished occasions.`,
  ar: `${item[1]} من الإضافات الجديدة في Melora Moda، بحضور أنيق يناسب الإطلالات اليومية والمناسبات الراقية.`,
  tr: `${item[2]}, Melora Moda'nin gunluk siklik ve ozel davetler icin secilen yeni canta koleksiyonundan zarif bir modeldir.`,
});

const uploadImage = async (filePath, sku, altText) => {
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinary) {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'melora-products',
      public_id: sku.toLowerCase(),
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });

    return [
      {
        url: result.secure_url,
        altText,
        isMain: true,
        sortOrder: 0,
      },
    ];
  }

  return [
    {
      url: `/uploads/products/${path.basename(filePath)}`,
      altText,
      isMain: true,
      sortOrder: 0,
    },
  ];
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

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const productNo = String(index + 1).padStart(3, '0');
      const categoryMeta = categoryMap[index % categoryMap.length];
      const category = categories[categoryMeta.key];
      const item = names[index] || [
        `Melora New Bag ${productNo}`,
        `ميلورا حقيبة جديدة ${productNo}`,
        `Melora New Bag ${productNo}`,
      ];
      const price = prices[index] || 1790 + index * 25;
      const sku = `YNC-${productNo}`;
      const slug = `${slugify(item[0])}-${productNo}`;
      const ext = path.extname(file).toLowerCase() || '.jpeg';
      const targetFilename = `yeni-canta-${productNo}${ext}`;
      const targetPath = path.join(targetDir, targetFilename);

      fs.copyFileSync(path.join(sourceDir, file), targetPath);
      const imagePayload = await uploadImage(targetPath, sku, item[0]);

      const payload = {
        name: { en: item[0], ar: item[1], tr: item[2] },
        description: getDescription(item, categoryMeta),
        price,
        category: category._id,
        bagType: 'general',
        stock: 8,
        sku,
        slug,
        images: imagePayload,
        availableColors: [],
        availableSizes: [],
        specs: {
          brand: 'Melora',
          material: categoryMeta.material,
          piecesIncluded: 1,
          barcode: sku,
          origin: 'Turkiye',
        },
        isActive: true,
        isPublished: true,
        isFeatured: index < 6,
        badges: index < 6 ? ['New'] : [],
        tags: ['yeni-canta', 'melora-local', categoryMeta.key],
        seo: {
          metaTitle: `${item[0]} | Melora Moda`,
          metaDescription: `${item[0]} from Melora Moda. Shop the latest bag collection online.`,
        },
      };

      const existing = await Product.findOne({ sku });
      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: payload });
        updated += 1;
      } else {
        await Product.create(payload);
        created += 1;
      }
    }

    console.log(`Imported yeni canta products. created=${created} updated=${updated} totalFiles=${files.length}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

run();
