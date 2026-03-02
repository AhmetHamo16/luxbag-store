import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../../services/orderService';
import Loader from '../../../components/shared/Loader';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAllOrders();
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    let trackingNumber = null;
    if (newStatus === 'shipped') {
      trackingNumber = window.prompt("Enter tracking number for this shipment (optional):");
    }

    if (window.confirm(`Change order status to ${newStatus}?`)) {
      try {
        await orderService.updateOrderStatus(id, newStatus, trackingNumber);
        fetchOrders();
      } catch (err) {
        console.error(err);
        alert('Failed to update status');
      }
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-indigo-100 text-indigo-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <h1 className="text-2xl font-serif text-black mb-8">Order Management</h1>

      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        
        {/* Toolbar / Search Header */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            className="w-full sm:w-96 border border-gray-300 p-2 text-sm focus:outline-none focus:border-black transition-colors"
          />
          <div className="flex gap-4 w-full sm:w-auto">
             <select className="border border-gray-300 p-2 text-sm focus:outline-none focus:border-black bg-white w-full sm:w-auto">
               <option>All Statuses</option>
               <option>New</option>
               <option>Processing</option>
               <option>Shipped</option>
               <option>Completed</option>
             </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <Loader />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Order Details</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Items / Total</th>
                  <th className="px-6 py-4 font-medium">Current Status</th>
                  <th className="px-6 py-4 font-medium text-right">Update Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length > 0 ? orders.map((order) => (
                  <tr key={order._id} className="hover:bg-white transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-black truncate max-w-[150px]">{order._id}</div>
                      <div className="text-sm text-gray-600 mt-1">{order.shippingAddress?.city}, {order.shippingAddress?.country || 'TR'}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{order.items?.length || 0} Items</div>
                      <div className="text-sm font-medium text-black mt-1">${order.total?.toFixed(2)}</div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded inline-block text-xs font-medium tracking-wide ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                      {order.trackingNumber && (
                        <div className="text-xs text-gray-500 mt-2 font-mono">
                          Tracking: {order.trackingNumber}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex flex-col items-end gap-2">
                         {/* Status Dropdown */}
                         <select 
                           value={order.status}
                           onChange={(e) => handleStatusChange(order._id, e.target.value)}
                           className="border border-gray-300 p-1 text-xs focus:outline-none focus:border-black bg-white w-32 cursor-pointer"
                         >
                           <option value="pending">Pending</option>
                           <option value="processing">Processing</option>
                           <option value="shipped">Shipped</option>
                           <option value="delivered">Delivered</option>
                           <option value="cancelled">Cancelled</option>
                         </select>
                         
                         <div className="space-x-3 mt-1">
                            {/* Not implemented details yet */}
                            <span className="text-black font-medium text-xs">
                               Updated
                            </span>
                         </div>
                      </div>
                    </td>
                    
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
           <span>Showing 1 to 5 of 142 entries</span>
           <div className="flex space-x-1">
             <button className="px-3 py-1 border border-gray-200 disabled:opacity-50">Prev</button>
             <button className="px-3 py-1 border border-gray-200 bg-black text-white">1</button>
             <button className="px-3 py-1 border border-gray-200 hover:bg-white text-black">2</button>
             <button className="px-3 py-1 border border-gray-200 hover:bg-white text-black">3</button>
             <span className="px-2 py-1">...</span>
             <button className="px-3 py-1 border border-gray-200 disabled:opacity-50">Next</button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default OrderList;
