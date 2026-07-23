import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaStar, FaTrash, FaSearch, FaCommentDots, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('ALL');
  const [selectedImage, setSelectedImage] = useState(null); // Cho modal xem ảnh lớn

  const getToken = () => localStorage.getItem('token');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setReviews(res.data || []);
    } catch (e) {
      console.error(e);
      Swal.fire('Lỗi', 'Không thể tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa đánh giá này?',
      text: 'Thao tác này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C92127',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Xóa'
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setReviews(prev => prev.filter(r => r.id !== id));
      Swal.fire('Thành công!', 'Đã xóa đánh giá.', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Lỗi', 'Không thể xóa đánh giá.', 'error');
    }
  };

  const handleDismissReport = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/reviews/${id}/dismiss-report`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isReported: false } : r));
      Swal.fire('Thành công!', 'Đã gỡ cờ báo cáo.', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Lỗi', 'Không thể thao tác.', 'error');
    }
  };

  const [filterReported, setFilterReported] = useState('ALL');

  // Lọc đánh giá
  const filtered = reviews.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchSearch = r.comment?.toLowerCase().includes(term) ||
      r.user?.fullName?.toLowerCase().includes(term) ||
      r.book?.title?.toLowerCase().includes(term);
    
    const matchRating = filterRating === 'ALL' || r.rating.toString() === filterRating;
    const matchReported = filterReported === 'ALL' || (filterReported === 'REPORTED' && r.isReported) || (filterReported === 'NORMAL' && !r.isReported);
    
    return matchSearch && matchRating && matchReported;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCommentDots className="text-[#C92127]" /> Quản lý Đánh Giá
          </h1>
          <p className="text-sm text-gray-500 mt-1">{reviews.length} đánh giá trong hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, sách, người dùng..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C92127] w-72"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127]"
          >
            <option value="ALL">Tất cả số sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
          <select
            value={filterReported}
            onChange={e => setFilterReported(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127]"
          >
            <option value="ALL">Trạng thái (Tất cả)</option>
            <option value="REPORTED">Bị báo cáo</option>
            <option value="NORMAL">Bình thường</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Sách</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Người dùng</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Đánh giá</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ảnh đính kèm</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Thời gian</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Không có đánh giá nào.</td></tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={r.book?.imageUrl || 'https://via.placeholder.com/50'} alt={r.book?.title} className="w-10 h-14 object-cover rounded" />
                      <div className="font-semibold text-gray-800 text-xs max-w-[200px] line-clamp-2">{r.book?.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-xs">{r.user?.fullName}</div>
                    <div className="text-gray-500 text-[10px]">{r.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5 text-yellow-400 text-xs mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-200'} />
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 max-w-xs line-clamp-2">{r.comment}</div>
                  </td>
                  <td className="px-4 py-3">
                    {r.imageUrl ? (
                      <div 
                        className="w-12 h-12 rounded border border-gray-200 cursor-pointer overflow-hidden hover:opacity-80 relative group"
                        onClick={() => setSelectedImage(r.imageUrl.startsWith('http') ? r.imageUrl : `${API_BASE_URL.replace('/api', '')}${r.imageUrl}`)}
                      >
                        <img 
                          src={r.imageUrl.startsWith('http') ? r.imageUrl : `${API_BASE_URL.replace('/api', '')}${r.imageUrl}`} 
                          alt="Review" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaSearch className="text-white text-xs" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">Không có ảnh</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.isReported ? (
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-medium border border-red-100">
                        Bị báo cáo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded text-[10px] font-medium border border-green-100">
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      {r.isReported && (
                        <button
                          onClick={() => handleDismissReport(r.id)}
                          className="text-gray-400 hover:text-green-600 transition-colors text-xs"
                          title="Bỏ qua báo cáo (Đánh dấu hợp lệ)"
                        >
                          Bỏ qua
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Xóa đánh giá"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-400 transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>
            <img src={selectedImage} alt="Phóng to" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
