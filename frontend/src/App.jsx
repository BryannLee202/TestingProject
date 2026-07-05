import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ScrollToTop from './components/common/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import AIChatWidget from './components/common/AIChatWidget';
import Intro from './components/common/Intro';

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
const About = lazy(() => import('./pages/About'));
const NewBooks = lazy(() => import('./pages/NewBooks'));
const UsedBooks = lazy(() => import('./pages/UsedBooks'));
const Promotions = lazy(() => import('./pages/Promotions'));

// Policy pages - lazy load
const Terms = lazy(() => import('./pages/policies/Terms'));
const Privacy = lazy(() => import('./pages/policies/Privacy'));
const PaymentPrivacy = lazy(() => import('./pages/policies/PaymentPrivacy'));
const Returns = lazy(() => import('./pages/policies/Returns'));
const Warranty = lazy(() => import('./pages/policies/Warranty'));
const Shipping = lazy(() => import('./pages/policies/Shipping'));
const FAQ = lazy(() => import('./pages/policies/FAQ'));
const Contact = lazy(() => import('./pages/policies/Contact'));

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
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));

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
  const [showIntro, setShowIntro] = useState(true);

  // --- Chống copy và F12 (Bảo vệ đồ án) ---
  useEffect(() => {
    // Chặn chuột phải
    const handleContextMenu = (e) => e.preventDefault();

    // Chặn F12, Ctrl+Shift+I, Ctrl+U, Ctrl+C
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
      }
    };
    
    // Chặn sự kiện Copy
    const handleCopy = (e) => {
      e.preventDefault();
      // Optional: alert('Không được copy code bạn nhé!');
    };

    // Đăng ký các bộ lắng nghe sự kiện
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    // Dọn dẹp khi unmount (thực tế App ít khi unmount nhưng cứ để cho chuẩn React)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);
  // ------------------------------------------

  return (
    <LanguageProvider>
      <AuthProvider>
      <CartProvider>
        <WebSocketProvider>
        <BrowserRouter>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
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
                <Route path="about" element={<About />} />
                <Route path="new-books" element={<NewBooks />} />
                <Route path="used-books" element={<UsedBooks />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="payment-privacy" element={<PaymentPrivacy />} />
                <Route path="returns" element={<Returns />} />
                <Route path="warranty" element={<Warranty />} />
                <Route path="shipping" element={<Shipping />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="contact" element={<Contact />} />
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
                <Route path="contacts" element={<AdminContacts />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <AIChatWidget />
          <ScrollToTopButton />
        </BrowserRouter>
        </WebSocketProvider>
      </CartProvider>
    </AuthProvider>

    </LanguageProvider>
  );
}

export default App;
