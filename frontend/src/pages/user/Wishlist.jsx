import React from 'react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../../store/useWishlistStore';
import useCartStore from '../../store/cartStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import toast from 'react-hot-toast';
import useLangStore from '../../store/useLangStore';

const Wishlist = () => {
  const language = useLangStore(state => state.language);
  const t = {
    en: { title: "My Wishlist", empty: "Your wishlist is empty.", discover: "Discover Products", add: "Add to Cart" },
    ar: { title: "قائمة أمنياتي", empty: "قائمة الأمنيات فارغة.", discover: "اكتشفي المنتجات", add: "إضافة للسلة" },
    tr: { title: "Favorilerim", empty: "Favori listeniz boş.", discover: "Ürünleri Keşfet", add: "Sepete Ekle" }
  }[language] || { title: "My Wishlist", empty: "Your wishlist is empty.", discover: "Discover Products", add: "Add to Cart" };
  const { items, toggleItem } = useWishlistStore();
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const addItem = useCartStore(state => state.addItem);

  const handleRemove = (product) => {
    toggleItem(product);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success('Added to cart ✓', { duration: 2000 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh]">
      <h1 className="text-4xl font-serif text-center mb-12 text-black">{t.title}</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-8 text-lg">{t.empty}</p>
          <Link to="/shop" className="bg-black text-white px-8 py-4 uppercase font-medium tracking-widest hover:bg-gold transition-colors duration-300">
            {t.discover}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(product => {
            const langName = product.name?.en || product.name;
            const safeName = typeof langName === 'string' ? langName : 'Unknown';
            const firstImage = product.images?.[0];
            const image = firstImage?.url || (typeof firstImage === 'string' ? firstImage : null) || product.image || 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809';

            return (
              <div key={product._id || product.id} className="bg-white border border-gray-200 shadow-sm flex flex-col hover:shadow-lg transition-shadow duration-300 relative group pb-4">
                
                <button 
                  onClick={() => handleRemove(product)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="Remove from wishlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden mb-4">
                  <Link to={`/product/${product.slug || product._id || product.id}`}>
                    <img loading="lazy" src={image} alt={safeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </Link>
                </div>

                <div className="px-4 text-center mt-auto">
                  <Link to={`/product/${product.slug || product._id || product.id}`}>
                    <h3 className="text-sm font-medium text-brand hover:text-gold transition-colors duration-300 truncate mb-2">
                       {safeName}
                    </h3>
                  </Link>
                  <p className="font-medium text-brand mb-4">{formatPrice(product.salePrice || product.price)}</p>
                  
                  <button 
                     onClick={() => handleAddToCart(product)}
                     className="w-full bg-brand text-beige border border-brand py-2 text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-colors duration-300"
                  >
                     {t.add}
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
