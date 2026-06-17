const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('./models/Category');

const RESULTS_PATH = path.join(__dirname, 'results.json');
const BACKUP_PATH = path.join('C:', 'tmp', `melora-image-backup-${Date.now()}.json`);

const categoryGroupMap = {
  mini: 'bags',
  classic: 'bags',
  evening: 'bags',
  wallet: 'bags',
  shoulder: 'bags',
  backpack: 'bags',
  watches: 'watches',
  sunglasses: 'sunglasses',
  perfumes: 'perfumes',
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const isBrokenUrl = (value) => /railway\.app\/uploads/i.test(String(value || ''));

const firstImageUrl = (product) => product.images?.[0]?.url || '';

const cloneImages = (images, fallbackAltText) =>
  (Array.isArray(images) ? images : [])
    .filter((image) => image?.url)
    .map((image, index) => ({
      url: image.url,
      altText: image.altText || fallbackAltText,
      isMain: index === 0,
      sortOrder: index,
    }));

const buildImagePools = () => {
  const results = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  return results.reduce((pools, item) => {
    if (!item.localFolder || !item.url) return pools;
    if (!pools[item.localFolder]) pools[item.localFolder] = [];
    pools[item.localFolder].push(item.url);
    return pools;
  }, {});
};

const takeFromPool = (pool, startIndex, count, altText) => {
  if (!pool?.length) return [];

  const images = [];
  for (let i = 0; i < Math.max(1, count); i += 1) {
    const url = pool[(startIndex + i) % pool.length];
    images.push({
      url,
      altText,
      isMain: i === 0,
      sortOrder: i,
    });
  }
  return images;
};

async function main() {
  const applyChanges = process.argv.includes('--apply');
  const pools = buildImagePools();
  const poolCursor = {};

  await mongoose.connect(process.env.MONGODB_URI);

  const products = await Product.find({})
    .populate('category', 'slug')
    .sort({ createdAt: 1, sku: 1 })
    .exec();

  const healthyByKey = new Map();
  const brokenProducts = [];

  for (const product of products) {
    const categorySlug = product.category?.slug || '';
    const name = product.name?.en || product.name?.tr || product.name?.ar || product.slug || product.sku;
    const key = `${categorySlug}::${normalizeText(name)}`;
    const hasBrokenImage = isBrokenUrl(firstImageUrl(product));

    if (hasBrokenImage) {
      brokenProducts.push(product);
      continue;
    }

    if (product.images?.length && !healthyByKey.has(key)) {
      healthyByKey.set(key, product);
    }
  }

  const backup = [];
  const planned = [];

  for (const product of brokenProducts) {
    const categorySlug = product.category?.slug || '';
    const group = categoryGroupMap[categorySlug] || 'bags';
    const name = product.name?.en || product.name?.tr || product.name?.ar || product.slug || product.sku;
    const key = `${categorySlug}::${normalizeText(name)}`;
    const healthyMatch = healthyByKey.get(key);

    let replacementImages = cloneImages(healthyMatch?.images, name);
    let source = healthyMatch ? `matched:${healthyMatch.sku}` : '';

    if (!replacementImages.length) {
      const startIndex = poolCursor[group] || 0;
      replacementImages = takeFromPool(pools[group], startIndex, product.images?.length || 1, name);
      poolCursor[group] = startIndex + Math.max(1, product.images?.length || 1);
      source = `pool:${group}`;
    }

    if (!replacementImages.length) {
      planned.push({
        sku: product.sku,
        category: categorySlug,
        status: 'skipped',
        reason: `No image pool for ${group}`,
      });
      continue;
    }

    backup.push({
      _id: product._id,
      sku: product.sku,
      slug: product.slug,
      name,
      category: categorySlug,
      images: product.images,
    });

    planned.push({
      sku: product.sku,
      category: categorySlug,
      status: applyChanges ? 'updated' : 'planned',
      source,
      oldFirstImage: firstImageUrl(product),
      newFirstImage: replacementImages[0].url,
      imageCount: replacementImages.length,
    });

    if (applyChanges) {
      product.images = replacementImages;
      await product.save();
    }
  }

  if (applyChanges) {
    fs.mkdirSync(path.dirname(BACKUP_PATH), { recursive: true });
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2));
  }

  console.log(JSON.stringify({
    applyChanges,
    brokenFound: brokenProducts.length,
    changed: planned.filter((item) => item.status === 'updated' || item.status === 'planned').length,
    skipped: planned.filter((item) => item.status === 'skipped').length,
    backupPath: applyChanges ? BACKUP_PATH : null,
    planned,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
