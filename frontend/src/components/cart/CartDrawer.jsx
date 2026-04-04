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
  const formatPrice = useCurrencyStore((state) => state.formatPrice);
  const navigate = useNavigate();

  const copy = {
    en: {
      title: 'Your Cart',
      empty: 'Your cart is empty.',
      continueShopping: 'Continue Shopping',
      color: 'Color',
      maximumReached: 'Maximum stock reached',
      available: (count) => `${count} available`,
      subtotal: 'Subtotal',
      shippingNote: 'Shipping and taxes calculated at checkout.',
      checkout: 'Proceed to Checkout',
      viewCart: 'View Full Cart',
      unknownItem: 'Unknown Item',
    },
    ar: {
      title: 'السلة',
      empty: 'السلة فارغة.',
      continueShopping: 'متابعة التسوق',
      color: 'اللون',
      maximumReached: 'تم الوصول إلى الحد الأقصى للمخزون',
      available: (count) => `المتوفر ${count}`,
      subtotal: 'المجموع الفرعي',
      shippingNote: 'سيتم احتساب الشحن والضرائب عند إتمام الطلب.',
      checkout: 'إتمام الشراء',
      viewCart: 'عرض السلة كاملة',
      unknownItem: 'منتج غير معروف',
    },
    tr: {
      title: 'Sepetiniz',
      empty: 'Sepetiniz bos.',
      continueShopping: 'Alisverise Devam Et',
      color: 'Renk',
      maximumReached: 'Maksimum stok seviyesine ulasildi',
      available: (count) => `${count} adet mevcut`,
      subtotal: 'Ara Toplam',
      shippingNote: 'Kargo ve vergiler odeme adiminda hesaplanir.',
      checkout: 'Odeme Adimina Gec',
      viewCart: 'Sepetin Tamamini Gor',
      unknownItem: 'Bilinmeyen Urun',
    },
  }[language] || {
    title: 'Your Cart',
    empty: 'Your cart is empty.',
    continueShopping: 'Continue Shopping',
    color: 'Color',
    maximumReached: 'Maximum stock reached',
    available: (count) => `${count} available`,
    subtotal: 'Subtotal',
    shippingNote: 'Shipping and taxes calculated at checkout.',
    checkout: 'Proceed to Checkout',
    viewCart: 'View Full Cart',
    unknownItem: 'Unknown Item',
  };

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeDrawer}></div>

      <div className="relative flex h-full w-full flex-col bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl animate-slide-in-right md:w-[420px]">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] p-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{copy.title} ({items.length})</h2>
          <button type="button" onClick={closeDrawer} className="p-2 text-gray-500 transition-colors hover:text-black dark:hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[var(--text-secondary)]">
              <svg className="mx-auto mb-4 h-16 w-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <p>{copy.empty}</p>
              <button type="button" onClick={closeDrawer} className="mt-6 border-b border-brand pb-1 text-sm font-bold uppercase tracking-widest text-brand transition-colors hover:text-gold">
                {copy.continueShopping}
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const id = item._id || item.id || idx;
              const name = item.name?.[language] || item.name?.en || item.name || copy.unknownItem;
              const availableStock = getAvailableStock(item, item.selectedVariant || null);
              const atLimit = item.quantity >= availableStock && availableStock > 0;

              return (
                <div key={`${id}-${item.selectedColor}`} className="flex gap-4 border-b border-[var(--border-color)] pb-4">
                  <img loading="lazy" src={resolveProductImage(item, 'https://via.placeholder.com/100')} alt={name} className="h-24 w-20 rounded-sm bg-[var(--bg-secondary)] object-cover" />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="line-clamp-2 pr-4 text-sm font-bold text-[var(--text-primary)]">{name}</h3>
                        <button type="button" onClick={() => removeItem(id, item.selectedColor)} className="text-gray-400 transition-colors hover:text-red-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                      {item.selectedColor && <p className="mt-1 text-xs text-[var(--text-secondary)]">{copy.color}: {item.selectedColor}</p>}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1), item.selectedColor)} className="flex h-6 w-6 items-center justify-center rounded bg-[#4A2C17] text-white transition-colors hover:bg-[#8B6914]">-</button>
                        <span className="min-w-[2rem] px-2 text-center font-bold text-[var(--text-primary)]">{item.quantity}</span>
                        <button type="button" disabled={atLimit || availableStock === 0} onClick={() => updateQuantity(id, item.quantity + 1, item.selectedColor)} className="flex h-6 w-6 items-center justify-center rounded bg-[#4A2C17] text-white transition-colors hover:bg-[#8B6914] disabled:cursor-not-allowed disabled:opacity-40">+</button>
                      </div>
                      <span className="font-bold text-[#8B6914]">{formatPrice(item.price * item.quantity)}</span>
                    </div>

                    {availableStock > 0 && (
                      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                        {item.quantity >= availableStock ? copy.maximumReached : copy.available(availableStock)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-[var(--text-primary)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-bold">{copy.subtotal}</span>
              <span className="text-xl font-bold text-[#8B6914]">{formatPrice(getTotal())}</span>
            </div>
            <p className="mb-6 text-center text-xs text-[var(--text-secondary)]">{copy.shippingNote}</p>
            <button type="button" onClick={handleCheckout} className="w-full bg-[#4A2C17] py-4 text-xs font-bold uppercase tracking-widest text-white shadow-md transition-colors duration-300 hover:bg-[#8B6914]">
              {copy.checkout}
            </button>
            <Link to="/cart" onClick={closeDrawer} className="mt-4 block w-full border border-[#4A2C17] py-3 text-center text-xs font-bold uppercase tracking-widest text-[#4A2C17] transition-colors duration-300 hover:bg-[#4A2C17] hover:text-white dark:border-[#8b6914] dark:text-[#8b6914] dark:hover:bg-[#8b6914] dark:hover:text-black">
              {copy.viewCart}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
