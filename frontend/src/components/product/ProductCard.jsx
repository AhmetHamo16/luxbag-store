import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import useCurrencyStore from '../../store/useCurrencyStore';
import useWishlistStore from '../../store/useWishlistStore';
import { getAvailableStock, getStockLevel } from '../../utils/stock';
import { getProductFallbackImage, resolveProductImage } from '../../utils/assets';

const ProductCard = ({ product }) => {
  const toggleWishlistStoreItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const { language } = useTranslation('product');
  const formatPrice = useCurrencyStore((state) => state.formatPrice);

  const labels = {
    en: {
      wishlistAdded: 'Added to wishlist',
      addToWishlist: 'Add to wishlist',
      critical: (count) => `Only ${count} left`,
      out: 'Will be back very soon',
    },
    ar: {
      wishlistAdded: 'تمت الإضافة إلى المفضلة',
      addToWishlist: 'إضافة إلى المفضلة',
      critical: (count) => `متبقي ${count} فقط`,
      out: 'سيتوفر قريبًا من جديد',
    },
    tr: {
      wishlistAdded: 'Favorilere eklendi',
      addToWishlist: 'Favorilere ekle',
      critical: (count) => `Yalnizca ${count} adet kaldi`,
      out: 'Cok yakinda yeniden stokta olacak',
    },
  };

  const copy = labels[language] || labels.en;
  const badgeCopy = {
    en: { new: 'New', featured: 'Best Seller' },
    ar: { new: 'جديد', featured: 'الأكثر طلباً' },
    tr: { new: 'Yeni', featured: 'Cok Satan' },
  }[language] || { new: 'New', featured: 'Best Seller' };

  const toggleWishlist = (item) => {
    toggleWishlistStoreItem(item);
    const currentlySaved = isInWishlist(item._id || item.id);
    if (!currentlySaved) {
      toast.success(copy.wishlistAdded, { duration: 2000 });
    }
  };

  const langName =
    language === 'ar' ? product.name?.ar : language === 'tr' ? product.name?.tr : product.name?.en;
  const safeName = langName || product.name?.en || (typeof product.name === 'string' ? product.name : 'Unknown');
  const categoryFallbackImage = getProductFallbackImage(product);
  const image = resolveProductImage(product, categoryFallbackImage);
  const isSaved = isInWishlist(product._id || product.id);
  const availableStock = getAvailableStock(product);
  const stockLevel = getStockLevel(availableStock);
  const hasNewBadge = product.badges?.includes('New');
  const hasFeaturedBadge = product.badges?.includes('Featured') || product.isFeatured || Number(product.reviewCount || 0) >= 3;
  const badgeLabel = hasNewBadge ? badgeCopy.new : hasFeaturedBadge ? badgeCopy.featured : null;

  return (
    <div className="group relative flex min-h-[330px] w-full flex-col overflow-hidden rounded-[24px] border border-[#e7dccd] bg-[linear-gradient(180deg,#fffefb_0%,#fbf6ef_55%,#f4ebdf_100%)] shadow-[0_14px_38px_rgba(73,43,16,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(73,43,16,0.16)] dark:border-[#9b7448] dark:bg-[linear-gradient(180deg,#21140e_0%,#1a100b_100%)] dark:shadow-[0_18px_48px_rgba(0,0,0,0.5)] sm:h-[470px] sm:rounded-[28px] lg:h-[530px]">
      <div className="relative h-[205px] w-full overflow-hidden rounded-b-[26px] bg-transparent dark:bg-[linear-gradient(180deg,#e6dac7_0%,#c4a77f_58%,#987653_100%)] dark:p-5 sm:h-[74%] sm:rounded-b-[30px] sm:dark:p-6">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/92 shadow-sm backdrop-blur transition-all duration-300 hover:bg-[#f7efe4] dark:bg-[#2a1d17] dark:text-[#f7efe2] dark:shadow-[0_8px_18px_rgba(0,0,0,0.32)] dark:hover:bg-[#3a281f] sm:right-4 sm:top-4"
          aria-label={copy.addToWishlist}
        >
          <svg
            className={`h-5 w-5 transition-colors ${isSaved ? 'fill-black text-black dark:fill-[#f7efe2] dark:text-[#f7efe2]' : 'text-gray-400 hover:text-black dark:text-[#f7efe2]/75 dark:hover:text-[#f7efe2]'}`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <Link to={`/product/${product.slug || product._id || product.id}`} className="block h-full w-full">
          <img
            src={image}
            alt={safeName}
            loading="lazy"
            className="h-full w-full object-contain object-center bg-[radial-gradient(circle_at_top,#fffefb_0%,#f7f0e6_58%,#ecdfcf_100%)] p-2.5 transition-transform duration-1000 ease-out group-hover:scale-105 dark:bg-transparent dark:p-0 sm:p-5"
            onError={(event) => {
              event.currentTarget.src = categoryFallbackImage;
            }}
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/18 to-transparent"></div>

        {badgeLabel && (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-[#2f2117] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f8efe2] shadow-[0_10px_18px_rgba(47,33,23,0.16)] sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.22em]">
            {badgeLabel}
          </div>
        )}

        {stockLevel === 'critical' && (
          <div className="absolute bottom-4 left-4 z-20 rounded-full bg-[#a06a2c] px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
            {copy.critical(availableStock)}
          </div>
        )}

        {stockLevel === 'out' && (
          <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-[#e5d3bf] bg-white/95 px-3 py-2 text-center text-[11px] font-medium text-[#7a5630] shadow-sm backdrop-blur dark:border-[var(--border-color)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)]">
            {copy.out}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between px-3 pb-4 pt-3 text-center sm:h-[26%] sm:px-5 sm:pb-5 sm:pt-4">
        <div className="mx-auto mb-2 h-px w-10 bg-[#c7aa82] dark:bg-[#d9ad6a] sm:mb-3 sm:w-12"></div>
        <Link to={`/product/${product.slug || product._id || product.id}`} className="block">
          <h3
            className="line-clamp-2 min-h-[2.7rem] font-serif text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#2f2117] dark:text-[#fff5e8] sm:min-h-0 sm:text-[15px] sm:tracking-[0.2em]"
            title={safeName}
          >
            {safeName}
          </h3>
        </Link>

        <div className="mt-2 flex min-h-[42px] items-center justify-center gap-1.5 sm:mt-3 sm:min-h-0 sm:gap-2">
          {product.isSale ? (
            <>
              <span className="text-[10px] font-light text-gray-400 line-through sm:text-xs">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="rounded-full border border-[#ead9c5] bg-white/88 px-3 py-2 text-[13px] font-bold tracking-[0.08em] text-[#2f2117] shadow-sm dark:border-[#d9ad6a] dark:bg-[#fff2dd] dark:text-[#3a210f] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:px-4 sm:text-base sm:tracking-[0.14em]">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="rounded-full border border-[#ead9c5] bg-white/88 px-3 py-2 text-[13px] font-bold tracking-[0.08em] text-[#2f2117] shadow-sm dark:border-[#d9ad6a] dark:bg-[#fff2dd] dark:text-[#3a210f] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:px-4 sm:text-base sm:tracking-[0.14em]">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
