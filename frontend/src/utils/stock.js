export const getAvailableStock = (product, selectedVariant = null) => {
  if (!product) return 0;

  if (selectedVariant) {
    return Math.max(0, Number(selectedVariant.stock || 0));
  }

  if (product.variants?.length > 0) {
    return Math.max(0, Number(product.stockControl?.totalStock || 0));
  }

  return Math.max(0, Number(product.stock || 0));
};

export const getStockLevel = (quantity) => {
  const stock = Math.max(0, Number(quantity || 0));

  if (stock === 0) return 'out';
  if (stock <= 2) return 'critical';
  if (stock <= 5) return 'low';
  return 'normal';
};

export const isAvailableForPurchase = (product, selectedVariant = null) => {
  return getAvailableStock(product, selectedVariant) > 0;
};
