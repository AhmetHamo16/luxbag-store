const fs = require('fs/promises');
const path = require('path');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const getRequestBaseUrl = (req) => {
  const forwardedProto = req?.headers?.['x-forwarded-proto'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req?.protocol || 'https')
    .toString()
    .split(',')[0]
    .trim();

  return req?.get ? `${protocol}://${req.get('host')}` : '';
};

const getUploadedFileUrl = (file, req) => {
  if (!file) return '';

  if (file.path && /^https?:\/\//i.test(file.path)) {
    return file.path;
  }

  const baseUrl = getRequestBaseUrl(req);

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

const resolveUploadedFileUrl = async (file, req, options = {}) => {
  if (!file) return '';

  const { folder = 'melora/products', resourceType = 'image' } = options;
  const localUrl = getUploadedFileUrl(file, req);

  if (!hasCloudinaryConfig || !file.path || /^https?:\/\//i.test(file.path)) {
    return localUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: resourceType,
    });

    await fs.unlink(file.path).catch(() => {});
    return result.secure_url || localUrl;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${file.originalname || file.filename || 'file'}:`, error.message || error);
    return localUrl;
  }
};

module.exports = {
  getRequestBaseUrl,
  getUploadedFileUrl,
  resolveUploadedFileUrl,
};
