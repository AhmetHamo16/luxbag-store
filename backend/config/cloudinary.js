const cloudinary = require('cloudinary').v2;

const cloudinaryUrl = String(
  process.env.CLOUDINARY_URL ||
  process.env.cloudinary_url ||
  ''
).trim();

const cloudinaryCloudName = String(
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.cloudinary_cloud_name ||
  process.env.CLOUD_NAME ||
  ''
).trim();

const cloudinaryApiKey = String(
  process.env.CLOUDINARY_API_KEY ||
  process.env.cloudinary_api_key ||
  process.env.API_KEY ||
  ''
).trim();

const cloudinaryApiSecret = String(
  process.env.CLOUDINARY_API_SECRET ||
  process.env.cloudinary_api_secret ||
  process.env.API_SECRET ||
  ''
).trim();

const hasCloudinaryConfig = Boolean(
  cloudinaryUrl || (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret)
);

if (hasCloudinaryConfig) {
  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
    });
  } else {
    cloudinary.config({
      cloud_name: cloudinaryCloudName,
      api_key: cloudinaryApiKey,
      api_secret: cloudinaryApiSecret
    });
  }
}

const safeDestroy = async (publicId) => {
  if (!hasCloudinaryConfig || !publicId) {
    return null;
  }

  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  hasCloudinaryConfig,
  safeDestroy
};
