require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('./models/Category');

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getSlugBase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/-\d{10,}$/i, '')
    .replace(/-\d+$/i, '')
    .trim();
}

function isBrokenImageUrl(value) {
  return /railway\.app\/uploads/i.test(String(value || ''));
}

function cloneImages(images, fallbackAltText) {
  return (Array.isArray(images) ? images : []).map((image, index) => ({
    url: image?.url || '',
    altText: image?.altText || fallbackAltText,
    isMain: index === 0 ? true : Boolean(image?.isMain),
    sortOrder: Number.isFinite(image?.sortOrder) ? image.sortOrder : index,
  }));
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({})
    .populate('category', 'slug')
    .select('sku slug name images category')
    .lean();

  const healthyProducts = products.filter((product) => !isBrokenImageUrl(product.images?.[0]?.url));
  const brokenProducts = products.filter((product) => isBrokenImageUrl(product.images?.[0]?.url));

  const healthyByName = new Map();
  const healthyBySlugBase = new Map();

  for (const product of healthyProducts) {
    const categorySlug = product.category?.slug || '';
    const localizedName =
      product.name?.en || product.name?.tr || product.name?.ar || product.slug || product.sku;
    const nameKey = `${categorySlug}::${normalizeText(localizedName)}`;
    const slugKey = `${categorySlug}::${getSlugBase(product.slug)}`;

    if (!healthyByName.has(nameKey)) {
      healthyByName.set(nameKey, []);
    }
    healthyByName.get(nameKey).push(product);

    if (!healthyBySlugBase.has(slugKey)) {
      healthyBySlugBase.set(slugKey, []);
    }
    healthyBySlugBase.get(slugKey).push(product);
  }

  let fixedCount = 0;
  const unmatched = [];

  for (const product of brokenProducts) {
    const categorySlug = product.category?.slug || '';
    const localizedName =
      product.name?.en || product.name?.tr || product.name?.ar || product.slug || product.sku;
    const nameKey = `${categorySlug}::${normalizeText(localizedName)}`;
    const slugKey = `${categorySlug}::${getSlugBase(product.slug)}`;

    const healthyMatch =
      (healthyByName.get(nameKey) || [])[0] ||
      (healthyBySlugBase.get(slugKey) || [])[0];

    if (!healthyMatch?.images?.length) {
      unmatched.push({
        sku: product.sku,
        slug: product.slug,
        category: categorySlug,
        name: localizedName,
      });
      continue;
    }

    const replacementImages = cloneImages(healthyMatch.images, localizedName);
    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          images: replacementImages,
        },
      }
    );

    fixedCount += 1;
    console.log(
      `Fixed ${product.sku} using ${healthyMatch.sku} (${categorySlug || 'uncategorized'})`
    );
  }

  console.log(
    JSON.stringify(
      {
        brokenCount: brokenProducts.length,
        fixedCount,
        unmatchedCount: unmatched.length,
        unmatched,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
