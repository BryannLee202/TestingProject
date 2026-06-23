import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';

// Các trang người dùng hay vào nhất - load ngay (không lazy)
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load các trang ít dùng hơn - chỉ tải khi cần
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Category = lazy(() => import('./pages/Category'));
const Search = lazy(() => import('./pages/Search'));
const Coupons = lazy(() => import('./pages/Coupons'));
const FlashSale = lazy(() => import('./pages/FlashSale'));
const MockPaymentGateway = lazy(() => import('./pages/MockPaymentGateway'));

// Policy pages - lazy load
const Terms = lazy(() => import('./pages/policies/Terms'));
const Privacy = lazy(() => import('./pages/policies/Privacy'));
const PaymentPrivacy = lazy(() => import('./pages/policies/PaymentPrivacy'));
const Returns = lazy(() => import('./pages/policies/Returns'));
const Warranty = lazy(() => import('./pages/policies/Warranty'));
const Shipping = lazy(() => import('./pages/policies/Shipping'));

// Admin pages - lazy load toàn bộ (chỉ admin mới vào)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminSiteSettings = lazy(() => import('./pages/admin/AdminSiteSettings'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminFeaturedBooks = lazy(() => import('./pages/admin/AdminFeaturedBooks'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminRewardVouchers = lazy(() => import('./pages/admin/AdminRewardVouchers'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));

// Loading spinner hiển thị khi trang đang tải
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#C92127] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">Đang tải...</p>
    </div>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
          <ScrollToTopButton />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
