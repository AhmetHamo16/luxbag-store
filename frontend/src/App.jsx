import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import CashierRoute from './components/admin/CashierRoute';
import CashierLayout from './components/admin/CashierLayout';
import CartDrawer from './components/cart/CartDrawer';
import BackToTop from './components/layout/BackToTop';
import ProtectedRoute from './components/layout/ProtectedRoute';
import FloatingSocials from './components/shared/FloatingSocials';
import AnnouncementBar from './components/layout/AnnouncementBar';
import { contentService } from './services/contentService';

import useLangStore from './store/useLangStore';
import useCurrencyStore from './store/useCurrencyStore';
import { Toaster } from 'react-hot-toast';
import api from './services/api';

const Home = lazy(() => import('./pages/public/Home'));
const Shop = lazy(() => import('./pages/public/Shop'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const AboutUs = lazy(() => import('./pages/public/AboutUs'));
const Contact = lazy(() => import('./pages/public/Contact'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const Cart = lazy(() => import('./pages/public/Cart'));
const Checkout = lazy(() => import('./pages/public/Checkout'));
const OrderSuccess = lazy(() => import('./pages/public/OrderSuccess'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Orders = lazy(() => import('./pages/user/Orders'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Wishlist = lazy(() => import('./pages/user/Wishlist'));
const Addresses = lazy(() => import('./pages/user/Addresses'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductList = lazy(() => import('./pages/admin/Products/ProductList'));
const AddProduct = lazy(() => import('./pages/admin/Products/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/Products/EditProduct'));
const OrderList = lazy(() => import('./pages/admin/Orders/OrderList'));
const OrderDetails = lazy(() => import('./pages/admin/Orders/OrderDetails'));
const UserList = lazy(() => import('./pages/admin/Users/UserList'));
const CategoryManager = lazy(() => import('./pages/admin/Categories/CategoryManager'));
const CouponManager = lazy(() => import('./pages/admin/Coupons/CouponManager'));
const AdminSettings = lazy(() => import('./pages/admin/Settings/AdminSettings'));
const AdminContent = lazy(() => import('./pages/admin/Content/AdminContent'));
const AdminSecurity = lazy(() => import('./pages/admin/Security/AdminSecurity'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));
const CashierPOS = lazy(() => import('./pages/cashier/CashierPOS'));

const PageLoader = () => (
  <div className="flex min-h-[40vh] items-center justify-center bg-beige text-brand">
    <div className="text-sm uppercase tracking-[0.35em] text-brand/70">Loading Melora</div>
  </div>
);

function App() {
  const { language } = useLangStore();
  const fetchCurrency = useCurrencyStore(state => state.fetchCurrency);
  const [globalContent, setGlobalContent] = React.useState(null);

  React.useEffect(() => {
    contentService.getContent().then(res => setGlobalContent(res.data)).catch(() => {});
  }, []);

  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  React.useEffect(() => {
    fetchCurrency();
  }, [fetchCurrency]);

  React.useEffect(() => {
    const visitKey = 'melora_visit_tracked';
    if (sessionStorage.getItem(visitKey)) return;

    api.post('/analytics/visit')
      .then(() => sessionStorage.setItem(visitKey, '1'))
      .catch(() => {});
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans bg-beige text-brand">
        <Toaster position="top-right" />
        {/* Main Application Routes (with Navbar/Footer) */}
        <Routes>
          <Route path="/*" element={
            <>
              <AnnouncementBar content={globalContent?.announcementBar} />
              <Navbar />
              <CartDrawer />
              <main className="grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/categories" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/order-confirmation/:id" element={<OrderSuccess />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    {/* Protected User Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/user/dashboard" element={<Dashboard />}>
                         <Route index element={<Orders />} />
                         <Route path="profile" element={<Profile />} />
                         <Route path="addresses" element={<Addresses />} />
                      </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <FloatingSocials />
              <Footer />
            </>
          } />

          {/* Admin Routes (Separate Layout, No global Navbar/Footer) */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                }
              />
              <Route path="products" element={<Suspense fallback={<PageLoader />}><ProductList /></Suspense>} />
              <Route path="products/add" element={<Suspense fallback={<PageLoader />}><AddProduct /></Suspense>} />
              <Route path="products/edit/:id" element={<Suspense fallback={<PageLoader />}><EditProduct /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrderList /></Suspense>} />
              <Route path="orders/:id" element={<Suspense fallback={<PageLoader />}><OrderDetails /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<PageLoader />}><UserList /></Suspense>} />
              <Route path="categories" element={<Suspense fallback={<PageLoader />}><CategoryManager /></Suspense>} />
              <Route path="coupons" element={<Suspense fallback={<PageLoader />}><CouponManager /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
              <Route path="profile" element={<Suspense fallback={<PageLoader />}><AdminProfile /></Suspense>} />
              <Route path="content" element={<Suspense fallback={<PageLoader />}><AdminContent /></Suspense>} />
              <Route path="security" element={<Suspense fallback={<PageLoader />}><AdminSecurity /></Suspense>} />
            </Route>
          </Route>

          <Route path="/cashier" element={<CashierRoute />}>
            <Route element={<CashierLayout />}>
              <Route index element={<Suspense fallback={<PageLoader />}><CashierPOS /></Suspense>} />
            </Route>
          </Route>

        </Routes>
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;
