import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../../assets/logo_ngang_thay_chu.png';
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
  FaChevronRight,
  FaTimes,
  FaCheckDouble,
  FaTag,
  FaInfoCircle,
  FaRegClock,
  FaHistory,
  FaSyncAlt,
  FaChartLine
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = React.useRef(null);
  const [defaultSuggestions, setDefaultSuggestions] = useState({ categories: [], bestsellers: [], featured: [] });
  const [allCategories, setAllCategories] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory')) || [];
    } catch {
      return [];
    }
  });

  const addSearchHistory = (term) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeSearchHistory = (term) => {
    const newHistory = searchHistory.filter(t => t !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchDefaultSuggestions = async () => {
      try {
        const [catRes, bestRes, featRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/books/bestsellers`),
          axios.get(`${API_BASE_URL}/books/featured`)
        ]);
        const categories = catRes.data || [];
        setAllCategories(categories);
        
        const featuredCats = categories.filter(c => c.featured);
        const nonFeaturedCats = categories.filter(c => !c.featured);
        const displayCategories = [...featuredCats, ...nonFeaturedCats].slice(0, 4);

        setDefaultSuggestions({
          categories: displayCategories,
          bestsellers: Array.isArray(bestRes.data) ? bestRes.data.slice(0, 3) : (bestRes.data?.data || []).slice(0, 3),
          featured: (featRes.data || []).slice(0, 3)
        });
      } catch (error) {
        console.error('Error fetching default suggestions:', error);
      }
    };
    fetchDefaultSuggestions();
  }, [API_BASE_URL]);

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
        setAllNotifications(listRes.data || []);
        setRecentNotifications((listRes.data || []).slice(0, 5));
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
        setAllNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error('Error marking read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/read-all`);
      setUnreadCount(0);
      setRecentNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setAllNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const matchedCategories = searchQuery.trim().length > 0 
    ? allCategories.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary mr-4">
          <img src={logoImg} alt="YiYi Book" className="h-10 object-contain" />
        </Link>

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
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {searchQuery.trim().length > 0 ? (
                <>
                  {matchedCategories.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đề xuất danh mục</h4>
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.slice(0, 3).map(cat => (
                          <Link 
                            key={cat.id} 
                            to={`/category/${cat.id}`}
                            onClick={() => {
                              setShowSuggestions(false);
                              setSearchQuery('');
                            }}
                            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 rounded-full transition-colors flex items-center gap-1.5"
                          >
                            <FaSearch className="text-[10px]" /> {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {suggestions.map(book => (
                        <Link 
                          key={book.id} 
                          to={`/book/${book.id}`}
                          onClick={() => {
                            addSearchHistory(book.title);
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
                  ) : matchedCategories.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Không tìm thấy kết quả nào khớp với từ khóa
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="p-4 max-h-[450px] overflow-y-auto bg-white">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <FaHistory className="text-gray-500" /> Lịch sử tìm kiếm
                        </h4>
                        <button onClick={clearSearchHistory} className="text-xs text-red-500 hover:underline">
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((term, index) => (
                          <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 group">
                            <span 
                              className="text-sm text-gray-700 cursor-pointer mr-2 hover:text-primary"
                              onClick={() => {
                                setSearchQuery(term);
                                setShowSuggestions(false);
                                navigate(`/search?q=${encodeURIComponent(term)}`);
                              }}
                            >
                              {term}
                            </span>
                            <FaTimes 
                              className="text-gray-400 hover:text-red-500 cursor-pointer text-[10px]" 
                              onClick={() => removeSearchHistory(term)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="border-b border-gray-100 mt-4"></div>
                    </div>
                  )}

                  {/* Hot Keywords (Using Bestsellers to mock) */}
                  {defaultSuggestions.bestsellers.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <FaChartLine className="text-gray-500" /> Từ khóa hot
                        </h4>
                        <button className="text-gray-400 hover:text-primary transition-colors">
                          <FaSyncAlt className="text-xs" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {defaultSuggestions.bestsellers.slice(0, 6).map(book => (
                          <Link 
                            key={`hot-${book.id}`} 
                            to={`/book/${book.id}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                          >
                            <img src={book.imageUrl || 'https://placehold.co/40'} alt={book.title} className="w-10 h-10 object-contain" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-700 line-clamp-2 leading-tight">{book.title}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="border-b border-gray-100 mt-4"></div>
                    </div>
                  )}

                  {/* Featured Categories (Using Categories to mock) */}
                  {defaultSuggestions.categories.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <FaThLarge className="text-gray-500" /> Danh mục nổi bật
                        </h4>
                        <button className="text-gray-400 hover:text-primary transition-colors">
                          <FaSyncAlt className="text-xs" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {defaultSuggestions.categories.slice(0, 4).map((cat, i) => {
                          const getCategoryImage = (name, index) => {
                            const lowerName = name.toLowerCase();
                            if (lowerName.includes('thiếu nhi')) return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=150&h=150';
                            if (lowerName.includes('tiểu thuyết') || lowerName.includes('văn học')) return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150&h=150';
                            if (lowerName.includes('khoa học') || lowerName.includes('công nghệ')) return 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=150&h=150';
                            if (lowerName.includes('kinh tế') || lowerName.includes('kinh doanh')) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=150&h=150';
                            if (lowerName.includes('tâm lý') || lowerName.includes('kỹ năng')) return 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=150&h=150';
                            
                            const fallbackImages = [
                              'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=150&h=150',
                              'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=150&h=150',
                              'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=150&h=150',
                              'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&q=80&w=150&h=150',
                            ];
                            return fallbackImages[index % fallbackImages.length];
                          };

                          return (
                            <Link 
                              key={`fcat-${cat.id}`} 
                              to={`/category/${cat.id}`}
                              onClick={() => setShowSuggestions(false)}
                              className="flex flex-col items-center text-center group"
                            >
                              <div className="w-16 h-16 rounded-full bg-gray-50 mb-2 overflow-hidden shadow-sm border border-gray-100 group-hover:border-primary group-hover:shadow-md transition-all">
                                <img src={cat.imageUrl || getCategoryImage(cat.name, i)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                              </div>
                              <span className="text-xs font-medium text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                {cat.name}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                <button 
                  onClick={() => { setIsNotifyOpen(false); setShowAllNotificationsModal(true); }} 
                  className="w-full block text-center py-2 bg-gray-50 text-primary text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Xem tất cả
                </button>
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

      {/* All Notifications Modal */}
      {showAllNotificationsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <FaRegBell className="text-primary" /> Tất cả thông báo
              </h3>
              <button 
                onClick={() => setShowAllNotificationsModal(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white rounded-full shadow-sm"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <div className="flex justify-end mb-4">
                {allNotifications.some(n => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary-light transition-colors cursor-pointer bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm"
                  >
                    <FaCheckDouble /> Đánh dấu đã đọc tất cả
                  </button>
                )}
              </div>
              
              {allNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-gray-100 border-dashed">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                    <FaRegBell className="text-4xl" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-700 mb-1">Không có thông báo mới</h4>
                  <p className="text-gray-400 text-sm text-center">Chúng tôi sẽ gửi thông báo cho bạn khi có cập nhật mới về đơn hàng hoặc khuyến mãi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allNotifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`relative flex gap-4 p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${!notif.isRead ? 'bg-white border-primary/20 shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 opacity-80'}`}
                    >
                      {/* Unread Indicator Line */}
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}
                      
                      {getNotificationIcon(notif.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-[15px] leading-tight ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-[13px] text-gray-600 mt-1.5 leading-relaxed break-words">{notif.content}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2.5 font-medium">
                          <FaRegClock />
                          {new Date(notif.createdAt).toLocaleString('vi-VN', {
                            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
