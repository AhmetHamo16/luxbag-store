import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/useWishlistStore';
import useTranslation from '../../hooks/useTranslation';
import { productService } from '../../services/productService';
import useCurrencyStore from '../../store/useCurrencyStore';
import useDarkMode from '../../hooks/useDarkMode';
import { resolveProductImage } from '../../utils/assets';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems, openDrawer } = useCartStore();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const { items: wishlistItems } = useWishlistStore();
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation('navbar');
  const [colorTheme, setTheme] = useDarkMode();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const formatPrice = useCurrencyStore(state => state.formatPrice);

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  React.useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await productService.getProducts({ search: searchQuery, limit: 5 });
          setSearchResults(res.data || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    };
    const timeout = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'backdrop-blur-md shadow-sm dark:border-b dark:border-gold' : 'bg-transparent dark:bg-transparent'} bg-[var(--navbar-bg)] text-[var(--text-primary)]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link to="/">
              <img loading="lazy" src="/logo.png" className={`w-auto object-contain opacity-0 animate-fade-in hover:scale-105 hover:drop-shadow-md dark:hover:drop-shadow-[0_0_8px_#8B6914] transition-all duration-500 ease-out ${isScrolled ? 'h-8' : 'h-12'}`} alt="Melora Logo" />
            </Link>
          </div>
          
          {/* Main Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.home || 'Home'}
            </Link>
            <Link to="/about" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              About Us
            </Link>
            <Link to="/shop" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.shop}
            </Link>
            <Link to="/categories" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.categories || 'Categories'}
            </Link>
          </div>

          {/* Icons Grid */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 md:gap-2 border-r border-gray-200 dark:border-gray-700 rtl:border-l rtl:border-r-0 pr-1 md:pr-4 rtl:pl-1 md:rtl:pl-4 rtl:pr-0 mr-1 md:mr-0 rtl:ml-1 md:rtl:ml-0 rtl:mr-0">
              <button onClick={() => setLanguage('en')} className={`text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors ${language === 'en' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>EN</button>
              <button onClick={() => setLanguage('ar')} className={`text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors ${language === 'ar' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>AR</button>
              <button onClick={() => setLanguage('tr')} className={`text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors ${language === 'tr' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>TR</button>
            </div>

            <button className="relative text-brand hover:text-gold transition-colors block" onClick={() => setIsSearchOpen(!isSearchOpen)}>
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <Link to="/wishlist" className="relative text-brand hover:text-gold transition-colors hidden md:block">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
               {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">{wishlistCount}</span>}
            </Link>
            <button onClick={openDrawer} className="relative text-brand hover:text-gold transition-colors block focus:outline-none">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
               {cartItemCount > 0 && <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">{cartItemCount}</span>}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.role === 'admin' ? (
                  <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-sm font-medium hover:text-gold transition-colors duration-300">
                      {t.admin}
                    </Link>
                    <Link to="/cashier" className="text-sm font-medium hover:text-gold transition-colors duration-300">
                      {language === 'ar' ? 'الكاشير' : language === 'tr' ? 'Kasiyer' : 'Cashier'}
                    </Link>
                  </div>
                ) : user?.role === 'cashier' ? (
                  <Link to="/cashier" className="text-sm font-medium hover:text-gold transition-colors duration-300">
                    {language === 'ar' ? 'الكاشير' : language === 'tr' ? 'Kasiyer' : 'Cashier'}
                  </Link>
                ) : (
                  <Link to="/user/dashboard" className="text-sm font-medium hover:text-gold transition-colors duration-300">
                    {t.dashboard}
                  </Link>
                )}
                <button onClick={handleLogout} className="text-brand hover:text-gold transition-colors duration-300 text-sm font-medium">
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-brand hover:text-gold transition-colors duration-300" aria-label="Account">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setTheme(colorTheme)}
              className="text-brand hover:text-gold transition-colors md:ml-2"
              aria-label="Toggle Dark Mode"
            >
              {colorTheme === 'light' ? (
                // Sun Icon (when currently dark, next is light)
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon Icon (when currently light, next is dark)
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-brand hover:text-gold transition-colors md:ml-2"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              )}
            </button>
          </div>

      </div>
      </div>

      {/* Slide Down Search Bar */}
      <div className={`absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-100 transition-all duration-300 ease-in-out transform origin-top ${isSearchOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              autoFocus={isSearchOpen}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..." 
              className="w-full border-b-2 border-brand dark:border-gray-700 text-lg py-3 pr-10 focus:outline-none focus:border-gold dark:focus:border-gold bg-[var(--bg-secondary)] dark:bg-[#1a1a1a] text-[var(--text-primary)] dark:text-gray-100 placeholder-gray-400 transition-colors"
            />
            <button type="submit" className="absolute right-2 top-4 text-brand hover:text-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute -right-8 top-4 text-gray-400 hover:text-brand transition-colors hidden md:block">
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && isSearchOpen && (
            <div className="mt-4 bg-white rounded shadow-lg border border-gray-100 max-h-96 overflow-y-auto">
              <div className="p-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4 border-b border-gray-100">Products</div>
              {searchResults.map((prod) => {
                const img = resolveProductImage(prod, 'https://via.placeholder.com/60');
                return (
                  <div key={prod._id} onClick={() => { setIsSearchOpen(false); navigate(`/product/${prod.slug || prod._id || prod.id}`); }} className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer transition-colors">
                    <img loading="lazy" src={img} alt={prod.name?.en} className="w-12 h-12 object-cover rounded shadow-sm" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-brand">{language === 'ar' ? prod.name?.ar : language === 'tr' ? prod.name?.tr : prod.name?.en}</h4>
                      <p className="text-gold font-bold text-xs mt-1">{formatPrice(prod.salePrice || prod.price)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleSearchSubmit}>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">View all results</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Mobile Slide-In Drawer */}
    <div 
        className={`fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
    ></div>

    <div className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-beige dark:bg-[#0a0a0a] dark:border-l dark:border-gold/20 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-serif text-lg text-brand font-bold">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-4 flex flex-col gap-6 overflow-y-auto">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.home}</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">About Us</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.shop}</Link>
          <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.categories || 'Categories'}</Link>
          
          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
          
          <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium flex items-center justify-between text-lg">Wishlist {wishlistCount > 0 && <span className="bg-gold text-white text-[12px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}</Link>
          <button onClick={() => { setIsMobileMenuOpen(false); openDrawer(); }} className="text-brand hover:text-gold transition-colors font-medium text-left flex items-center justify-between w-full text-lg">Cart {cartItemCount > 0 && <span className="bg-gold text-white text-[12px] px-2 py-0.5 rounded-full">{cartItemCount}</span>}</button>
          
          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
          
        </div>
      </div>
    </>
  );
};

export default Navbar;
