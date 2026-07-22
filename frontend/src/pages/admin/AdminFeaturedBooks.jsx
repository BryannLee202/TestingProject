import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaTrash, FaSearch, FaPlus, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function AdminFeaturedBooks() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchFeaturedBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/books/featured`);
      setFeaturedBooks(res.data);
    } catch (error) {
      console.error('Error fetching featured books:', error);
      Swal.fire('Lỗi', 'Không thể tải danh sách sách nổi bật.', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchFeaturedBooks();
  }, [fetchFeaturedBooks]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/books/search`, {
        params: { keyword: searchTerm }
      });
      setSearchResults(res.data);
    } catch (error) {
      console.error('Error searching books:', error);
      Swal.fire('Lỗi', 'Không thể tìm kiếm sách.', 'error');
    } finally {
      setSearching(false);
    }
  };

  const toggleFeaturedStatus = async (book, isFeatured) => {
    try {
      await axios.put(`${API_BASE_URL}/books/${book.id}/featured`, { isFeatured }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: isFeatured ? 'Đã thêm vào danh sách nổi bật' : 'Đã gỡ khỏi danh sách nổi bật',
        timer: 1500,
        showConfirmButton: false
      });
      fetchFeaturedBooks();
      // Cập nhật lại search results nếu đang hiển thị
      setSearchResults(prev => prev.map(b => b.id === book.id ? { ...b, isFeatured } : b));
    } catch (error) {
      console.error('Error toggling featured status:', error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đề Cử & Quảng Cáo</h2>
        <p className="text-gray-500 mt-1">Danh sách này sẽ hiển thị ở khu vực VIP ngay dưới banner trang chủ. Bạn có thể thêm các sản phẩm đang chạy quảng cáo hoặc sách muốn đẩy mạnh doanh số.</p>
      </div>

      {/* Danh sách hiện tại */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">Đang hiển thị trên trang chủ ({featuredBooks.length})</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <FaSpinner className="animate-spin text-3xl text-blue-500" />
            </div>
          ) : featuredBooks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có sách nào được chọn làm Sản phẩm Đề Cử / Ads. Hãy tìm và thêm ở bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredBooks.map(book => (
                <div key={book.id} className="border border-gray-200 rounded-lg p-3 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex gap-3 h-24 mb-3">
                    <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-16 h-full object-cover rounded shadow-sm" />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-2" title={book.title}>{book.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{book.author}</p>
                      <p className="text-sm font-semibold text-red-500 mt-1">{book.price.toLocaleString('vi-VN')} đ</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeaturedStatus(book, false)}
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    <FaTrash className="text-xs" /> Gỡ bỏ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tìm kiếm và thêm mới */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">Tìm kiếm & Thêm sản phẩm quảng cáo</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập tên sách, tác giả..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-70 transition-colors"
            >
              {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />} Tìm
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {searchResults.map(book => {
                const isAlreadyFeatured = featuredBooks.some(fb => fb.id === book.id) || book.isFeatured;
                return (
                  <div key={book.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex gap-4 items-center">
                      <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm md:text-base">{book.title}</h4>
                        <div className="text-sm text-gray-500 flex gap-4">
                          <span>{book.author}</span>
                          <span className="text-red-500 font-semibold">{book.price.toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {isAlreadyFeatured ? (
                        <button
                          onClick={() => toggleFeaturedStatus(book, false)}
                          className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-sm hover:bg-gray-200"
                        >
                          <FaCheckCircle className="text-green-500" /> Đã thêm
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleFeaturedStatus(book, true)}
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          <FaPlus /> Thêm
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {searchResults.length === 0 && searchTerm && !searching && (
            <div className="text-center py-4 text-gray-500">Không tìm thấy kết quả nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
