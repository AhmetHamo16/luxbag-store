import React from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useTranslation from '../../hooks/useTranslation';
import useCurrencyStore from '../../store/useCurrencyStore';
import useWishlistStore from '../../store/useWishlistStore';
import { getAvailableStock, getStockLevel } from '../../utils/stock';
import { resolveProductImage } from '../../utils/assets';

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
      singlePiece: 'Single piece',
      pieceSet: (count) => `${count}-piece set`,
    },
    ar: {
      wishlistAdded: 'تمت الإضافة إلى المفضلة',
      addToWishlist: 'إضافة إلى المفضلة',
      critical: (count) => `متبقي ${count} فقط`,
      out: 'سيتوفر قريبًا من جديد',
      singlePiece: 'قطعة واحدة',
      pieceSet: (count) => `طقم ${count} قطع`,
    },
    tr: {
      wishlistAdded: 'Favorilere eklendi',
      addToWishlist: 'Favorilere ekle',
      critical: (count) => `Yalnizca ${count} adet kaldi`,
      out: 'Cok yakinda yeniden stokta olacak',
      singlePiece: 'Tek parca',
      pieceSet: (count) => `${count} parcali set`,
    },
  };

  const copy = labels[language] || labels.en;
  if (language === 'ar') {
    Object.assign(copy, {
      wishlistAdded: 'تمت الإضافة إلى المفضلة',
      addToWishlist: 'إضافة إلى المفضلة',
      critical: (count) => `متبقي ${count} فقط`,
      out: 'سيتوفر قريبًا من جديد',
      singlePiece: 'قطعة واحدة',
      pieceSet: (count) => `طقم ${count} قطع`,
    });
  }

  const toggleWishlist = (item) => {
    toggleWishlistStoreItem(item);
    const currentlySaved = isInWishlist(item._id || item.id);
    if (!currentlySaved) {
      toast.success(copy.wishlistAdded, { duration: 2000 });
    }
  };

  const langName = language === 'ar' ? product.name?.ar : language === 'tr' ? product.name?.tr : product.name?.en;
  const safeName = langName || product.name?.en || (typeof product.name === 'string' ? product.name : 'Unknown');
  const image = resolveProductImage(product, 'https://via.placeholder.com/300x400');
  const isSaved = isInWishlist(product._id || product.id);
  const availableStock = getAvailableStock(product);
  const stockLevel = getStockLevel(availableStock);
  const piecesIncluded = Number(product.specs?.piecesIncluded || 1);
  const piecesLabel = piecesIncluded > 1 ? copy.pieceSet(piecesIncluded) : copy.singlePiece;
  const hasNewBadge = product.badges?.includes('New');
  const hasFeaturedBadge = product.badges?.includes('Featured') || product.isFeatured;
  const badgeLabel = hasNewBadge ? 'New' : hasFeaturedBadge ? 'Featured' : null;

  return (
    <div className="group relative flex min-h-[330px] w-full flex-col overflow-hidden rounded-[24px] border border-[#e7dccd] bg-[linear-gradient(180deg,#fffefb_0%,#fbf6ef_55%,#f4ebdf_100%)] shadow-[0_14px_38px_rgba(73,43,16,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_56px_rgba(73,43,16,0.16)] dark:border-[var(--border-color)] dark:from-[var(--bg-card)] dark:via-[var(--bg-card)] dark:to-[var(--bg-secondary)] sm:h-[470px] sm:rounded-[28px] lg:h-[530px]">
      <div className="relative h-[205px] w-full overflow-hidden rounded-b-[26px] sm:h-[74%] sm:rounded-b-[30px]">
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/92 shadow-sm backdrop-blur transition-all duration-300 hover:bg-[#f7efe4] dark:bg-[var(--bg-card)] sm:right-4 sm:top-4"
          aria-label={copy.addToWishlist}
        >
          <svg
            className={`h-5 w-5 transition-colors ${isSaved ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <Link to={`/product/${product.slug || product._id || product.id}`} className="block h-full w-full">
          <img
            src={image}
            alt={safeName}
            loading="lazy"
            className="h-full w-full object-contain object-center bg-[radial-gradient(circle_at_top,#fffefb_0%,#f7f0e6_58%,#ecdfcf_100%)] p-2.5 transition-transform duration-1000 ease-out group-hover:scale-105 sm:p-5"
            onError={(event) => {
              event.target.src = 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600';
            }}
          />
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/18 to-transparent"></div>
        <div className="absolute left-3 top-3 z-20 rounded-full border border-[#ead7c1] bg-white/92 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7a5630] shadow-sm dark:border-[var(--border-color)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)] sm:left-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
          {piecesLabel}
        </div>

        {badgeLabel && (
          <div className="absolute left-3 top-12 z-20 rounded-full bg-[#2f2117] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f8efe2] shadow-[0_10px_18px_rgba(47,33,23,0.16)] sm:left-4 sm:top-14 sm:px-3 sm:text-[10px] sm:tracking-[0.22em]">
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
        <div className="mx-auto mb-2 h-px w-10 bg-[#c7aa82] sm:mb-3 sm:w-12"></div>
        <Link to={`/product/${product.slug || product._id || product.id}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.7rem] font-serif text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#2f2117] dark:text-[var(--text-primary)] sm:min-h-0 sm:text-[15px] sm:tracking-[0.2em]" title={safeName}>
            {safeName}
          </h3>
        </Link>

        <div className="mt-2 flex min-h-[42px] items-center justify-center gap-1.5 sm:mt-3 sm:min-h-0 sm:gap-2">
          {product.isSale ? (
            <>
              <span className="text-[10px] font-light text-gray-400 line-through sm:text-xs">{formatPrice(product.oldPrice)}</span>
              <span className="text-[13px] font-semibold tracking-[0.08em] text-[#2f2117] dark:text-[var(--text-primary)] sm:text-base sm:tracking-[0.14em]">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="rounded-full border border-[#ead9c5] bg-white/88 px-3 py-2 text-[13px] font-semibold tracking-[0.08em] text-[#2f2117] shadow-sm dark:text-[var(--text-primary)] sm:px-4 sm:text-base sm:tracking-[0.14em]">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
