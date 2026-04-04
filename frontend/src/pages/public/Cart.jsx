import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';
import useCurrencyStore from '../../store/useCurrencyStore';
import { resolveProductImage } from '../../utils/assets';
import toast from 'react-hot-toast';
import { settingsService } from '../../services/settingsService';
import { getAvailableStock } from '../../utils/stock';

const Cart = () => {
  const { items: cartItems, updateQuantity, removeItem, getTotal } = useCartStore();
  const { language } = useLangStore();
  const formatPrice = useCurrencyStore(state => state.formatPrice);
  const t = translations[language].cart;
  const copy = {
    en: {
      removed: 'Removed from cart',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      itemTotal: 'Total',
      color: 'Color',
      totalLabel: 'Total:',
      stockLimit: 'You reached the available stock for this item.',
      stockAvailable: (count) => `${count} pieces available in stock.`,
      summary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      unknownItem: 'Unknown Item',
      removeItem: 'Remove item',
    },
    ar: {
      removed: 'تمت الإزالة من السلة',
      product: 'المنتج',
      price: 'السعر',
      quantity: 'الكمية',
      itemTotal: 'الإجمالي',
      color: 'اللون',
      totalLabel: 'الإجمالي:',
      stockLimit: 'وصلت إلى الكمية المتاحة لهذا المنتج.',
      stockAvailable: (count) => `المتوفر ${count} قطعة`,
      summary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      free: 'مجاني',
      unknownItem: 'منتج غير معروف',
      removeItem: 'إزالة المنتج',
    },
    tr: {
      removed: 'Sepetten kaldirildi',
      product: 'Urun',
      price: 'Fiyat',
      quantity: 'Adet',
      itemTotal: 'Toplam',
      color: 'Renk',
      totalLabel: 'Toplam:',
      stockLimit: 'Bu urun icin mevcut stok sinirina ulastiniz.',
      stockAvailable: (count) => `Stokta ${count} adet var`,
      summary: 'Siparis Ozeti',
      subtotal: 'Ara Toplam',
      shipping: 'Kargo',
      free: 'Ucretsiz',
      unknownItem: 'Bilinmeyen Urun',
      removeItem: 'Urunu kaldir',
    },
  }[language] || {
    removed: 'Removed from cart',
    product: 'Product',
    price: 'Price',
    quantity: 'Quantity',
    itemTotal: 'Total',
    color: 'Color',
    totalLabel: 'Total:',
    stockLimit: 'You reached the available stock for this item.',
    stockAvailable: (count) => `${count} pieces available in stock.`,
    summary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    unknownItem: 'Unknown Item',
    removeItem: 'Remove item',
  };

  const subtotal = getTotal();
  const [adminSettings, setAdminSettings] = React.useState(null);

  React.useEffect(() => {
    settingsService.getSettings().then(res => {
      if(res.data) setAdminSettings(res.data);
    }).catch(console.error);
  }, []);

  const threshold = adminSettings?.freeShippingThreshold ?? 500;
  const baseShipping = adminSettings?.shippingCost ?? 25;
  const shipping = subtotal > threshold || subtotal === 0 ? 0 : baseShipping;
  const total = subtotal + shipping;

  const handleRemoveItem = (id, color) => {
    removeItem(id, color);
    toast.success(copy.removed);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[var(--bg-secondary)] text-[var(--text-primary)] min-h-screen transition-colors">
      <h1 className="text-4xl font-serif mb-12 text-center text-[var(--text-primary)]">{t.title}</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-8 text-lg">{t.empty}</p>
          <Link to="/shop" className="bg-black text-white px-8 py-4 font-medium tracking-widest hover:bg-gold transition-colors duration-300">
            {t.continueShopping}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3">
            <div className="hidden md:grid grid-cols-6 gap-4 border-b border-gray-200 pb-4 mb-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">{copy.product}</div>
              <div className="col-span-1 text-center">{copy.price}</div>
              <div className="col-span-1 text-center">{copy.quantity}</div>
              <div className="col-span-1 text-right">{copy.itemTotal}</div>
            </div>

            <div className="space-y-8">
              {cartItems.map(item => {
                const id = item._id || item.id;
                const name = item.name?.[language] || item.name?.en || item.name || copy.unknownItem;
                const image = resolveProductImage(item, 'https://via.placeholder.com/200');
                const availableStock = getAvailableStock(item, item.selectedVariant || null);
                const atLimit = item.quantity >= availableStock && availableStock > 0;
                
                return (
                <div key={`${id}-${item.selectedColor}`} className="flex flex-col md:grid md:grid-cols-6 gap-4 items-center border-b border-gray-100 pb-8">
                  {/* Product Details */}
                  <div className="col-span-3 w-full flex items-center gap-6 relative">
                    {/* Floating Removal Cross */}
                    <button 
                      onClick={() => handleRemoveItem(id, item.selectedColor)}
                      className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-500 transition-colors md:hidden"
                      aria-label={copy.removeItem}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
                    <img src={image} alt={name} loading="lazy" className="w-24 h-32 object-cover bg-white" />
                    <div>
                      <h3 className="font-medium text-black text-lg mb-1 pr-8">
                        <Link to={`/product/${id}`} className="hover:text-gold transition-colors">{name}</Link>
                      </h3>
                      {item.selectedColor && <p className="text-sm text-gray-500 mb-2">{copy.color}: {item.selectedColor}</p>}
                    </div>
                  </div>

                  {/* Price (Desktop) */}
                  <div className="col-span-1 hidden md:block text-center text-black">
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity & Price (Mobile/Desktop mixed) */}
                  <div className="col-span-1 flex md:justify-center w-full md:w-auto justify-between items-center mt-4 md:mt-0">
                    <span className="md:hidden text-gray-500 font-medium">{formatPrice(item.price)}</span>
                    <div className="flex items-center border border-gray-300">
                      <button onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1), item.selectedColor)} className="px-3 py-1 hover:bg-gray-100">-</button>
                      <span className="px-3 py-1 min-w-10 text-center">{item.quantity}</span>
                      <button disabled={atLimit || availableStock === 0} onClick={() => updateQuantity(id, item.quantity + 1, item.selectedColor)} className="px-3 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="col-span-1 w-full md:w-auto text-right font-medium text-black mt-2 md:mt-0 flex justify-between md:justify-end md:items-center md:gap-4 lg:gap-8">
                    <div className="flex justify-between md:block w-full md:w-auto">
                      <span className="md:hidden text-gray-500">{copy.totalLabel}</span>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    {/* Desktop Removal Cross */}
                    <button 
                      onClick={() => handleRemoveItem(id, item.selectedColor)}
                      className="hidden md:flex text-gray-400 hover:text-red-500 transition-colors"
                      title={copy.removeItem}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  {availableStock > 0 && (
                    <div className="col-span-6 -mt-2 text-xs text-gray-500">
                      {item.quantity >= availableStock ? copy.stockLimit : copy.stockAvailable(availableStock)}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">{copy.summary}</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{copy.subtotal}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{copy.shipping}</span>
                  <span>{shipping === 0 ? copy.free : formatPrice(shipping)}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-medium text-black border-t border-gray-200 pt-6 mb-8">
                <span>{t.total}</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Link 
                to="/checkout" 
                className="w-full block text-center bg-black text-white py-4 font-medium tracking-widest hover:bg-gold transition-colors duration-300 uppercase"
              >
                {t.checkout}
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;
