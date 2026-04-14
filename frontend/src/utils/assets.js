import { backendOrigin } from '../services/api';

export const resolveAssetUrl = (value, fallback = 'https://via.placeholder.com/300') => {
  if (!value) return fallback;

  if (typeof value === 'object') {
    return resolveAssetUrl(
      value.url ||
      value.secure_url ||
      value.image ||
      value.src ||
      value.path ||
      value.publicUrl,
      fallback
    );
  }

  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().replace(/\\/g, '/');

  if (!normalized) return fallback;

  const uploadsIndex = normalized.lastIndexOf('/uploads/');
  if (uploadsIndex >= 0) {
    return `${backendOrigin}${normalized.slice(uploadsIndex)}`;
  }

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('//')) return `https:${normalized}`;

  if (normalized.startsWith('/uploads/')) {
    return `${backendOrigin}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${backendOrigin}/${normalized}`;
  }

  return normalized;
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
