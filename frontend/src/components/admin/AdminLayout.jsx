import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Coupons', href: '/admin/coupons' },
    { name: 'Settings', href: '/admin/settings' },
    { name: 'Return to Store', href: '/' }
  ];

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row font-sans">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center">
        <Link to="/admin" className="text-xl font-serif text-gold tracking-widest uppercase">Melora Admin</Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
        </button>
      </div>

      {/* Sidebar - Make layout absolute on mobile to work with relative wrapper */}
      <div className={`${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 pt-16' : 'hidden'} md:relative md:block md:w-64 bg-black text-white shrink-0 transition-all z-20`}>
        <div className="p-6 hidden md:block">
          <Link to="/admin" className="text-2xl font-serif text-gold tracking-widest uppercase block text-center mb-2">Melora</Link>
          <span className="block text-center text-xs text-gray-400 tracking-widest uppercase mb-10">Admin Portal</span>
        </div>
        <nav className="px-4 pb-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-4 py-3 rounded text-sm font-medium transition-colors ${
                location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin' && item.href !== '/')
                  ? 'bg-gold text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Logout Button */}
        <div className="absolute bottom-6 w-full md:w-64 px-4">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded text-sm font-medium text-red-400 hover:bg-black hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto flex flex-col relative w-full md:w-auto">
        {/* Topbar (Desktop) */}
        <header className="hidden md:flex bg-white shadow-sm border-b border-gray-200 h-16 items-center px-8 justify-between">
          <h2 className="text-lg font-medium text-black capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">{user?.name || 'Admin User'}</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
