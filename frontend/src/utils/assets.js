const backendOrigin = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api').replace(/\/api$/, '');

export const resolveAssetUrl = (value, fallback = 'https://via.placeholder.com/300') => {
  if (!value) return fallback;

  if (typeof value === 'object') {
    return resolveAssetUrl(value.url || value.image || value.src, fallback);
  }

  if (typeof value === 'string' && value.includes('\\uploads\\')) {
    return `${backendOrigin}${value.slice(value.lastIndexOf('\\uploads\\')).replace(/\\/g, '/')}`;
  }

  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    return `${backendOrigin}${value}`;
  }

  return value;
};

export const resolveProductImage = (item, fallback = 'https://via.placeholder.com/300') => {
  if (!item) return fallback;

  return resolveAssetUrl(
    item.images?.[0]?.url ||
    item.images?.[0] ||
    item.image?.url ||
    item.image ||
    item.product?.images?.[0]?.url ||
    item.product?.images?.[0] ||
    item.product?.image?.url ||
    item.product?.image,
    fallback
  );
};
