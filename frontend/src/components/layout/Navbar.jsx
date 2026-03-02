import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useTranslation from '../../hooks/useTranslation';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation('navbar');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link to="/" className="text-3xl font-serif text-black uppercase tracking-widest">
              Melora
            </Link>
          </div>
          
          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-black hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.home}
            </Link>
            <Link to="/shop" className="text-black hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.shop}
            </Link>
            <Link to="/categories" className="text-black hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.categories || 'Categories'}
            </Link>
          </div>

          {/* Icons Grid */}
          <div className="flex items-center gap-6">
            <button className="text-black hover:text-gold transition-colors" aria-label="Search">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={user?.role === 'admin' ? "/admin" : "/user/dashboard"} className="text-sm font-medium hover:text-gold transition-colors">
                  {user?.role === 'admin' ? t.admin : t.dashboard}
                </Link>
                <button onClick={handleLogout} className="text-black hover:text-gold transition-colors text-sm font-medium">
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-black hover:text-gold transition-colors" aria-label="Account">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            )}
            <Link to="/cart" className="text-black hover:text-gold transition-colors relative" aria-label="Cart">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 border-l border-gray-200 rtl:border-r rtl:border-l-0 pl-4 rtl:pr-4 rtl:pl-0 ml-2 rtl:mr-2 rtl:ml-0">
              <button onClick={() => setLanguage('en')} className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-black' : 'text-gray-400 hover:text-gold'}`}>EN</button>
              <button onClick={() => setLanguage('ar')} className={`text-sm font-medium transition-colors ${language === 'ar' ? 'text-black' : 'text-gray-400 hover:text-gold'}`}>AR</button>
              <button onClick={() => setLanguage('tr')} className={`text-sm font-medium transition-colors ${language === 'tr' ? 'text-black' : 'text-gray-400 hover:text-gold'}`}>TR</button>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
