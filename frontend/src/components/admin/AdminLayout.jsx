import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useTranslation from '../../hooks/useTranslation';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import toast from 'react-hot-toast';
import { enableNotificationAudio, isNotificationLooping, playNotificationTone, setNotificationTone, stopNotificationTone } from '../../utils/notifications';

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation('admin');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pendingPaymentOrders, setPendingPaymentOrders] = useState([]);
  const [isAlertTonePlaying, setIsAlertTonePlaying] = useState(false);
  const lastAlertIdRef = useRef(null);
  const alertsBootstrappedRef = useRef(false);

  useEffect(() => {
    return enableNotificationAudio();
  }, []);

  useEffect(() => {
    const loadNotificationTone = async () => {
      try {
        const res = await settingsService.getSettings();
        const tone = res?.data?.notificationTone || 'custom';
        setNotificationTone(tone);
      } catch (error) {
        console.error('Failed to load notification tone for admin', error);
      }
    };

    loadNotificationTone();
  }, []);

  const uiMap = {
    en: {
      dashboard: 'Dashboard',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      users: 'Users',
      coupons: 'Coupons',
      content: 'Content',
      settings: 'Settings',
      general: 'General',
      profile: 'Profile',
      security: 'Security',
      details: 'Details',
      edit: 'Edit',
      addNew: 'Add New',
      orderDetails: 'Order Details',
      viewStore: 'View Store',
      orderAlerts: 'Order Alerts',
      newOrderArrived: 'A new online order just arrived.',
      pendingCount: 'pending',
      guestCustomer: 'Guest Customer',
      receiptWaiting: 'Receipt waiting for review',
      noPaymentAlerts: 'No new payment alerts',
      viewAllOrders: 'View all orders',
      myProfile: 'My Profile',
      accountSettings: 'Account Settings',
      testSound: 'Test Alert Sound',
      stopSound: 'Stop Alert Sound',
      stopForNow: 'Stop For Now',
      preparing: 'Preparing',
      paymentPending: 'Payment verification still required',
      alertSilenced: 'Alert sound stopped',
      orderPreparingNow: 'The order is now being prepared.',
      logout: 'Logout',
      developedWith: 'Developed with Melora',
      returnToStore: 'Return to Store',
    },
    ar: {
      dashboard: 'لوحة القيادة',
      products: 'المنتجات',
      categories: 'الفئات',
      orders: 'الطلبات',
      users: 'المستخدمون',
      coupons: 'الكوبونات',
      content: 'المحتوى',
      settings: 'الإعدادات',
      general: 'عام',
      profile: 'الملف الشخصي',
      security: 'الأمان',
      details: 'التفاصيل',
      edit: 'تعديل',
      addNew: 'إضافة جديد',
      orderDetails: 'تفاصيل الطلب',
      viewStore: 'عرض المتجر',
      orderAlerts: 'تنبيهات الطلبات',
      newOrderArrived: 'وصل طلب جديد من المتجر الآن.',
      pendingCount: 'بانتظار المراجعة',
      guestCustomer: 'عميل ضيف',
      receiptWaiting: 'الإيصال بانتظار المراجعة',
      noPaymentAlerts: 'لا توجد تنبيهات دفع جديدة',
      viewAllOrders: 'عرض كل الطلبات',
      myProfile: 'ملفي الشخصي',
      accountSettings: 'إعدادات الحساب',
      testSound: 'اختبار صوت الإشعار',
      stopSound: 'إيقاف صوت الإشعار',
      stopForNow: 'إيقاف الآن',
      preparing: 'قيد التجهيز',
      paymentPending: 'ما زال الطلب بانتظار التحقق من الدفع',
      alertSilenced: 'تم إيقاف صوت التنبيه',
      orderPreparingNow: 'تم تحويل الطلب إلى قيد التجهيز.',
      logout: 'تسجيل الخروج',
      developedWith: 'تم تطويره مع Melora',
      returnToStore: 'العودة إلى المتجر',
    },
    tr: {
      dashboard: 'Kontrol Paneli',
      products: 'Urunler',
      categories: 'Kategoriler',
      orders: 'Siparisler',
      users: 'Kullanicilar',
      coupons: 'Kuponlar',
      content: 'Icerik',
      settings: 'Ayarlar',
      general: 'Genel',
      profile: 'Profil',
      security: 'Guvenlik',
      details: 'Detaylar',
      edit: 'Duzenle',
      addNew: 'Yeni Ekle',
      orderDetails: 'Siparis Detayi',
      viewStore: 'Magazayi Goster',
      orderAlerts: 'Siparis Uyarilari',
      newOrderArrived: 'Magazaya yeni bir online siparis geldi.',
      pendingCount: 'bekliyor',
      guestCustomer: 'Misafir Musteri',
      receiptWaiting: 'Dekont inceleme bekliyor',
      noPaymentAlerts: 'Yeni odeme uyarisi yok',
      viewAllOrders: 'Tum siparisleri gor',
      myProfile: 'Profilim',
      accountSettings: 'Hesap Ayarlari',
      testSound: 'Bildirim Sesini Test Et',
      stopSound: 'Bildirim Sesini Durdur',
      stopForNow: 'Simdilik Durdur',
      preparing: 'Hazirlaniyor',
      paymentPending: 'Odeme dogrulamasi halen gerekli',
      alertSilenced: 'Uyari sesi durduruldu',
      orderPreparingNow: 'Siparis hazirlaniyor durumuna alindi.',
      logout: 'Cikis Yap',
      developedWith: 'Melora ile gelistirildi',
      returnToStore: 'Magazaya Don',
    }
  };

  const ui = uiMap[language] || uiMap.en;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTestSound = async () => {
    await playNotificationTone();
    setIsAlertTonePlaying(isNotificationLooping());
    toast.success(ui.newOrderArrived);
  };

  const handleStopSound = () => {
    stopNotificationTone();
    setIsAlertTonePlaying(false);
  };

  const handleSilenceAlert = () => {
    stopNotificationTone();
    setIsAlertTonePlaying(false);
    toast.success(ui.alertSilenced);
  };

  const handlePrepareAlert = async (order) => {
    try {
      if (order?.status === 'pending_payment') {
        handleSilenceAlert();
        toast(ui.paymentPending, { icon: '⏳' });
        return;
      }

      await orderService.markOrderPreparing(order._id);
      stopNotificationTone();
      setIsAlertTonePlaying(false);
      setPendingPaymentOrders((prev) =>
        prev.filter((entry) => entry._id !== order._id)
      );
      toast.success(ui.orderPreparingNow);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update order');
    }
  };

  useEffect(() => {
    let intervalId;

    const loadNotifications = async ({ notify = false } = {}) => {
      try {
        const res = await orderService.getOrderAlerts(8);
        const alerts = res.data || [];
        setPendingPaymentOrders(alerts);

        if (!alerts.length && isNotificationLooping()) {
          stopNotificationTone();
          setIsAlertTonePlaying(false);
        }

        const latestId = alerts[0]?._id || null;
        if (!alertsBootstrappedRef.current) {
          alertsBootstrappedRef.current = true;
          lastAlertIdRef.current = latestId;
          return;
        }

        if (notify && latestId && latestId !== lastAlertIdRef.current) {
          playNotificationTone();
          setIsAlertTonePlaying(true);
          toast.success(ui.newOrderArrived);
        }

        lastAlertIdRef.current = latestId;
      } catch (error) {
        console.error('Failed to fetch admin notifications', error);
      }
    };

    if (user?.role === 'admin') {
      loadNotifications();
      intervalId = window.setInterval(() => loadNotifications({ notify: true }), 15000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [location.pathname, ui.newOrderArrived, user?.role]);

  const navigation = [
    { name: t?.sidebar?.dashboard || ui.dashboard, href: '/admin' },
    { name: t?.sidebar?.products || ui.products, href: '/admin/products' },
    { name: t?.sidebar?.categories || ui.categories, href: '/admin/categories' },
    { name: t?.sidebar?.orders || ui.orders, href: '/admin/orders' },
    { name: t?.sidebar?.users || ui.users, href: '/admin/users' },
    { name: t?.sidebar?.coupons || ui.coupons, href: '/admin/coupons' },
    { name: t?.sidebar?.content || ui.content, href: '/admin/content' }
  ];

  const settingsSubmenu = [
    { name: ui.general, href: '/admin/settings' },
    { name: ui.profile, href: '/admin/profile' },
    { name: ui.security, href: '/admin/security' }
  ];

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter((p) => p !== '');
    if (paths.length === 1 && paths[0] === 'admin') return [{ name: ui.dashboard, path: '/admin' }];

    const breadcrumbs = [];
    let currentPath = '';
    paths.forEach((p, idx) => {
      currentPath += `/${p}`;
      let name = p.charAt(0).toUpperCase() + p.slice(1);
      if (p === 'admin' && idx === 0) name = ui.dashboard;
      if (p === 'products') name = ui.products;
      if (p === 'orders') name = ui.orders;
      if (p === 'users') name = ui.users;
      if (p === 'categories') name = ui.categories;
      if (p === 'coupons') name = ui.coupons;
      if (p === 'content') name = ui.content;
      if (p === 'settings') name = ui.settings;
      if (p === 'profile') name = ui.profile;
      if (p === 'security') name = ui.security;
      if (p === 'add') name = ui.addNew;
      if (p === 'edit') name = ui.edit;
      if (p.length === 24) name = ui.details;
      breadcrumbs.push({ name, path: currentPath });
    });
    return breadcrumbs;
  };

  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/admin') return t?.sidebar?.dashboard || ui.dashboard;
    if (p.includes('/edit/')) return ui.edit;
    if (p.includes('/add')) return ui.addNew;
    if (p.includes('/products')) return ui.products;
    if (p.includes('/orders/')) return ui.orderDetails;
    if (p.includes('/orders')) return ui.orders;
    if (p.includes('/users')) return ui.users;
    if (p.includes('/categories')) return ui.categories;
    if (p.includes('/coupons')) return ui.coupons;
    if (p.includes('/settings')) return ui.settings;
    if (p.includes('/profile')) return ui.profile;
    if (p.includes('/content')) return ui.content;
    if (p.includes('/security')) return ui.security;
    return p.split('/').pop() || ui.dashboard;
  };

  return (
    <div className="flex h-screen bg-white flex-col md:flex-row font-sans">
      <div className="md:hidden bg-[#1a1a2e] dark:bg-[#111111] text-beige p-4 flex justify-between items-center z-30 relative">
        <Link to="/admin" className="text-xl font-serif text-[#8B6914] tracking-widest uppercase">
          {t?.sidebar?.adminPortal || 'Melora Admin'}
        </Link>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleTestSound}
            className="rounded bg-[#d1a85d] px-2 py-1 text-[11px] font-semibold text-[#1d1730] hover:bg-[#c39b50]"
          >
            {ui.testSound}
          </button>
          {isAlertTonePlaying && (
            <button
              type="button"
              onClick={handleStopSound}
              className="rounded border border-red-300 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
            >
              {ui.stopSound}
            </button>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-gold"
          >
            <option value="en">EN</option>
            <option value="ar">AR</option>
            <option value="tr">TR</option>
          </select>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}></path></svg>
          </button>
        </div>
      </div>

      <div className={`${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 pt-16' : 'hidden'} md:relative md:block md:w-64 bg-[#1a1a2e] dark:bg-[#111111] text-beige flex-shrink-0 transition-all z-20 shadow-xl flex flex-col justify-between`}>
        <div>
          <div className="p-6 hidden md:block border-b border-gray-800 mb-4">
            <Link to="/admin" className="text-2xl font-serif text-[#8B6914] tracking-widest uppercase block text-center">Melora</Link>
            <span className="block text-center text-[10px] text-beige/50 tracking-[0.3em] uppercase mt-2">{t?.sidebar?.adminPortal || 'Admin Portal'}</span>
          </div>

          <nav className="px-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navigation.map((item) => {
              const isActive = item.href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded text-sm font-medium transition-all duration-300 transform hover:translate-x-1 ${
                    isActive
                      ? 'bg-[#8B6914] text-white shadow-md border-l-4 border-gold'
                      : 'text-beige/70 hover:bg-[#8B6914]/20 hover:text-[#8B6914] border-l-4 border-transparent'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="pt-2">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-full flex justify-between items-center px-4 py-3 rounded text-sm font-medium transition-all duration-300 transform hover:translate-x-1 text-beige/70 hover:bg-[#8B6914]/20 hover:text-[#8B6914] border-l-4 border-transparent"
              >
                <span>{t?.sidebar?.settings || ui.settings}</span>
                <span className="text-xs">{isSettingsOpen ? '-' : '+'}</span>
              </button>

              {isSettingsOpen && (
                <div className="pl-8 pr-4 py-2 space-y-1 bg-[#141424] rounded-b mb-2 box-shadow-inner mt-1">
                  {settingsSubmenu.map((sub) => {
                    const isActive = location.pathname.startsWith(sub.href);
                    return (
                      <Link
                        key={sub.name}
                        to={sub.href}
                        className={`block px-4 py-2 text-xs font-medium rounded transition-all duration-300 hover:translate-x-1 ${isActive ? 'text-[#8B6914] font-bold' : 'text-beige/60 hover:text-[#8B6914]'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-800">
              <Link
                to="/"
                className="block px-4 py-2 rounded text-sm font-medium transition-all duration-300 hover:translate-x-1 text-blue-400 hover:bg-blue-900/20"
              >
                &larr; {ui.returnToStore}
              </Link>
            </div>
          </nav>
        </div>

        <div className="p-4 bg-[#141424] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 rounded text-xs font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-red-900/50 transition-colors uppercase tracking-widest"
          >
            {t?.sidebar?.logout || ui.logout}
          </button>
          <p className="text-center text-[9px] text-gray-500 tracking-wider uppercase mt-4">
            {ui.developedWith}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col relative w-full md:w-auto bg-gray-50/50">
        <header className="hidden md:flex bg-white shadow-sm border-b border-gray-200 h-16 items-center px-8 justify-between sticky top-0 z-10 w-full">
          <nav className="flex items-center text-sm font-medium text-gray-500 truncate max-w-[50%]">
            {getBreadcrumbs().map((bc, idx, arr) => (
              <span key={bc.path} className="flex items-center">
                {idx < arr.length - 1 ? (
                  <Link to={bc.path} className="hover:text-black hover:underline transition-colors">{bc.name}</Link>
                ) : (
                  <span className="text-black ml-1">{bc.name}</span>
                )}
                {idx < arr.length - 1 && <span className="mx-2 text-gray-300">/</span>}
              </span>
            ))}
          </nav>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xs font-bold text-brand hover:text-gold uppercase tracking-widest px-3 py-1.5 border border-brand/20 hover:border-gold rounded transition-colors hidden lg:block">
              {ui.viewStore}
            </Link>

            <button
              type="button"
              onClick={handleTestSound}
              className="hidden lg:block rounded border border-[#d1a85d] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1d1730] bg-[#f6e7bf] hover:bg-[#edd8a1] transition-colors"
            >
              {ui.testSound}
            </button>
            {isAlertTonePlaying && (
              <button
                type="button"
                onClick={handleStopSound}
                className="hidden lg:block rounded border border-red-200 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
              >
                {ui.stopSound}
              </button>
            )}

            <div className="relative">
              <button onClick={() => setIsNotificationsOpen((prev) => !prev)} className="relative text-gray-400 hover:text-black transition-colors focus:outline-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {pendingPaymentOrders.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {pendingPaymentOrders.length}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-black">{ui.orderAlerts}</h3>
                    <span className="text-xs text-gray-500">{pendingPaymentOrders.length} {ui.pendingCount}</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {pendingPaymentOrders.length > 0 ? pendingPaymentOrders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/admin/orders/${order._id}`}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-black">{order.shippingAddress?.fullName || ui.guestCustomer}</p>
                        <p className="text-xs text-gray-500 mt-1">{ui.receiptWaiting}</p>
                        <p className="text-xs text-brand mt-1">Order #{order._id.slice(-8)} • {new Date(order.createdAt).toLocaleString()}</p>
                        <div
                          className="mt-3 flex flex-wrap gap-2"
                          onClick={(event) => event.preventDefault()}
                        >
                          <button
                            type="button"
                            onClick={() => handleSilenceAlert()}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                          >
                            {ui.stopForNow}
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrepareAlert(order)}
                            className="rounded-lg border border-[#d7c1a2] bg-[#f6ead8] px-3 py-1.5 text-[11px] font-semibold text-[#5f4321] hover:bg-[#eddcc6]"
                          >
                            {ui.preparing}
                          </button>
                        </div>
                      </Link>
                    )) : (
                      <div className="px-4 py-6 text-sm text-gray-500 text-center">{ui.noPaymentAlerts}</div>
                    )}
                  </div>
                  <div className="px-4 py-3 bg-gray-50">
                    <Link to="/admin/orders" onClick={() => setIsNotificationsOpen(false)} className="text-sm font-medium text-brand hover:text-black transition-colors">
                      {ui.viewAllOrders}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-black text-xs rounded outline-none px-2 py-1 hover:border-black cursor-pointer hidden sm:block"
            >
              <option value="en">EN</option>
              <option value="ar">AR</option>
              <option value="tr">TR</option>
            </select>

            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <span className="text-sm font-medium text-gray-600 hover:text-black transition-colors">{user?.name || 'Admin'}</span>
                <div className="w-8 h-8 bg-[#1a1a2e] rounded-full flex items-center justify-center text-[#8B6914] shadow-sm font-serif">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </button>

              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10 block" onClick={() => setIsProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-20">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm font-medium text-black truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand" onClick={() => setIsProfileDropdownOpen(false)}>{ui.myProfile}</Link>
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand" onClick={() => setIsProfileDropdownOpen(false)}>{ui.accountSettings}</Link>
                    <div className="border-t border-gray-50 mt-1"></div>
                    <button onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">{ui.logout}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pt-6 md:p-8 md:pt-10">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-serif text-black capitalize tracking-wide">{getPageTitle()}</h1>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


