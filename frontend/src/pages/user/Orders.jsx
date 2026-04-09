import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/shared/Loader';
import { orderService } from '../../services/orderService';
import useLangStore from '../../store/useLangStore';
import { resolveProductImage } from '../../utils/assets';

const copyMap = {
  en: {
    empty: "You haven't placed any orders yet.",
    shopNow: 'Start Shopping',
    title: 'Order History',
    order: 'Order',
    placedOn: 'Placed on',
    orderOnWay: 'Your order is on its way!',
    trackingNumber: 'Tracking Number',
    needHelp: 'Need help?',
    cancelled: 'This order has been cancelled.',
    qty: 'Qty',
    statuses: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
    },
  },
  ar: {
    empty: 'لم تقومي بإجراء أي طلبات بعد.',
    shopNow: 'ابدئي التسوق',
    title: 'سجل الطلبات',
    order: 'الطلب',
    placedOn: 'تم الطلب بتاريخ',
    orderOnWay: 'طلبك في الطريق إليك!',
    trackingNumber: 'رقم التتبع',
    needHelp: 'تحتاجين مساعدة؟',
    cancelled: 'تم إلغاء هذا الطلب.',
    qty: 'الكمية',
    statuses: {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
    },
  },
  tr: {
    empty: 'Henüz sipariş vermediniz.',
    shopNow: 'Alisverise Basla',
    title: 'Siparis Gecmisi',
    order: 'Siparis',
    placedOn: 'Olusturma tarihi',
    orderOnWay: 'Siparisiniz yolda!',
    trackingNumber: 'Takip Numarasi',
    needHelp: 'Yardim gerekiyor mu?',
    cancelled: 'Bu siparis iptal edildi.',
    qty: 'Adet',
    statuses: {
      pending: 'Beklemede',
      confirmed: 'Onaylandi',
      processing: 'Hazirlaniyor',
      shipped: 'Kargolandi',
      delivered: 'Teslim edildi',
    },
  },
};

const Orders = () => {
  const { language } = useLangStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const copy = copyMap[language] || copyMap.en;

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch my orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="border border-gray-100 bg-white p-8 text-center">
        <p className="mb-4 text-sm text-gray-500">{copy.empty}</p>
        <Link to="/shop" className="text-sm font-medium text-black underline transition-colors hover:text-gold">
          {copy.shopNow}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-serif">{copy.title}</h2>
      <div className="space-y-6">
        {orders.map((order) => {
          const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
          const normalizedStatus = steps.includes(order.status?.toLowerCase()) ? order.status.toLowerCase() : 'pending';
          const currentIndex = steps.indexOf(normalizedStatus);
          const progressWidth = `${(currentIndex / (steps.length - 1)) * 100}%`;

          return (
            <div key={order._id} className="relative rounded border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <p className="font-medium text-brand">{copy.order} #{order._id}</p>
                  <p className="mt-1 text-xs text-gray-500">{copy.placedOn} {new Date(order.createdAt).toLocaleString()}</p>
                  {order.status === 'shipped' && (
                    <div className="mt-4">
                      <div className="mb-3 flex w-fit items-center gap-2 rounded border border-green-200 bg-green-50 p-3 text-sm font-bold text-green-700">
                        <span>{copy.orderOnWay} 🚚</span>
                      </div>
                      <div className="w-fit rounded border border-gray-100 bg-gray-50 p-2">
                        <p className="text-xs font-semibold text-brand">{copy.trackingNumber}:</p>
                        <p className="text-sm font-mono tracking-wider text-black">{order.trackingNumber || `TRK-${order._id.slice(-8).toUpperCase()}`}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3 text-right">
                  <p className="text-lg font-medium text-brand">${order.total?.toFixed(2)}</p>
                  <button
                    onClick={() => window.open(`https://wa.me/905000000000?text=I%20need%20help%20with%20my%20order%20%23${order._id}`, '_blank')}
                    className="flex items-center gap-1.5 rounded-full border border-green-200 px-3 py-1.5 text-xs font-medium text-[#25D366] transition-colors hover:bg-green-50 hover:text-[#128C7E]"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815z" /></svg>
                    {copy.needHelp}
                  </button>
                </div>
              </div>

              {order.status !== 'cancelled' ? (
                <div className="mt-4 mb-10 px-2 md:px-12">
                  <div className="relative flex items-center justify-between text-xs sm:text-sm">
                    <div className="absolute left-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />
                    <div className="absolute left-0 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.4)] transition-all duration-700" style={{ width: progressWidth }} />

                    {steps.map((step, i) => {
                      const isActive = currentIndex >= i;
                      const isCurrent = currentIndex === i;
                      return (
                        <div key={step} className={`relative z-10 flex flex-col items-center gap-2 ${isActive ? 'text-black' : 'text-gray-400'}`}>
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full border-[3px] bg-white transition-all sm:h-8 sm:w-8 ${isActive ? 'border-gold shadow-sm' : 'border-gray-200'}`}>
                            {isActive && <div className={`h-2 w-2 rounded-full transition-colors sm:h-3 sm:w-3 ${isCurrent ? 'animate-pulse bg-gold' : 'bg-black'}`} />}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`px-1 text-[10px] font-bold uppercase tracking-wider sm:text-xs ${isCurrent ? 'text-gold' : ''}`}>
                              {copy.statuses[step] || step}
                            </span>
                            {isActive && (
                              <span className="mt-1 hidden whitespace-nowrap text-center text-[9px] text-gray-400 sm:block">
                                {i === 0 ? new Date(order.createdAt).toLocaleDateString() : (isCurrent ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : '')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mb-8 rounded border border-red-100 bg-red-50 p-4 text-center font-medium tracking-wide text-red-600">
                  {copy.cancelled}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 rounded-b bg-gray-50/50 p-4 sm:grid-cols-2 md:grid-cols-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 rounded border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                    <img loading="lazy" src={resolveProductImage(item, 'https://via.placeholder.com/100')} alt={item.name} className="h-16 w-16 rounded bg-gray-50 object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-2 font-medium text-brand">{item.name?.en || item.name}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500">{copy.qty}: {item.quantity}</p>
                        {item.price && <p className="font-bold text-gold">${item.price}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
