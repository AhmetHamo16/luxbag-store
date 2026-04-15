const Category = require('../models/Category');

const getRequestBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || 'https')
    .toString()
    .split(',')[0]
    .trim();
  return `${protocol}://${req.get('host')}`;
};

const getUploadedFileUrl = (file, req) => {
  if (!file) return '';
  if (file.path && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  const baseUrl = req ? getRequestBaseUrl(req) : '';

  if (file.filename) {
    return baseUrl ? `${baseUrl}/uploads/products/${file.filename}` : `/uploads/products/${file.filename}`;
  }

  if (file.path) {
    const normalized = file.path.replace(/\\/g, '/');
    const marker = '/uploads/';
    const markerIndex = normalized.lastIndexOf(marker);
    if (markerIndex >= 0) {
      const relativePath = normalized.slice(markerIndex);
      return baseUrl ? `${baseUrl}${relativePath}` : relativePath;
    }
  }

  return '';
};

const parseCategoryPayload = (body = {}) => {
  const parsed = { ...body };

  Object.keys(parsed).forEach((key) => {
    const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
    if (!match) return;

    const [, parent, child] = match;
    if (!parsed[parent] || typeof parsed[parent] !== 'object') {
      parsed[parent] = {};
    }

    parsed[parent][child] = parsed[key];
    delete parsed[key];
  });

  return parsed;
};

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (or Private/Admin if query provides ?all=true)
exports.getCategories = async (req, res) => {
  try {
    const filter = {};
    // Let admin see inactive ones if specifically requested
    if (req.query.all !== 'true') {
      filter.isActive = true;
    }
    const categories = await Category.find(filter).sort('orderIndex');
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    let categoryData = parseCategoryPayload(req.body);
    if (req.file) {
      categoryData.image = getUploadedFileUrl(req.file, req);
    }

    categoryData.slug = categoryData.slug || slugify(categoryData?.name?.en);

    if (!categoryData?.name?.en || !categoryData?.name?.ar || !categoryData?.name?.tr) {
      return res.status(400).json({ success: false, message: 'Category names are required in EN, AR, and TR.' });
    }

    if (!categoryData.slug) {
      return res.status(400).json({ success: false, message: 'A valid slug could not be generated for this category.' });
    }

    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    let updateData = parseCategoryPayload(req.body);
    if (req.file) {
      updateData.image = getUploadedFileUrl(req.file, req);
    }

    if (!updateData.slug && updateData?.name?.en) {
      updateData.slug = slugify(updateData.name.en);
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reorder categories
// @route   PUT /api/categories/reorder
// @access  Private/Admin
exports.reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required' });
    }

    const operations = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { orderIndex: index }
      }
    }));

    await Category.bulkWrite(operations);
    res.status(200).json({ success: true, message: 'Categories reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle category visibility
// @route   PUT /api/categories/:id/toggle
// @access  Private/Admin
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
