import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard (Orders)', path: '/user/dashboard' },
    { name: 'Profile Details', path: '/user/dashboard/profile' },
    { name: 'My Wishlist', path: '/user/dashboard/wishlist' },
    { name: 'Addresses', path: '/user/dashboard/addresses' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-black mb-2">My Account</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-black border-b border-black pb-1 hover:text-gold hover:border-gold transition-colors duration-300"
        >
          Sign Out
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-1/4">
          <nav className="space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                  location.pathname === link.path 
                    ? 'border-gold text-black bg-white' 
                    : 'border-transparent text-gray-500 hover:text-black hover:bg-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="w-full md:w-3/4">
           <Outlet />
        </main>

      </div>
    </div>
  );
};

export default Dashboard;
