import React from 'react';
import { Link } from 'react-router-dom';
import useTranslation from '../../hooks/useTranslation';
import useCurrencyStore from '../../store/useCurrencyStore';
import useWishlistStore from '../../store/useWishlistStore';
import toast from 'react-hot-toast';
import { getAvailableStock, getStockLevel } from '../../utils/stock';

const ProductCard = ({ product }) => {
  const toggleWishlistStoreItem = useWishlistStore(state => state.toggleItem);
  const isInWishlist = useWishlistStore(state => state.isInWishlist);
  const { language } = useTranslation('product');
  const formatPrice = useCurrencyStore(state => state.formatPrice);

  const toggleWishlist = (product) => {
    toggleWishlistStoreItem(product);
    const currentlySaved = isInWishlist(product._id || product.id);
    if (!currentlySaved) {
       toast.success('Added to wishlist ♥', { duration: 2000 });
    }
  };

  const langName = language === 'ar' ? product.name?.ar : language === 'tr' ? product.name?.tr : product.name?.en;
  const safeName = langName || product.name?.en || (typeof product.name === 'string' ? product.name : 'Unknown');
  
  const getOptimizedUrl = (url) => {
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}`.replace(/\/api$/, '') + url;
    }
    if (typeof url === 'string' && url.includes('cloudinary.com') && !url.includes('quality=80')) {
      return url + '?quality=80&format=webp';
    }
    return url;
  };

  const image = getOptimizedUrl(product.images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/300x400');
  const isSaved = isInWishlist(product._id || product.id);
  const availableStock = getAvailableStock(product);
  const stockLevel = getStockLevel(availableStock);
  const stockText = {
    en: {
      critical: `Only ${availableStock} left`,
      out: 'Will be back very soon',
    },
    ar: {
      critical: `متبقي ${availableStock} فقط`,
      out: 'سيتوفر في أقرب وقت بكل أناقة',
    },
    tr: {
      critical: `Yalnizca ${availableStock} adet kaldi`,
      out: 'Cok yakinda yeniden stokta olacak',
    }
  }[language] || {
    critical: `Only ${availableStock} left`,
    out: 'Will be back very soon',
  };
  const piecesIncluded = Number(product.specs?.piecesIncluded || 1);
  const piecesLabel = {
    en: piecesIncluded > 1 ? `${piecesIncluded}-piece set` : 'Single piece',
    ar: piecesIncluded > 1 ? `طقم ${piecesIncluded} قطع` : 'قطعة واحدة',
    tr: piecesIncluded > 1 ? `${piecesIncluded} parcali set` : 'Tek parca',
  }[language] || (piecesIncluded > 1 ? `${piecesIncluded}-piece set` : 'Single piece');

  return (
    <div className="group flex flex-col relative w-full h-[310px] sm:h-[460px] lg:h-[520px] overflow-hidden rounded-[24px] border border-[#e7dccd] bg-gradient-to-b from-white via-[#fffdf8] to-[#f6efe6] shadow-[0_12px_40px_rgba(73,43,16,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(73,43,16,0.16)]">
      
      {/* 75% Image Container */}
      <div className="relative w-full h-[72%] overflow-hidden rounded-b-[28px]">
        
        {/* Minimal Wishlist Icon */}
        <button 
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all duration-300 hover:bg-[#f7efe4]"
          aria-label="Add to wishlist"
        >
          <svg className={`w-5 h-5 transition-colors ${isSaved ? 'text-black fill-black dark:text-white dark:fill-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`} fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>

        <Link to={`/product/${product.slug || product._id || product.id}`} className="w-full h-full block">
          <img 
            src={image} 
            alt={safeName} 
            loading="lazy"
            className="w-full h-full object-contain object-center bg-[radial-gradient(circle_at_top,#fffefb_0%,#f7f0e6_58%,#ecdfcf_100%)] p-4 transition-transform duration-1000 ease-out group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=600'; }}
          />
        </Link>
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/18 to-transparent"></div>
        <div className="absolute left-4 top-4 z-20 rounded-full border border-[#ead7c1] bg-white/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7a5630] shadow-sm">
          {piecesLabel}
        </div>
        {stockLevel === 'critical' && (
          <div className="absolute left-4 bottom-4 z-20 rounded-full bg-[#a06a2c] px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
            {stockText.critical}
          </div>
        )}
        {stockLevel === 'out' && (
          <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-[#e5d3bf] bg-white/95 px-3 py-2 text-center text-[11px] font-medium text-[#7a5630] shadow-sm backdrop-blur">
            {stockText.out}
          </div>
        )}
      </div>

      {/* 25% Product Info Container */}
      <div className="flex h-[28%] flex-col justify-between px-4 pb-4 pt-3 text-center sm:px-5">
        <div className="mx-auto mb-2 h-px w-10 bg-[#c7aa82]"></div>
        <Link to={`/product/${product.slug || product._id || product.id}`} className="block">
          <h3 className="font-serif text-[11px] font-medium uppercase tracking-[0.24em] text-[#2f2117] line-clamp-2 sm:text-[13px]" title={safeName}>
            {safeName}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-center space-x-2">
          {product.isSale ? (
            <>
              <span className="text-[11px] font-light text-gray-400 line-through sm:text-xs">{formatPrice(product.oldPrice)}</span>
              <span className="text-[11px] font-semibold text-[#2f2117] sm:text-xs">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="text-[11px] font-semibold tracking-[0.18em] text-[#2f2117] sm:text-xs">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
