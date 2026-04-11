import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const { items: cartItems, closeDrawer } = useCartStore();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const { items: wishlistItems } = useWishlistStore();
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();
  const location = useLocation();
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
  const handleCartClick = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    closeDrawer();
    navigate('/cart');
  };
  const copy = {
    en: {
      about: 'About Us',
      menu: 'Menu',
      language: 'Language',
      wishlist: 'Wishlist',
      cart: 'Cart',
      searchPlaceholder: 'Search products...',
      searchResults: 'Products',
      viewAllResults: 'View all results',
      account: 'Account',
      close: 'Close',
    },
    ar: {
      about: 'من نحن',
      menu: 'القائمة',
      language: 'اللغة',
      wishlist: 'المفضلة',
      cart: 'السلة',
      searchPlaceholder: 'ابحثي عن المنتجات...',
      searchResults: 'المنتجات',
      viewAllResults: 'عرض كل النتائج',
      account: 'الحساب',
      close: 'إغلاق',
    },
    tr: {
      about: 'Hakkimizda',
      menu: 'Menu',
      language: 'Dil',
      wishlist: 'Favoriler',
      cart: 'Sepet',
      searchPlaceholder: 'Urun ara...',
      searchResults: 'Urunler',
      viewAllResults: 'Tum sonuclari gor',
      account: 'Hesap',
      close: 'Kapat',
    },
  }[language] || {
    about: 'About Us',
    menu: 'Menu',
    language: 'Language',
    wishlist: 'Wishlist',
    cart: 'Cart',
    searchPlaceholder: 'Search products...',
    searchResults: 'Products',
    viewAllResults: 'View all results',
    account: 'Account',
    close: 'Close',
  };
  if (language === 'ar') {
    Object.assign(copy, {
      about: 'من نحن',
      menu: 'القائمة',
      language: 'اللغة',
      wishlist: 'المفضلة',
      cart: 'السلة',
      searchPlaceholder: 'ابحثي عن المنتجات...',
      searchResults: 'المنتجات',
      viewAllResults: 'عرض كل النتائج',
      account: 'الحساب',
      close: 'إغلاق',
    });
  }
  const cashierLabel = language === 'ar' ? 'الكاشير' : language === 'tr' ? 'Kasiyer' : 'Cashier';

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

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
    <nav className={`sticky top-0 w-full z-[120] transition-all duration-300 ${isScrolled ? 'backdrop-blur-md shadow-sm dark:border-b dark:border-gold' : 'bg-transparent dark:bg-transparent'} bg-[var(--navbar-bg)] text-[var(--text-primary)]`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo (allowed to shrink so icons on right are protected) */}
          <div className="shrink flex items-center min-w-[50px]">
            <Link to="/">
              <img loading="lazy" src="/logo.png" className={`w-auto max-w-[100px] sm:max-w-none object-contain opacity-0 animate-fade-in hover:scale-105 hover:drop-shadow-md dark:hover:drop-shadow-[0_0_8px_#8B6914] transition-all duration-500 ease-out ${isScrolled ? 'h-6 sm:h-8' : 'h-7 sm:h-12'}`} alt="Melora Logo" />
            </Link>
          </div>
          
          {/* Main Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-8 shrink-0">
            <Link to="/" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.home || 'Home'}
            </Link>
            <Link to="/about" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {copy.about}
            </Link>
            <Link to="/shop" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.shop}
            </Link>
            <Link to="/categories" className="text-brand hover:text-gold transition-colors duration-300 font-medium tracking-wide">
              {t.categories || 'Categories'}
            </Link>
          </div>

          {/* Icons Grid (Strict shrink-0 to preserve hitboxes) */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0 relative z-10 w-auto justify-end">
            
            {/* Language Switcher */}
            <div className="hidden md:flex items-center shrink-0 gap-1 md:gap-2 border-r border-gray-200 dark:border-gray-700 rtl:border-l rtl:border-r-0 pr-1 md:pr-4 rtl:pl-1 md:rtl:pl-4 rtl:pr-0 mr-1 md:mr-0 rtl:ml-1 md:rtl:ml-0 rtl:mr-0">
              <button type="button" onClick={() => setLanguage('en')} className={`shrink-0 text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors cursor-pointer ${language === 'en' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>EN</button>
              <button type="button" onClick={() => setLanguage('ar')} className={`shrink-0 text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors cursor-pointer ${language === 'ar' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>AR</button>
              <button type="button" onClick={() => setLanguage('tr')} className={`shrink-0 text-[10px] sm:text-xs md:text-sm font-bold md:font-medium transition-colors cursor-pointer ${language === 'tr' ? 'text-brand dark:text-gold' : 'text-gray-400 hover:text-gold'}`}>TR</button>
            </div>

            <button type="button" className="relative text-brand hover:text-gold transition-colors block shrink-0 cursor-pointer" onClick={() => setIsSearchOpen(!isSearchOpen)}>
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <Link to="/wishlist" className="relative text-brand hover:text-gold transition-colors hidden md:block shrink-0 cursor-pointer">
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
               {wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">{wishlistCount}</span>}
            </Link>
            <button type="button" onClick={handleCartClick} className="relative text-brand hover:text-gold transition-colors block focus:outline-none shrink-0 cursor-pointer" aria-label={copy.cart}>
               <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
               {cartItemCount > 0 && <span className="absolute -top-1 -right-2 bg-gold text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none">{cartItemCount}</span>}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                {user?.role === 'admin' ? (
                  <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                    <Link to="/admin" className="text-[10px] sm:text-sm font-medium hover:text-gold transition-colors duration-300">
                      {t.admin}
                    </Link>
                    <Link to="/cashier" className="text-[10px] sm:text-sm font-medium hover:text-gold transition-colors duration-300 hidden sm:block">
                      {cashierLabel}
                    </Link>
                  </div>
                ) : user?.role === 'cashier' ? (
                  <Link to="/cashier" className="text-[10px] sm:text-sm font-medium hover:text-gold transition-colors duration-300">
                    {cashierLabel}
                  </Link>
                ) : (
                  <Link to="/user/dashboard" className="text-[10px] sm:text-sm font-medium hover:text-gold transition-colors duration-300">
                    {t.dashboard}
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="text-brand hover:text-gold transition-colors duration-300 text-[10px] sm:text-sm font-medium shrink-0">
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-brand hover:text-gold transition-colors duration-300 shrink-0 cursor-pointer" aria-label={copy.account}>
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button 
              type="button"
              onClick={() => setTheme(colorTheme)}
              className="text-brand hover:text-gold transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {colorTheme === 'light' ? (
                // Sun Icon (when currently dark, next is light)
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Moon Icon (when currently light, next is dark)
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-brand hover:text-gold transition-colors shrink-0 cursor-pointer"
              aria-label={copy.menu}
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
      <div className={`absolute top-full left-0 z-[130] w-full border-t border-[var(--border-color)] bg-[var(--bg-card)] shadow-md transition-all duration-300 ease-in-out transform origin-top ${isSearchOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <div className="max-w-3xl mx-auto px-4 py-6">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              autoFocus={isSearchOpen}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full border-b-2 border-brand dark:border-gray-700 text-lg py-3 pr-10 focus:outline-none focus:border-gold dark:focus:border-gold bg-[var(--bg-secondary)] dark:bg-[#1a1a1a] text-[var(--text-primary)] dark:text-gray-100 placeholder-gray-400 transition-colors"
            />
            <button type="submit" className="absolute right-2 top-4 text-brand hover:text-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
            <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute -right-8 top-4 text-gray-400 hover:text-brand transition-colors hidden md:block">
              <span className="sr-only">{copy.close}</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && isSearchOpen && (
            <div className="mt-4 max-h-96 overflow-y-auto rounded border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg">
              <div className="border-b border-[var(--border-color)] px-4 p-2 text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">{copy.searchResults}</div>
              {searchResults.map((prod) => {
                const img = resolveProductImage(prod, 'https://via.placeholder.com/60');
                return (
                  <div key={prod._id} onClick={() => { setIsSearchOpen(false); navigate(`/product/${prod.slug || prod._id || prod.id}`); }} className="flex cursor-pointer items-center gap-4 border-b border-[var(--border-color)] p-4 transition-colors last:border-0 hover:bg-[var(--bg-secondary)]">
                    <img loading="lazy" src={img} alt={prod.name?.en} className="w-12 h-12 object-cover rounded shadow-sm" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-brand">{language === 'ar' ? prod.name?.ar : language === 'tr' ? prod.name?.tr : prod.name?.en}</h4>
                      <p className="text-gold font-bold text-xs mt-1">{formatPrice(prod.salePrice || prod.price)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="cursor-pointer bg-[var(--bg-secondary)] p-3 text-center transition-colors hover:opacity-90" onClick={handleSearchSubmit}>
                <span className="text-xs font-bold uppercase tracking-widest text-brand">{copy.viewAllResults}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>

    {/* Mobile Slide-In Drawer */}
    <div 
        className={`fixed inset-0 top-16 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
    ></div>

    <div className={`fixed top-16 bottom-0 right-0 w-[88%] max-w-sm bg-beige dark:bg-[#0a0a0a] dark:border-l dark:border-gold/20 shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-serif text-lg text-brand font-bold">{copy.menu}</span>
          <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="h-[calc(100vh-4rem-73px)] overflow-y-auto overscroll-contain p-4 flex flex-col gap-6">
          <div className="rounded-3xl border border-[var(--border-primary)]/60 bg-white/60 dark:bg-white/5 px-4 py-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand/60">
              {copy.language}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setLanguage('tr')} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${language === 'tr' ? 'bg-brand text-white' : 'bg-transparent text-brand hover:text-gold'}`}>TR</button>
              <button type="button" onClick={() => setLanguage('ar')} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${language === 'ar' ? 'bg-brand text-white' : 'bg-transparent text-brand hover:text-gold'}`}>AR</button>
              <button type="button" onClick={() => setLanguage('en')} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${language === 'en' ? 'bg-brand text-white' : 'bg-transparent text-brand hover:text-gold'}`}>EN</button>
            </div>
          </div>

          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.home}</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{copy.about}</Link>
          <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.shop}</Link>
          <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium text-lg">{t.categories || 'Categories'}</Link>
          
          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
          
          <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-brand hover:text-gold transition-colors font-medium flex items-center justify-between text-lg">{copy.wishlist} {wishlistCount > 0 && <span className="bg-gold text-white text-[12px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}</Link>
          <button type="button" onClick={handleCartClick} className="text-brand hover:text-gold transition-colors font-medium text-left flex items-center justify-between w-full text-lg">{copy.cart} {cartItemCount > 0 && <span className="bg-gold text-white text-[12px] px-2 py-0.5 rounded-full">{cartItemCount}</span>}</button>
          
          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
