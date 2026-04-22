const Product = require('../models/Product');
const { safeDestroy } = require('../config/cloudinary');
const mongoose = require('mongoose');
const { resolveUploadedFileUrl } = require('../utils/uploadedFile');

// Helper to extract Cloudinary public_id from URL
const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1];
  return fileWithExtension.split('.')[0];
};

// Helper to safely parse JSON from FormData
const parseJSONFields = (body) => {
  const parsed = { ...body };
  const jsonFields = ['name', 'description', 'specs', 'seo', 'availableColors', 'availableSizes', 'variants', 'tags', 'badges'];
  
  jsonFields.forEach(field => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (e) {
        // Leave as string if it fails (e.g., standard form submit instead of FormData stringify)
      }
    }
  });

  // Handle bracket notation parsing e.g., name[en]="Bag" -> name: { en: "Bag" }
  Object.keys(parsed).forEach(key => {
    const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
    if (match) {
      const parent = match[1];
      const child = match[2];
      if (!parsed[parent] || typeof parsed[parent] !== 'object') {
        parsed[parent] = {};
      }
      parsed[parent][child] = parsed[key];
      delete parsed[key]; // Clean up raw bracket key
    }
  });

  return parsed;
};

const normalizeStockData = (payload) => {
  const normalized = { ...payload };
  const shouldRecalculateStock =
    normalized.stock !== undefined ||
    normalized.variants !== undefined ||
    normalized.stockControl !== undefined;

  if (normalized.stock !== undefined && normalized.stock !== '') {
    normalized.stock = Math.max(0, Number(normalized.stock));
  }

  if (normalized.price !== undefined && normalized.price !== '') {
    normalized.price = Number(normalized.price);
  }

  if (normalized.salePrice !== undefined && normalized.salePrice !== '') {
    normalized.salePrice = Number(normalized.salePrice);
  }

  if (normalized.costPrice !== undefined && normalized.costPrice !== '') {
    normalized.costPrice = Math.max(0, Number(normalized.costPrice));
  }

  if (Array.isArray(normalized.variants)) {
    normalized.variants = normalized.variants.map((variant) => ({
      ...variant,
      stock: Math.max(0, Number(variant.stock || 0)),
      salePrice: variant.salePrice === undefined || variant.salePrice === '' ? undefined : Number(variant.salePrice)
    }));
  }

  if (shouldRecalculateStock) {
    const totalStock = normalized.variants?.length
      ? normalized.variants.reduce((total, variant) => total + (Number(variant.stock) || 0), 0)
      : Math.max(0, Number(normalized.stock || 0));

    normalized.stockControl = {
      ...(normalized.stockControl || {}),
      totalStock,
      lowStockAlert: totalStock > 0 && totalStock <= 2
    };
  }

  return normalized;
};

