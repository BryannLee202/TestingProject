import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaChartLine, 
  FaBook, 
  FaThList, 
  FaImages, 
  FaShoppingBag, 
  FaArrowLeft, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa';

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Phân quyền bảo mật ở phía Frontend
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <FaChartLine />, label: 'Thống kê' },
    { to: '/admin/books', icon: <FaBook />, label: 'Quản lý Sách' },
    { to: '/admin/categories', icon: <FaThList />, label: 'Quản lý Danh mục' },
    { to: '/admin/banners', icon: <FaImages />, label: 'Quản lý Banner' },
    { to: '/admin/orders', icon: <FaShoppingBag />, label: 'Quản lý Đơn hàng' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Quản lý Tài khoản' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'}`}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2 font-bold text-lg text-primary-light">
            <FaShieldAlt className="text-xl" />
            <span>GRAPE ADMIN</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white hover:text-primary transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* User profile brief */}
        <div className="p-6 border-b border-gray-850 flex items-center gap-3 bg-gray-950/40">
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary-light flex items-center justify-center font-bold">
            A
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user.fullName}</div>
            <div className="text-[11px] text-gray-400">Administrator</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/20">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all text-sm font-medium"
          >
            <FaSignOutAlt />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-650 hover:text-primary transition-colors text-xl"
            >
              <FaBars />
            </button>
            <h1 className="text-lg font-bold text-gray-800 hidden sm:block">Hệ thống Quản trị Bookstore</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-150 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-xs" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}
    </div>
  );
}
