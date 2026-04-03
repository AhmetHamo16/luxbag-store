import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import Loader from '../../components/shared/Loader';
import { resolveProductImage } from '../../utils/assets';
import { Link } from 'react-router-dom';

import useLangStore from '../../store/useLangStore';

const Orders = () => {
  const { language } = useLangStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch my orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="bg-white p-8 border border-gray-100 text-center">
        <p className="text-gray-500 text-sm mb-4">You haven't placed any orders yet.</p>
        <Link to="/shop" className="text-sm font-medium text-black underline hover:text-gold transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-serif mb-6 border-b border-gray-200 pb-4">Order History</h2>
      <div className="space-y-6">
        {orders.map(order => {
          const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
          const currentIndex = steps.indexOf(order.status.toLowerCase() !== -1 ? order.status.toLowerCase() : 'pending');
          const progressWidth = `${(currentIndex / (steps.length - 1)) * 100}%`;

          return (
          <div key={order._id} className="border border-gray-200 p-6 rounded bg-white shadow-sm relative">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <p className="font-medium text-brand">Order #{order._id}</p>
                <p className="text-xs text-gray-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                {order.status === 'shipped' && (
                  <div className="mt-4">
                    <div className="bg-green-50 text-green-700 p-3 rounded border border-green-200 text-sm font-bold flex items-center gap-2 w-fit mb-3">
                      <span>{language === 'ar' ? 'طلبك في الطريق إليك! 🚚' : language === 'tr' ? 'Siparişiniz yola çıktı! 🚚' : 'Your order is on its way! 🚚'}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 w-fit">
                      <p className="text-xs font-semibold text-brand">Tracking Number:</p>
                      <p className="text-sm font-mono tracking-wider text-black">{order.trackingNumber || 'TRK-' + order._id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-3">
                <p className="text-lg font-medium text-brand">${order.total?.toFixed(2)}</p>
                <button 
                  onClick={() => window.open(`https://wa.me/905000000000?text=I%20need%20help%20with%20my%20order%20%23${order._id}`, '_blank')}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#25D366] hover:text-[#128C7E] transition-colors border border-green-200 px-3 py-1.5 rounded-full hover:bg-green-50"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766 0 1.015.266 2.008.772 2.88l-1.01 3.692 3.774-.99a5.727 5.727 0 002.231.45h.001c3.18 0 5.767-2.586 5.767-5.766 0-3.181-2.588-5.766-5.767-5.766zm0 9.773c-.859 0-1.7-.231-2.435-.668l-.174-.103-1.808.474.484-1.763-.113-.18a4.8 4.8 0 01-.734-2.569c0-2.656 2.16-4.815 4.818-4.815 2.656 0 4.816 2.158 4.816 4.815-.001 2.657-2.16 4.815-4.816 4.815z"></path></svg>
                  Need help?
                </button>
              </div>
            </div>

            {order.status !== 'cancelled' ? (
            <div className="mb-10 mt-4 px-2 md:px-12">
              <div className="relative flex justify-between items-center text-xs sm:text-sm">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gold z-0 transition-all duration-700 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]" style={{ width: progressWidth }}></div>
                
                {steps.map((step, i) => {
                  const isActive = currentIndex >= i;
                  const isCurrent = currentIndex === i;
                  return (
                    <div key={step} className={`relative z-10 flex flex-col items-center gap-2 ${isActive ? 'text-black' : 'text-gray-400'}`}>
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-[3px] flex items-center justify-center transition-all bg-white ${isActive ? 'border-gold shadow-sm' : 'border-gray-200'}`}>
                         {isActive && <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${isCurrent ? 'bg-gold animate-pulse' : 'bg-black'}`}></div>}
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold px-1 ${isCurrent ? 'text-gold' : ''}`}>{step}</span>
                        {/* Show date if active, use createdAt for pending or updatedAt for current state */}
                        {isActive && (
                          <span className="text-[9px] text-gray-400 mt-1 text-center whitespace-nowrap hidden sm:block">
                            {i === 0 ? new Date(order.createdAt).toLocaleDateString() : (isCurrent ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : '')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            ) : (
              <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded text-center font-medium tracking-wide">
                This order has been cancelled.
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50 p-4 rounded-b">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white p-3 border border-gray-100 rounded shadow-sm hover:shadow-md transition-shadow">
                  <img loading="lazy" src={resolveProductImage(item, 'https://via.placeholder.com/100')} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-50" />
                  <div className="text-sm flex-1">
                    <p className="font-medium text-brand line-clamp-2">{item.name?.en || item.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-500 text-xs font-medium">Qty: {item.quantity}</p>
                      {item.price && <p className="text-gold font-bold">${item.price}</p>}
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