const sanitizeSku = (value) => String(value || '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9_-]+/g, '')
  .toUpperCase();

const buildSkuCandidate = (baseSku, suffix) => {
  const safeBase = sanitizeSku(baseSku) || 'SKU';
  return suffix ? `${safeBase}-${suffix}` : safeBase;
};

const ensureUniqueSku = async (baseSku, excludeId = null) => {
  const safeBase = buildSkuCandidate(baseSku);
  const baseQuery = excludeId ? { _id: { $ne: excludeId } } : {};

  const existingBase = await Product.findOne({ ...baseQuery, sku: safeBase }).select('_id');
  if (!existingBase) {
    return safeBase;
  }

  let candidate = '';
  do {
    const suffix = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    candidate = buildSkuCandidate(safeBase, suffix);
  } while (await Product.findOne({ ...baseQuery, sku: candidate }).select('_id'));

  return candidate;
};

// @desc    Get all products (with DB filtering)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const query = {};
    const isAdminRequest = req.user?.role === 'admin';
    const includeInactive = req.query.includeInactive === 'true' || req.query.all === 'true';

    if (!isAdminRequest || !includeInactive) {
      query.isActive = true;
    }
    
    // Multi-language full-text search support
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { 'name.en': searchRegex },
        { 'name.ar': searchRegex },
        { 'name.tr': searchRegex },
        { 'description.en': searchRegex },
        { 'description.ar': searchRegex },
        { 'description.tr': searchRegex },
        { sku: searchRegex },
        { 'specs.barcode': searchRegex },
        { 'variants.sku': searchRegex }
      ];
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    let limit = 0;
    if (req.query.limit) {
      limit = parseInt(req.query.limit, 10);
    }

    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('category', 'name slug');
        
    res.status(200).json({ success: true, count: products.length, data: products, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const conditions = req.user?.role === 'admin' ? {} : { isActive: true };
    let product = await Product.findOne({ slug: req.params.slug, ...conditions }).populate('category', 'name slug');
    if (!product && mongoose.Types.ObjectId.isValid(req.params.slug)) {
      product = await Product.findOne({ _id: req.params.slug, ...conditions }).populate('category', 'name slug');
    }
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user?.role !== 'admin') {
      query.isActive = true;
    }
    const product = await Product.findOne(query).populate('category', 'name slug');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    let productData = parseJSONFields(req.body);

    productData.sku = await ensureUniqueSku(productData.sku);

    // Ensure slug uniqueness
    if (productData.slug) {
      const existingProduct = await Product.findOne({ slug: productData.slug });
      if (existingProduct) {
        productData.slug = `${productData.slug}-${Date.now()}`;
      }
    }
    
    // Process Images
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
      }
    }
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(req.files.map(async (file, index) => ({
        url: await resolveUploadedFileUrl(file, req, { folder: 'melora/products', resourceType: 'image' }),
        altText: productData.name?.en || 'Product Image',
        isMain: index === 0 && existingImages.length === 0, // First uploaded is main if no existing
        sortOrder: existingImages.length + index
      })));
    }
    
    productData.images = [...existingImages, ...uploadedImages];
    productData = normalizeStockData(productData);
    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let updateData = parseJSONFields(req.body);

    if (updateData.sku) {
      updateData.sku = await ensureUniqueSku(updateData.sku, req.params.id);
    }

    // Ensure slug uniqueness
    if (updateData.slug) {
      const existingProduct = await Product.findOne({ slug: updateData.slug, _id: { $ne: req.params.id } });
      if (existingProduct) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }
    
    // Process Images
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = JSON.parse(req.body.existingImages);
      } catch (e) {
        existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];
      }
    }
    const shouldReplaceImages = req.body.replaceImages === 'true';
    if (shouldReplaceImages) {
      existingImages = [];
    }
    
    // Find old product to detect deleted images
    const oldProduct = await Product.findById(req.params.id);
    if (!oldProduct) return res.status(404).json({ success: false, message: 'Product not found' });
    
    // Calculate images to delete
    // `existingImages` might be array of strings, or objects. Standardize it to URLs to compare:
    const retainedUrls = existingImages.map(img => typeof img === 'string' ? img : img.url);
    oldProduct.images.forEach(oldImg => {
      if (!retainedUrls.includes(oldImg.url)) {
        const publicId = extractPublicId(oldImg.url);
        if (publicId) {
          safeDestroy(`melora/products/${publicId}`);
        }
      }
    });

    if (req.files && req.files.length > 0) {
      const normalizedExistingImages = existingImages.map((image, index) => ({
        ...(typeof image === 'string' ? { url: image } : image),
        isMain: false,
        sortOrder: req.files.length + index,
      }));

      const addedImages = await Promise.all(req.files.map(async (file, index) => ({
        url: await resolveUploadedFileUrl(file, req, { folder: 'melora/products', resourceType: 'image' }),
        altText: updateData.name?.en || 'Product Image',
        isMain: index === 0,
        sortOrder: index
      })));

      updateData.images = [...addedImages, ...normalizedExistingImages];
    } else if (req.body.existingImages !== undefined) {
      updateData.images = existingImages;
    } else if (req.body.clearImages === 'true') {
      updateData.images = [];
    } else {
      delete updateData.images;
    }

    updateData = normalizeStockData(updateData);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    // Delete images from Cloudinary
    product.images.forEach(img => {
       const publicId = extractPublicId(img.url);
       if (publicId) {
         safeDestroy(`melora/products/${publicId}`);
       }
    });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate product
// @route   POST /api/products/:id/duplicate
// @access  Private/Admin
exports.duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ success: false, message: 'Product not found' });

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;
    delete original.__v;

    // Mutate to ensure uniqueness
    const copySuffix = Date.now().toString().slice(-4);
    original.sku = `${original.sku}-COPY-${copySuffix}`;
    original.slug = `${original.slug}-copy-${copySuffix}`;
    
    if (original.variants && original.variants.length > 0) {
      original.variants.forEach(v => {
        v.sku = `${v.sku}-COPY-${copySuffix}`;
      });
    }
    
    // Create new copy
    const copy = await Product.create(original);
    res.status(201).json({ success: true, data: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Action
// @route   POST /api/products/bulk
// @access  Private/Admin
exports.bulkAction = async (req, res) => {
  try {
    const { action, productIds, data } = req.body;
    
    if (!productIds || !productIds.length) {
      return res.status(400).json({ success: false, message: 'No products selected' });
    }

    let result;
    switch(action) {
      case 'DELETE':
        result = await Product.deleteMany({ _id: { $in: productIds } });
        break;
      case 'UPDATE_CATEGORY':
        result = await Product.updateMany({ _id: { $in: productIds } }, { category: data.categoryId });
        break;
      case 'MARK_FEATURED':
        result = await Product.updateMany({ _id: { $in: productIds } }, { isFeatured: data.isFeatured });
        break;
      case 'ENABLE_DISABLE':
        result = await Product.updateMany({ _id: { $in: productIds } }, { isActive: data.isActive });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid bulk action' });
    }
    
    res.status(200).json({ success: true, message: `Successfully executed ${action}`, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
