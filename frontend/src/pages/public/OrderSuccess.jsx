import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useLangStore from '../../store/useLangStore';

const OrderSuccess = () => {
  const location = useLocation();
  const paymentIntent = location.state?.paymentIntent;
  const language = useLangStore((state) => state.language);

  const content = {
    ar: {
      title: 'شكراً لطلبك!',
      description: 'تم استلام طلبك بنجاح. سنراجع تفاصيل الطلب ونرسل لك التحديثات قريبًا.',
      paymentReference: 'مرجع الدفع',
      viewOrders: 'عرض طلباتي',
      continueShopping: 'متابعة التسوق'
    },
    tr: {
      title: 'Siparisiniz Icin Tesekkurler!',
      description: 'Siparisiniz basariyla alindi. Siparis detaylarinizi yakinda sizinle paylasacagiz.',
      paymentReference: 'Odeme Referansi',
      viewOrders: 'Siparislerimi Gor',
      continueShopping: 'Alisverise Devam Et'
    },
    en: {
      title: 'Thank You For Your Order!',
      description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
      paymentReference: 'Payment Reference',
      viewOrders: 'View My Orders',
      continueShopping: 'Continue Shopping'
    }
  }[language] || {
    title: 'Thank You For Your Order!',
    description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
    paymentReference: 'Payment Reference',
    viewOrders: 'View My Orders',
    continueShopping: 'Continue Shopping'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 className="text-4xl font-serif text-black mb-4">{content.title}</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {content.description}
      </p>

      {paymentIntent && (
        <div className="bg-white p-6 rounded border border-gray-200 mb-8 w-full max-w-sm text-left">
          <p className="text-sm text-gray-500 mb-1">{content.paymentReference}</p>
          <p className="font-medium text-black truncate">{paymentIntent.id}</p>
        </div>
      )}

      <div className="space-x-4">
        <Link 
          to="/user/dashboard" 
          className="inline-block bg-black text-white px-8 py-3 font-medium uppercase tracking-widest hover:bg-gold transition-colors"
        >
          {content.viewOrders}
        </Link>
        <Link 
          to="/shop" 
          className="inline-block border border-gray-300 px-8 py-3 font-medium uppercase tracking-widest hover:bg-white transition-colors"
        >
          {content.continueShopping}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
