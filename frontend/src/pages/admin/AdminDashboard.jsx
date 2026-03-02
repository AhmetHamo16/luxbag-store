import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { userService } from '../../services/userService';
import Loader from '../../components/shared/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '$...', icon: '$' },
    { title: 'Total Orders', value: '...', icon: '📦' },
    { title: 'Total Products', value: '...', icon: '👜' },
    { title: 'Total Users', value: '...', icon: '👥' },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all orders and products to calculate stats
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          orderService.getAllOrders(),
          productService.getProducts({ limit: 0 }),
          userService.getAllUsers()
        ]);
        
        const allOrders = ordersRes.data || [];
        const totalRevenue = allOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);
        
        setStats([
          { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '$' },
          { title: 'Total Orders', value: allOrders.length, icon: '📦' },
          { title: 'Total Products', value: productsRes.data?.total || productsRes.data?.length || 0, icon: '👜' },
          { title: 'Total Users', value: usersRes.data?.length || 0, icon: '👥' },
        ]);

        setRecentOrders(allOrders.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-serif mb-8 text-black">Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded shadow-sm border border-gray-100 flex items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl mr-4 border border-gray-200 text-gold">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-medium text-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-medium text-black">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-gold hover:text-black transition-colors">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-white transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-black truncate max-w-[150px]">{order._id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-truncate max-w-[150px]">{order.shippingAddress?.street}, {order.shippingAddress?.city}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-black">${order.total?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded inline-block text-xs font-medium tracking-wide
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No recent orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
