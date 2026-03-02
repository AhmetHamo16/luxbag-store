import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StripePayment from '../../components/checkout/StripePayment';
import { useForm } from 'react-hook-form';
import { orderService } from '../../services/orderService';
import useCartStore from '../../store/cartStore';
import useLangStore from '../../store/useLangStore';
import { translations } from '../../i18n/translations';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Load real cart data from Zustand store
  const { items: cartItems, getTotal, clearCart } = useCartStore();
  const { language } = useLangStore();
  const t = translations[language].checkout;

  const subtotal = getTotal();
  const shippingCost = subtotal > 0 ? 25 : 0; // Flat rate mock, free if empty (though shouldn't be here if empty)
  const total = subtotal + shippingCost - discountAmount;

  const onShippingSubmit = (data) => {
    setShippingData(data);
    setStep(2); // Proceed to Payment Step
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Assuming we'll call couponService in a real scenario
    if (couponCode === 'MELORA10') {
      setDiscountAmount(subtotal * 0.1); // 10% off
      alert('Coupon applied successfully!');
    } else {
      alert('Invalid coupon code.');
    }
  };

  const handleOrderSuccess = async (paymentIntent) => {
    try {
      // Construct backend order payload
      const orderData = {
        items: cartItems.map(item => ({
          product: item._id || item.id,
          name: item.name,
          image: item.images ? item.images[0] : item.image,
          price: item.price,
          quantity: item.quantity,
          color: item.selectedColor
        })),
        shippingAddress: {
          street: shippingData.address,
          city: shippingData.city,
          zipCode: shippingData.zipCode,
          country: shippingData.country || 'TR',
        },
        payment: {
          method: 'stripe',
          stripePaymentId: paymentIntent.id,
          status: 'paid'
        },
        coupon: {
          code: couponCode || null,
          discount: discountAmount
        },
        subtotal,
        shippingCost,
        discountAmount,
        total,
      };

      await orderService.createOrder(orderData);
      
      // Clear cart on successful order
      clearCart();

    } catch (error) {
      console.error("Failed to save order to backend", error);
    }
  };

  if (cartItems.length === 0 && step === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3 hover:bg-gold transition-colors">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans text-black">
      
      {/* Checkout Progress */}
      <div className="flex justify-center items-center mb-12">
        <div className={`flex items-center ${step >= 1 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
          {t.shippingInfo}
        </div>
        <div className={`w-12 h-px mx-4 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 2 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
          {t.paymentInfo}
        </div>
        <div className={`w-12 h-px mx-4 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center ${step >= 3 ? 'text-black font-medium' : 'text-gray-400'}`}>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>3</span>
          Confirmation
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Main Form Area */}
        <div className="w-full lg:w-2/3">
          
          {step === 1 && (
            <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
              <h2 className="text-2xl font-serif mb-6">Shipping Address</h2>
              <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input {...register("firstName", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                    {errors.firstName && <span className="text-red-500 text-xs mt-1">First name is required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input {...register("lastName", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                    {errors.lastName && <span className="text-red-500 text-xs mt-1">Last name is required</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input type="email" {...register("email", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input {...register("address", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input {...register("city", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input {...register("zipCode", { required: true })} className="w-full border p-3 focus:outline-none focus:border-black" />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-black text-white px-8 py-4 uppercase tracking-widest text-sm font-medium hover:bg-gold transition-colors duration-300">
                    Continue to Payment
                  </button>
                </div>

              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-8 rounded shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">Payment Method</h2>
                <button onClick={() => setStep(1)} className="text-sm underline hover:text-gold transition-colors">Edit Shipping</button>
              </div>
              
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded">
                <p className="font-medium text-sm mb-1">{shippingData?.firstName} {shippingData?.lastName}</p>
                <p className="text-sm text-gray-600">{shippingData?.email}</p>
                <p className="text-sm text-gray-600">{shippingData?.address}, {shippingData?.city} {shippingData?.zipCode}</p>
              </div>

              <StripePayment 
                items={cartItems}
                shippingCost={shippingCost}
                discountAmount={discountAmount}
                shippingAddress={shippingData}
                couponCode={couponCode}
                onSuccess={handleOrderSuccess}
              />
            </div>
          )}

        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 md:p-8 rounded shadow-sm sticky top-28 border border-gray-100">
            <h3 className="text-xl font-serif mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id || item._id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-gray-200 overflow-hidden relative">
                      <img src={item.images ? item.images[0] : item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                    </div>
                    <span className="text-sm font-medium truncate max-w-[120px]">{item.name?.[language] || item.name?.en || item.name}</span>
                  </div>
                  <span className="text-sm font-medium">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-3 mb-6 relative">
              
              {/* Promo Code area */}
              {step === 1 && (
                <div className="mb-6">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      value={couponCode} 
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                    />
                    <button type="submit" className="bg-black text-white px-4 py-2 text-sm hover:bg-gold transition-colors">Apply</button>
                  </form>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                <span className="text-lg font-serif">Total</span>
                <span className="text-xl font-medium">${total.toFixed(2)}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
