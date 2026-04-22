const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.avif']);

const isAllowedImageFile = (file = {}) => {
  const mime = String(file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (mime.startsWith('image/')) {
    return true;
  }

  return allowedImageExtensions.has(ext);
};

const localDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeBase = path
      .basename(file.originalname || 'product-image', ext)
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'product-image';

    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const resolveCloudinaryFolder = (req = {}) => {
  const routeHint = String(req.baseUrl || req.originalUrl || '').toLowerCase();

  if (routeHint.includes('/categories')) {
    return 'melora/categories';
  }

  if (routeHint.includes('/content')) {
    return 'melora/content';
  }

  return 'melora/products';
};

const cloudinaryStorage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '') || 'jpg';
        const safeBase = path
          .basename(file.originalname || 'upload', path.extname(file.originalname || ''))
          .replace(/[^a-zA-Z0-9_-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .toLowerCase() || 'upload';

        return {
          folder: resolveCloudinaryFolder(req),
          resource_type: 'image',
          public_id: `${Date.now()}-${safeBase}`,
          format: ext,
        };
      },
    })
  : null;

const storage = cloudinaryStorage || localDiskStorage;

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (isAllowedImageFile(file)) {
      return cb(null, true);
    }

    cb(new Error('Only image files are allowed for product uploads'));
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});

module.exports = upload;
