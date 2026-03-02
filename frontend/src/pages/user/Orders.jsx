import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import Loader from '../../components/shared/Loader';
import { Link } from 'react-router-dom';

const Orders = () => {
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
        {orders.map(order => (
          <div key={order._id} className="border border-gray-200 p-6 rounded">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-black">${order.total?.toFixed(2)}</p>
                <span className={`px-3 py-1 mt-2 inline-block text-xs font-medium tracking-wide rounded
                  ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : 
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-16 h-16 object-cover bg-white" />
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[120px]">{item.name?.en || item.name}</p>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
