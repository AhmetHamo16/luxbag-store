const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadsDir, { recursive: true });

const allowedImageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jfif', '.avif', '.heic', '.heif']);

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

const storage = hasCloudinaryConfig
  ? new (require('multer-storage-cloudinary').CloudinaryStorage)({
      cloudinary,
      params: async (_req, file) => {
        const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '');
        const format = ext || 'jpg';

        return {
          folder: 'melora/products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'jfif', 'avif', 'heic', 'heif'],
          format,
          public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
          resource_type: 'image',
        };
      },
    })
  : localDiskStorage;

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (process.env.NODE_ENV === 'production' && !hasCloudinaryConfig) {
      return cb(new Error('Product image uploads require Cloudinary configuration in production.'));
    }

    if (isAllowedImageFile(file)) {
      return cb(null, true);
    }

    cb(new Error('Only image files are allowed for product uploads'));
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});

module.exports = upload;
