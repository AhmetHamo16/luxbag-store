import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import { resolveProductImage } from '../../utils/assets';
import { getAvailableStock } from '../../utils/stock';

const CartDrawer = () => {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, getTotal } = useCartStore();
  const { language } = useLangStore();
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={closeDrawer}
      ></div>
      
      {/* Drawer */}
      <div className="relative w-full md:w-[420px] h-full bg-[#FFFFFF] dark:bg-[#1a1a1a] shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8DDD4] dark:border-[#2a2a2a]">
          <h2 className="text-2xl font-bold text-[#4A2C17] dark:text-[#f0ece4]">Your Cart ({items.length})</h2>
          <button onClick={closeDrawer} className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
              <svg className="w-16 h-16 mb-4 opacity-50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              <p>Your cart is empty.</p>
              <button onClick={closeDrawer} className="mt-6 text-brand dark:text-gold uppercase tracking-widest text-sm font-bold border-b border-brand dark:border-gold pb-1 transition-colors hover:text-brand/70">Continue Shopping</button>
            </div>
          ) : (
            items.map((item, idx) => {
               const id = item._id || item.id || idx;
               const name = item.name?.[language] || item.name?.en || item.name || 'Unknown Item';
               const availableStock = getAvailableStock(item, item.selectedVariant || null);
               const atLimit = item.quantity >= availableStock && availableStock > 0;
               return (
                  <div key={`${id}-${item.selectedColor}`} className="flex gap-4 border-b border-[#E8DDD4] dark:border-[#2a2a2a] pb-4">
                     <img loading="lazy" src={resolveProductImage(item, 'https://via.placeholder.com/100')} alt={name} className="w-20 h-24 object-cover bg-white dark:bg-gray-800 rounded-sm" />
                     <div className="flex-1 flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start">
                              <h3 className="font-bold text-sm text-[#2C1810] dark:text-[#f0ece4] line-clamp-2 pr-4">{name}</h3>
                              <button onClick={() => removeItem(id, item.selectedColor)} className="text-gray-400 hover:text-red-500 transition-colors">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                           </div>
                           {item.selectedColor && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Color: {item.selectedColor}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center gap-1">
                              <button onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1), item.selectedColor)} className="w-6 h-6 flex items-center justify-center rounded bg-[#4A2C17] text-white hover:bg-[#8B6914] transition-colors">-</button>
                              <span className="px-2 font-bold text-[#2C1810] dark:text-[#f0ece4] min-w-[2rem] text-center">{item.quantity}</span>
                              <button disabled={atLimit || availableStock === 0} onClick={() => updateQuantity(id, item.quantity + 1, item.selectedColor)} className="w-6 h-6 flex items-center justify-center rounded bg-[#4A2C17] text-white hover:bg-[#8B6914] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                           </div>
                           <span className="font-bold text-[#8B6914]">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        {availableStock > 0 && (
                          <p className="mt-2 text-[11px] text-gray-500">{item.quantity >= availableStock ? 'Maximum stock reached' : `${availableStock} available`}</p>
                        )}
                     </div>
                  </div>
               );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E8DDD4] dark:border-[#2a2a2a] bg-[#F5EFE6] dark:bg-[#111111] text-[#2C1810] dark:text-[#f0ece4]">
             <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Subtotal</span>
                <span className="font-bold text-[#8B6914] text-xl">{formatPrice(getTotal())}</span>
             </div>
             <p className="text-xs text-[#2C1810]/70 dark:text-gray-400 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
             <button onClick={handleCheckout} className="w-full bg-[#4A2C17] text-white hover:bg-[#8B6914] dark:hover:bg-[#8B6914] transition-colors duration-300 py-4 uppercase tracking-widest text-xs font-bold shadow-md">
                Proceed to Checkout
             </button>
             <Link to="/cart" onClick={closeDrawer} className="block w-full text-center mt-4 border border-[#4A2C17] dark:border-[#8b6914] text-[#4A2C17] dark:text-[#8b6914] hover:bg-[#4A2C17] hover:text-white dark:hover:bg-[#8b6914] dark:hover:text-black transition-colors duration-300 py-3 uppercase tracking-widest text-xs font-bold">
                View Full Cart
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
