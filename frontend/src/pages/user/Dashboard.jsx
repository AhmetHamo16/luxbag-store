import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useLangStore from '../../store/useLangStore';

const copyMap = {
  en: {
    orders: 'Dashboard (Orders)',
    profile: 'Profile Details',
    wishlist: 'My Wishlist',
    addresses: 'Addresses',
    account: 'My Account',
    welcome: 'Welcome back',
    user: 'User',
    signOut: 'Sign Out',
  },
  ar: {
    orders: 'لوحة الطلبات',
    profile: 'بيانات الحساب',
    wishlist: 'المفضلة',
    addresses: 'العناوين',
    account: 'حسابي',
    welcome: 'مرحبًا بعودتك',
    user: 'المستخدم',
    signOut: 'تسجيل الخروج',
  },
  tr: {
    orders: 'Siparis Paneli',
    profile: 'Profil Bilgileri',
    wishlist: 'Favorilerim',
    addresses: 'Adresler',
    account: 'Hesabim',
    welcome: 'Tekrar hos geldiniz',
    user: 'Kullanici',
    signOut: 'Cikis Yap',
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language } = useLangStore();
  const copy = copyMap[language] || copyMap.en;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: copy.orders, path: '/user/dashboard' },
    { name: copy.profile, path: '/user/dashboard/profile' },
    { name: copy.wishlist, path: '/user/dashboard/wishlist' },
    { name: copy.addresses, path: '/user/dashboard/addresses' },
  ];

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-4 py-16 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mb-12 flex items-center justify-between border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="mb-2 text-3xl font-serif text-[var(--text-primary)]">{copy.account}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{copy.welcome}, {user?.name || copy.user}!</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="border-b border-[var(--text-primary)] pb-1 text-sm font-medium text-[var(--text-primary)] transition-colors duration-300 hover:border-gold hover:text-gold"
        >
          {copy.signOut}
        </button>
      </div>

      <div className="flex flex-col gap-12 md:flex-row">
        <aside className="w-full md:w-1/4">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'border-gold bg-[var(--bg-card)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="w-full md:w-3/4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
