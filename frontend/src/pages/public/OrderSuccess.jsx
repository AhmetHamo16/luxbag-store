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
      continueShopping: 'متابعة التسوق',
    },
    tr: {
      title: 'Siparisiniz Icin Tesekkurler!',
      description: 'Siparisiniz basariyla alindi. Siparis detaylarinizi yakinda sizinle paylasacagiz.',
      paymentReference: 'Odeme Referansi',
      viewOrders: 'Siparislerimi Gor',
      continueShopping: 'Alisverise Devam Et',
    },
    en: {
      title: 'Thank You For Your Order!',
      description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
      paymentReference: 'Payment Reference',
      viewOrders: 'View My Orders',
      continueShopping: 'Continue Shopping',
    },
  }[language] || {
    title: 'Thank You For Your Order!',
    description: "Your order has been successfully placed. We'll review it and send you updates shortly.",
    paymentReference: 'Payment Reference',
    viewOrders: 'View My Orders',
    continueShopping: 'Continue Shopping',
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center text-[var(--text-primary)]">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 className="mb-4 text-4xl font-serif text-[var(--text-primary)]">{content.title}</h1>
      <p className="mb-8 max-w-md text-[var(--text-secondary)]">{content.description}</p>

      {paymentIntent && (
        <div className="mb-8 w-full max-w-sm rounded border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left">
          <p className="mb-1 text-sm text-[var(--text-secondary)]">{content.paymentReference}</p>
          <p className="truncate font-medium text-[var(--text-primary)]">{paymentIntent.id}</p>
        </div>
      )}

      <div className="space-x-4">
        <Link to="/user/dashboard" className="inline-block bg-[#2f1f15] px-8 py-3 font-medium uppercase tracking-widest text-white transition-colors hover:bg-gold">
          {content.viewOrders}
        </Link>
        <Link to="/shop" className="inline-block border border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-3 font-medium uppercase tracking-widest transition-colors hover:opacity-90">
          {content.continueShopping}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
