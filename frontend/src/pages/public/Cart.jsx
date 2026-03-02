import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';

const Cart = () => {
  const { items: cartItems, updateQuantity, removeItem, getTotal } = useCartStore();
  const { language } = useLangStore();
  const t = translations[language].cart;

  const subtotal = getTotal();
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25; // Free shipping over $500
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-serif mb-12 text-center text-black">{t.title}</h1>

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
              <div className="col-span-3">Product</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Quantity</div>
              <div className="col-span-1 text-right">Total</div>
            </div>

            <div className="space-y-8">
              {cartItems.map(item => {
                const id = item._id || item.id;
                const name = item.name?.[language] || item.name?.en || item.name || 'Unknown Item';
                const image = item.images?.[0] || item.image || 'https://via.placeholder.com/200';
                
                return (
                <div key={`${id}-${item.selectedColor}`} className="flex flex-col md:grid md:grid-cols-6 gap-4 items-center border-b border-gray-100 pb-8">
                  {/* Product Details */}
                  <div className="col-span-3 w-full flex items-center gap-6">
                    <img src={image} alt={name} className="w-24 h-32 object-cover bg-white" />
                    <div>
                      <h3 className="font-medium text-black text-lg mb-1">
                        <Link to={`/product/${id}`} className="hover:text-gold transition-colors">{name}</Link>
                      </h3>
                      {item.selectedColor && <p className="text-sm text-gray-500 mb-2">Color: {item.selectedColor}</p>}
                      <button 
                        onClick={() => removeItem(id, item.selectedColor)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price (Desktop) */}
                  <div className="col-span-1 hidden md:block text-center text-black">
                    ${item.price}
                  </div>

                  {/* Quantity & Price (Mobile/Desktop mixed) */}
                  <div className="col-span-1 flex md:justify-center w-full md:w-auto justify-between items-center mt-4 md:mt-0">
                    <span className="md:hidden text-gray-500 font-medium">${item.price}</span>
                    <div className="flex items-center border border-gray-300">
                      <button onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1), item.selectedColor)} className="px-3 py-1 hover:bg-gray-100">-</button>
                      <span className="px-3 py-1 min-w-10 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(id, item.quantity + 1, item.selectedColor)} className="px-3 py-1 hover:bg-gray-100">+</button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="col-span-1 w-full md:w-auto text-right font-medium text-black mt-2 md:mt-0 flex justify-between md:block">
                    <span className="md:hidden text-gray-500">Total:</span>
                    ${item.price * item.quantity}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-medium text-black border-t border-gray-200 pt-6 mb-8">
                <span>{t.total}</span>
                <span>${total}</span>
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
