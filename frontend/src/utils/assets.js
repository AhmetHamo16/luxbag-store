import { backendOrigin } from '../services/api';

const isLocalHost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const uploadsOrigin =
  typeof window === 'undefined'
    ? 'https://luxbag-store-production.up.railway.app'
    : isLocalHost
      ? backendOrigin
      : 'https://luxbag-store-production.up.railway.app';

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
    return `${uploadsOrigin}${normalized.slice(uploadsIndex)}`;
  }

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('//')) return `https:${normalized}`;

  if (normalized.startsWith('/uploads/')) {
    return `${uploadsOrigin}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${uploadsOrigin}/${normalized}`;
  }

  return normalized;
};

export const isBrokenCatalogImageUrl = (value) => {
  const raw =
    typeof value === 'object'
      ? value?.url || value?.secure_url || value?.image || value?.src || value?.path || value?.publicUrl
      : value;

  return /railway\.app\/uploads/i.test(String(raw || ''));
};

export const resolveProductImage = (item, fallback = 'https://via.placeholder.com/300') => {
  if (!item) return fallback;

  const pickValidImage = (images = []) => {
    if (!Array.isArray(images) || images.length === 0) return '';

    const candidates = [
      images.find((entry) => entry?.isMain && (entry?.url || entry)),
      ...images,
    ].filter(Boolean);

    let firstDetectedImage = '';

    for (const entry of candidates) {
      const value = typeof entry === 'object'
        ? (entry.url || entry.secure_url || entry.image || entry.src || entry.path || entry.publicUrl)
        : entry;

      if (typeof value === 'string' && value.trim()) {
        if (!firstDetectedImage) {
          firstDetectedImage = value;
        }

        if (isBrokenCatalogImageUrl(value)) {
          continue;
        }

        return value;
      }
    }

    return firstDetectedImage;
  };

  const resolved = resolveAssetUrl(
    pickValidImage(item.images) ||
    item.image?.url ||
    item.image ||
    pickValidImage(item.product?.images) ||
    item.product?.image?.url ||
    item.product?.image,
    fallback
  );

  if (isBrokenCatalogImageUrl(resolved)) {
    return fallback;
  }

  return resolved;
};

export const getProductFallbackImage = (item) => {
  const categorySlug = String(item?.category?.slug || item?.categorySlug || '').toLowerCase();
  const name = String(item?.name?.en || item?.name?.tr || item?.name?.ar || '').toLowerCase();
  const brandedFallback = '/logo.png';

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
    return brandedFallback;
  }

  if (name.includes('accessory') || name.includes('aksesuar')) {
    return brandedFallback;
  }

  return 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=900';
};
