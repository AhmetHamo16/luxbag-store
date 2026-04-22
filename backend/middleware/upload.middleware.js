const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

// Always accept uploads to local disk first. Product/category/content controllers
// can then promote files to Cloudinary when credentials are valid, while still
// allowing saves to succeed if Cloudinary is temporarily misconfigured.
const storage = localDiskStorage;

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
