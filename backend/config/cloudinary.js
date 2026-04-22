const cloudinary = require('cloudinary').v2;

const cloudinaryUrl = String(
  process.env.CLOUDINARY_URL ||
  process.env.cloudinary_url ||
  ''
).trim();

const hasCloudinaryConfig = Boolean(
  cloudinaryUrl || (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
);

if (hasCloudinaryConfig) {
  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
    });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
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
