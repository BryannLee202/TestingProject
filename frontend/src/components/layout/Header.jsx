import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBookOpen, 
  FaThLarge, 
  FaChevronDown, 
  FaSearch, 
  FaRegBell, 
  FaShoppingCart, 
  FaRegUser,
  FaShieldAlt,
  FaClipboardList,
  FaHeart,
  FaTicketAlt,
  FaCoins,
  FaSignOutAlt,
  FaCrown,
  FaChevronRight
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = React.useRef(null);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  // Fetch suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/books/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
        setSuggestions(res.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      if (showSuggestions) fetchSuggestions();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSuggestions, API_BASE_URL]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  useEffect(() => {
    const fetchNotificationStats = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/notifications/unread-count`),
          axios.get(`${API_BASE_URL}/notifications`)
        ]);
        setUnreadCount(countRes.data);
        setRecentNotifications(listRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching notification stats:', error);
      }
    };

    fetchNotificationStats();
    const interval = setInterval(fetchNotificationStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await axios.put(`${API_BASE_URL}/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setRecentNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error('Error marking read:', error);
      }
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary mr-4">
          <img src="/src/assets/logo_YiYi.png" alt="YiYi Book" className="h-10 object-contain" />
          <span>YiYi Book</span>
        </Link>

        {/* Category Dropdown (Placeholder) */}
        {/* <div className="hidden md:flex items-center gap-2 cursor-pointer text-gray-700 hover:text-primary transition-colors">
          <FaThLarge className="text-xl" />
          <span className="font-medium">Danh Mục</span>
          <FaChevronDown className="text-sm" />
        </div> */}


        {/* Search */}
        <div className="flex-1 max-w-xl mx-8 relative hidden lg:block" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Tìm kiếm sách, tác giả..." 
              className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-primary-light transition-colors">
              <FaSearch />
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {suggestions.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {suggestions.map(book => (
                    <Link 
                      key={book.id} 
                      to={`/book/${book.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <img src={book.imageUrl || 'https://placehold.co/40'} alt={book.title} className="w-10 h-14 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">{book.title}</div>
                        <div className="text-xs text-gray-500 truncate">{book.author}</div>
                      </div>
                      <div className="text-primary font-bold text-sm whitespace-nowrap">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price)}
                      </div>
                    </Link>
                  ))}
                  <div 
                    onClick={handleSearch}
                    className="p-3 text-center text-sm text-primary font-medium hover:bg-gray-50 cursor-pointer"
                  >
                    Xem tất cả kết quả cho "{searchQuery}"
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Không tìm thấy sách nào khớp với từ khóa
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative cursor-pointer" onClick={() => setIsNotifyOpen(!isNotifyOpen)}>
            <div className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
              <div className="relative">
                <FaRegBell className="text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-1">Thông báo</span>
            </div>
            
            {/* Notify Dropdown */}
            {isNotifyOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Thông báo mới nhận</div>
                <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">Không có thông báo</div>
                  ) : (
                    recentNotifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-purple-50/5' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FaRegBell className="text-xs" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs truncate ${!notif.isRead ? 'font-bold text-gray-950' : 'text-gray-600'}`}>{notif.title}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">{notif.content}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link to="/notifications" className="block text-center py-2 bg-gray-50 text-primary text-sm font-medium hover:bg-gray-100 transition-colors">Xem tất cả</Link>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors relative">
            <div className="relative">
              <FaShoppingCart className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium mt-1">Giỏ hàng</span>
          </Link>

          {/* User */}
          <div className="relative cursor-pointer" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <FaRegUser className="text-2xl" />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-bold leading-tight truncate max-w-[150px]">
                  {user ? `Chào, ${user.fullName || user.name || ''}` : 'Tài khoản'}
                </span>
                <span className="text-[11px] font-bold">
                  {user ? (user.role === 'ADMIN' || (user.yPoints || 0) >= 100000 ? 'Kim Cương' : (user.yPoints || 0) >= 30000 ? 'Vàng' : 'Bạc') : 'Đăng nhập / Đăng ký'}
                </span>
              </div>
            </div>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50 py-2">
                {user ? (
                  <>
                    <Link to="/profile" className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(user.role === 'ADMIN' || (user.yPoints || 0) >= 100000) ? 'bg-gray-800 text-yellow-500' : (user.yPoints || 0) >= 30000 ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-500'}`}>
                          <FaCrown size={20} />
                        </div>
                        <span className="font-bold text-gray-700">Thành viên {user.role === 'ADMIN' || (user.yPoints || 0) >= 100000 ? 'Kim Cương' : (user.yPoints || 0) >= 30000 ? 'Vàng' : 'Bạc'}</span>
                      </div>
                      <FaChevronRight className="text-gray-400" />
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-primary hover:bg-gray-50 font-bold border-b border-gray-100">
                        <FaShieldAlt className="text-gray-400 text-lg" /> Trang quản trị
                      </Link>
                    )}
                    
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FaClipboardList className="text-gray-400 text-lg" /> Đơn hàng của tôi
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FaHeart className="text-gray-400 text-lg" /> Sản phẩm yêu thích
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FaTicketAlt className="text-gray-400 text-lg" /> Wallet Voucher
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <FaCoins className="text-gray-400 text-lg" /> Tài khoản Y-Point
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-1"></div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors text-left">
                      <FaSignOutAlt className="text-gray-400 text-lg" /> Thoát tài khoản
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Đăng nhập</Link>
                    <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Đăng ký</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
