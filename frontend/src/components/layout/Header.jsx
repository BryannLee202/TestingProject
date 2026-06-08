import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBookOpen, 
  FaThLarge, 
  FaChevronDown, 
  FaSearch, 
  FaRegBell, 
  FaShoppingCart, 
  FaRegUser 
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center text-primary font-bold text-2xl gap-2">
          <FaBookOpen />
          <span>GRAPE BOOK</span>
        </Link>

        {/* Category Dropdown (Placeholder) */}
        {/* <div className="hidden md:flex items-center gap-2 cursor-pointer text-gray-700 hover:text-primary transition-colors">
          <FaThLarge className="text-xl" />
          <span className="font-medium">Danh Mục</span>
          <FaChevronDown className="text-sm" />
        </div> */}

        {/* Search */}
        <div className="flex-1 max-w-xl mx-8 relative hidden lg:block">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm sách, tác giả..." 
              className="w-full pl-4 pr-12 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-primary-light transition-colors">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <div className="relative cursor-pointer" onClick={() => setIsNotifyOpen(!isNotifyOpen)}>
            <div className="flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
              <div className="relative">
                <FaRegBell className="text-2xl" />
                <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
              </div>
              <span className="text-[11px] font-medium mt-1">Thông báo</span>
            </div>
            
            {/* Notify Dropdown */}
            {isNotifyOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Thông báo mới nhận</div>
                <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                  <div className="flex gap-3 p-4 hover:bg-gray-50 transition-colors">
                    <img src="https://cdn-icons-png.flaticon.com/512/726/726496.png" className="w-10 h-10 object-contain" alt="sale" />
                    <div>
                      <div className="font-semibold text-sm text-gray-800">Khuyến mãi 50%</div>
                      <div className="text-sm text-gray-500 mt-1">Duy nhất hôm nay cho sách Văn học.</div>
                    </div>
                  </div>
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
                <span className="text-sm font-bold leading-tight">
                  {user ? `Chào, ${user.name.split(' ').pop()}` : 'Tài khoản'}
                </span>
                <span className="text-[11px] text-gray-500">
                  {user ? 'Thành viên' : 'Đăng nhập / Đăng ký'}
                </span>
              </div>
            </div>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50 py-1">
                {user ? (
                  <>
                    <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-100 font-bold">{user.name}</div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Trang cá nhân</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">Đơn hàng của tôi</Link>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Đăng xuất</button>
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
