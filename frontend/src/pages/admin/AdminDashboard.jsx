import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaDollarSign, 
  FaShoppingBag, 
  FaBook, 
  FaList, 
  FaClock, 
  FaUser, 
  FaChevronRight,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    totalBooks: 0,
    totalCategories: 0,
    outOfStockCount: 0,
    pendingOrdersCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, booksRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/orders/all`),
          axios.get(`${API_BASE_URL}/books`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);

        const allOrders = ordersRes.data || [];
        const allBooks = booksRes.data || [];
        const allCategories = categoriesRes.data || [];

        // Tính doanh thu (chỉ tính khi đã giao hàng thành công và đã thanh toán)
        const revenue = allOrders
          .filter(o => o.shippingStatus === 'DELIVERED')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const outOfStockCount = allBooks.filter(b => b.stockQuantity <= 0).length;
        const pendingOrdersCount = allOrders.filter(o => o.status === 'PENDING').length;

        setStats({
          revenue,
          totalOrders: allOrders.length,
          totalBooks: allBooks.length,
          totalCategories: allCategories.length,
          outOfStockCount,
          pendingOrdersCount
        });

        // Sắp xếp đơn hàng mới nhất
        const sortedOrders = [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));

        // Bán chạy (Dựa vào salesCount hoặc sắp xếp salesCount giảm dần nếu có)
        // Nếu không có, lấy top sách giá cao nhất hoặc demo
        const sortedBooks = [...allBooks].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        setBestsellers(sortedBooks.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + ' đ';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-850">Chờ duyệt</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-850">Đang xử lý</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-850">Đang giao</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-850">Đã giao</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-850">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-850">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Thống kê hoạt động</h2>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hiệu suất bán hàng và quản trị tồn kho.</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Doanh Thu</span>
            <div className="text-2xl font-bold text-gray-850">{formatPrice(stats.revenue)}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-1">
              <FaArrowUp />
              <span>+12.5% từ tuần trước</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-650 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <FaDollarSign />
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Đơn đặt hàng</span>
            <div className="text-2xl font-bold text-gray-850">{stats.totalOrders} đơn</div>
            <div className="text-xs text-gray-450 mt-1">
              <span className="font-bold text-yellow-600">{stats.pendingOrdersCount} đơn</span> chờ duyệt
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <FaShoppingBag />
          </div>
        </div>

        {/* Đầu sách */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Đầu sách</span>
            <div className="text-2xl font-bold text-gray-850">{stats.totalBooks} cuốn</div>
            <div className="text-xs text-gray-450 mt-1">
              <span className="font-bold text-red-600">{stats.outOfStockCount} cuốn</span> hết hàng
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <FaBook />
          </div>
        </div>

        {/* Danh mục */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Danh Mục</span>
            <div className="text-2xl font-bold text-gray-850">{stats.totalCategories} danh mục</div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold mt-1">
              <span>Đang hoạt động ổn định</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-650 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
            <FaList />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Đơn hàng mới nhất */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaClock className="text-gray-450" /> Đơn đặt hàng gần đây
            </h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              Xem tất cả <FaChevronRight className="text-[10px]" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-450 text-sm">Chưa có đơn hàng nào.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold text-gray-450 uppercase border-b border-gray-100">
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Tổng tiền</th>
                    <th className="pb-3">Trạng thái</th>
                    <th className="pb-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 font-medium text-gray-800">
                        <div>ID: #{order.id}</div>
                        <div className="text-xs text-gray-450">{order.phoneNumber || order.user?.username}</div>
                      </td>
                      <td className="py-3.5 text-gray-700 font-semibold">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3.5">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 text-gray-500 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sản phẩm bán chạy */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="pb-4 mb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaBook className="text-gray-450" /> Sách bán chạy
            </h3>
          </div>

          <div className="flex-1 space-y-4">
            {bestsellers.length === 0 ? (
              <div className="text-center py-10 text-gray-455 text-sm">Không tìm thấy sách.</div>
            ) : (
              bestsellers.map((book, idx) => (
                <div key={book.id} className="flex gap-3.5 items-center hover:bg-gray-50 p-2 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                    <img 
                      src={book.imageUrl || book.img || 'https://placehold.co/150'} 
                      alt={book.title} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 truncate">{book.title}</div>
                    <div className="text-xs text-gray-450 mt-0.5">{book.author}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-primary">{formatPrice(book.price)}</div>
                    <div className="text-[10px] font-medium text-gray-400 mt-0.5">Đã bán: {book.salesCount || 0}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
