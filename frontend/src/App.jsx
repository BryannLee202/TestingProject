import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import OrderSuccess from './pages/OrderSuccess';
import PaymentResult from './pages/PaymentResult';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import Category from './pages/Category';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Coupons from './pages/Coupons';
import FlashSale from './pages/FlashSale';

// Policy pages
import Terms from './pages/policies/Terms';
import Privacy from './pages/policies/Privacy';
import PaymentPrivacy from './pages/policies/PaymentPrivacy';
import Returns from './pages/policies/Returns';
import Warranty from './pages/policies/Warranty';
import Shipping from './pages/policies/Shipping';

// Admin views
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSiteSettings from './pages/admin/AdminSiteSettings';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminFeaturedBooks from './pages/admin/AdminFeaturedBooks';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminRewardVouchers from './pages/admin/AdminRewardVouchers';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminReviews from './pages/admin/AdminReviews';
import MockPaymentGateway from './pages/MockPaymentGateway';

import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Client Routes */}
            <Route path="/" element={<ClientLayout />}>
              <Route index element={<Home />} />
              <Route path="category/:categoryId" element={<Category />} />
              <Route path="book/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="payment-result" element={<PaymentResult />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="order-success/:id" element={<OrderSuccess />} />
              <Route path="payment/mock-gateway" element={<MockPaymentGateway />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="search" element={<Search />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="flash-sale" element={<FlashSale />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="payment-privacy" element={<PaymentPrivacy />} />
              <Route path="returns" element={<Returns />} />
              <Route path="warranty" element={<Warranty />} />
              <Route path="shipping" element={<Shipping />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="featured-books" element={<AdminFeaturedBooks />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="settings" element={<AdminSiteSettings />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="rewards" element={<AdminRewardVouchers />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ScrollToTopButton />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
