import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useWishlistStore from '../../store/useWishlistStore';
import useCartStore from '../../store/cartStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import useLangStore from '../../store/useLangStore';
import { resolveProductImage } from '../../utils/assets';

const Wishlist = () => {
  const language = useLangStore((state) => state.language);
  const copy = {
    en: {
      title: 'My Wishlist',
      empty: 'Your wishlist is empty.',
      discover: 'Discover Products',
      add: 'Add to Cart',
      removed: 'Removed from wishlist',
      addedToCart: 'Added to cart',
      removeLabel: 'Remove from wishlist',
    },
    ar: {
      title: 'مفضلتي',
      empty: 'قائمة المفضلة فارغة.',
      discover: 'اكتشفي المنتجات',
      add: 'إضافة إلى السلة',
      removed: 'تمت الإزالة من المفضلة',
      addedToCart: 'تمت الإضافة إلى السلة',
      removeLabel: 'إزالة من المفضلة',
    },
    tr: {
      title: 'Favorilerim',
      empty: 'Favori listeniz bos.',
      discover: 'Urunleri Kesfet',
      add: 'Sepete Ekle',
      removed: 'Favorilerden kaldirildi',
      addedToCart: 'Sepete eklendi',
      removeLabel: 'Favorilerden kaldir',
    },
  }[language] || {
    title: 'My Wishlist',
    empty: 'Your wishlist is empty.',
    discover: 'Discover Products',
    add: 'Add to Cart',
    removed: 'Removed from wishlist',
    addedToCart: 'Added to cart',
    removeLabel: 'Remove from wishlist',
  };

  const { items, toggleItem } = useWishlistStore();
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const addItem = useCartStore((state) => state.addItem);

  const handleRemove = (product) => {
    toggleItem(product);
    toast.success(copy.removed);
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(copy.addedToCart, { duration: 2000 });
  };

  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-16 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <h1 className="mb-12 text-center font-serif text-4xl text-[var(--text-primary)]">{copy.title}</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-8 text-lg text-[var(--text-secondary)]">{copy.empty}</p>
          <Link to="/shop" className="inline-block bg-[#2f1f15] px-8 py-4 font-medium uppercase tracking-widest text-white transition-colors duration-300 hover:bg-gold">
            {copy.discover}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => {
            const safeName =
              (language === 'ar' ? product.name?.ar : language === 'tr' ? product.name?.tr : product.name?.en) ||
              product.name?.en ||
              product.name ||
              'Unknown';

            return (
              <div key={product._id || product.id} className="group relative flex flex-col border border-[var(--border-color)] bg-[var(--bg-card)] pb-4 shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <button
                  type="button"
                  onClick={() => handleRemove(product)}
                  className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-gray-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500"
                  aria-label={copy.removeLabel}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden bg-[var(--bg-secondary)]">
                  <Link to={`/product/${product.slug || product._id || product.id}`}>
                    <img loading="lazy" src={resolveProductImage(product, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809')} alt={safeName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </Link>
                </div>

                <div className="mt-auto px-4 text-center">
                  <Link to={`/product/${product.slug || product._id || product.id}`}>
                    <h3 className="mb-2 truncate text-sm font-medium text-brand transition-colors duration-300 hover:text-gold">{safeName}</h3>
                  </Link>
                  <p className="mb-4 font-medium text-brand">{formatPrice(product.salePrice || product.price)}</p>

                  <button type="button" onClick={() => handleAddToCart(product)} className="w-full border border-brand bg-brand py-2 text-xs font-bold uppercase tracking-widest text-[var(--bg-card)] transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-white">
                    {copy.add}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
