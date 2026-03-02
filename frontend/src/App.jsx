import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import ProductDetail from './pages/public/ProductDetail';

import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import OrderSuccess from './pages/public/OrderSuccess';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/user/Dashboard';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import Wishlist from './pages/user/Wishlist';
import Addresses from './pages/user/Addresses';
import ProtectedRoute from './components/layout/ProtectedRoute';

import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/Products/ProductList';
import AddProduct from './pages/admin/Products/AddProduct';
import EditProduct from './pages/admin/Products/EditProduct';
import OrderList from './pages/admin/Orders/OrderList';
import UserList from './pages/admin/Users/UserList';
import CategoryManager from './pages/admin/Categories/CategoryManager';
import CouponManager from './pages/admin/Coupons/CouponManager';
import AdminSettings from './pages/admin/Settings/AdminSettings';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import useLangStore from './store/useLangStore';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

function App() {
  const { language } = useLangStore();

  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen font-sans bg-white text-black">
        {/* Main Application Routes (with Navbar/Footer) */}
        <Routes>
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={
                    <Elements stripe={stripePromise}>
                       <Checkout />
                    </Elements>
                  } />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Protected User Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/user/dashboard" element={<Dashboard />}>
                       <Route index element={<Orders />} />
                       <Route path="profile" element={<Profile />} />
                       <Route path="wishlist" element={<Wishlist />} />
                       <Route path="addresses" element={<Addresses />} />
                    </Route>
                  </Route>
                </Routes>
              </main>
              <Footer />
            </>
          } />

          {/* Admin Routes (Separate Layout, No global Navbar/Footer) */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<EditProduct />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="users" element={<UserList />} />
              <Route path="categories" element={<CategoryManager />} />
              <Route path="coupons" element={<CouponManager />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
