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

export const getProductFallbackImage = (item) => {
  const categorySlug = String(item?.category?.slug || item?.categorySlug || '').toLowerCase();
  const name = String(item?.name?.en || item?.name?.tr || item?.name?.ar || '').toLowerCase();

  if (['glasses', 'sunglasses', 'eyewear'].includes(categorySlug)) {
    return 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=900';
  }

  if (categorySlug === 'watches' || name.includes('watch') || name.includes('saat')) {
    return 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=900';
  }

  if (['perfume', 'perfumes', 'parfum', 'parfumler'].includes(categorySlug)) {
    return 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=900';
  }

  if (
    categorySlug === 'wallet' ||
    name.includes('wallet') ||
    name.includes('cuzdan') ||
    name.includes('cüzdan')
  ) {
    return 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=900';
  }

  if (name.includes('accessory') || name.includes('aksesuar')) {
    return 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=900';
  }

  return 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=900';
};
