import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaImages, FaTimes, FaLink } from 'react-icons/fa';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [position, setPosition] = useState('MAIN');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/banners`);
      setBanners(res.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Có lỗi xảy ra khi lấy danh sách banner quảng cáo.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setImageUrl('');
    setTitle('');
    setLinkUrl('');
    setPosition('MAIN');
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl || '');
    setTitle(banner.title || '');
    setLinkUrl(banner.linkUrl || '');
    setPosition(banner.position || 'MAIN');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Ảnh quảng cáo này sẽ bị gỡ khỏi trang chủ ngay lập tức!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/banners/${id}`);
          setBanners(prev => prev.filter(b => b.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa',
            text: 'Banner đã được xóa thành công.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Error deleting banner:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xóa banner. Vui lòng thử lại.'
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng cung cấp đường dẫn hình ảnh (URL).'
      });
    }

    const payload = {
      imageUrl,
      title,
      linkUrl,
      position
    };

    try {
      if (editingBanner) {
        await axios.put(`${API_BASE_URL}/banners/${editingBanner.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công',
          text: 'Thông tin banner đã được cập nhật.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API_BASE_URL}/banners`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Thêm mới thành công',
          text: 'Banner mới đã được hiển thị trên trang chủ.',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra trong quá trình lưu banner.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Banner</h2>
          <p className="text-gray-500 text-sm mt-1">Cấu hình trình chiếu slide và banner nhỏ bên lề trang chủ.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white hover:bg-primary-light font-medium py-2.5 px-5 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <FaPlus />
          <span>Thêm banner mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-20 text-center text-gray-500">Chưa có banner quảng cáo nào. Click thêm mới để bắt đầu.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all">
              {/* Image Preview */}
              <div className="relative pt-[45%] bg-gray-50 border-b border-gray-100 overflow-hidden">
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title || 'Banner'}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border ${
                  banner.position === 'MAIN' 
                    ? 'bg-blue-50 text-blue-650 border-blue-200' 
                    : 'bg-orange-50 text-orange-650 border-orange-200'
                }`}>
                  {banner.position === 'MAIN' 
                    ? 'Slide chính (840x320)' 
                    : banner.position === 'SIDE_TOP' 
                      ? 'Slide bên phải - Trên' 
                      : banner.position === 'SIDE_BOTTOM' 
                        ? 'Slide bên phải - Dưới' 
                        : 'Slide bên phải - Tự chia'}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm truncate">{banner.title || 'Không có tiêu đề'}</h4>
                  {banner.linkUrl ? (
                    <a 
                      href={banner.linkUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <FaLink className="text-[10px]" />
                      <span className="truncate max-w-[200px]">{banner.linkUrl}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 mt-1 block">Không có liên kết đích</span>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-sm">
                  <button 
                    onClick={() => openEditModal(banner)}
                    className="px-3.5 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="px-3.5 py-1.5 text-red-650 hover:bg-red-50 border border-red-100 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-scale-up overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaImages className="text-primary" />
                {editingBanner ? 'Cập nhật ảnh banner' : 'Tạo ảnh quảng cáo mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors p-1.5 hover:bg-gray-50 rounded"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Tiêu đề & Vị trí */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Mô tả / Tiêu đề quảng cáo</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề hoặc mô tả..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 uppercase">Vị trí hiển thị</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm bg-white"
                  >
                    <option value="MAIN">Slide lớn chính giữa (840x320)</option>
                    <option value="SIDE_TOP">Slide bên phải - Phía trên (Chạy tự động)</option>
                    <option value="SIDE_BOTTOM">Slide bên phải - Phía dưới (Chạy tự động)</option>
                    <option value="SIDE">Slide bên phải - Tự chia ô chẵn/lẻ</option>
                  </select>
                </div>
              </div>

              {/* Đường dẫn ảnh */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Đường dẫn hình ảnh (URL) *</label>
                <input 
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  placeholder="http://example.com/slide.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Đường dẫn link khi click */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Liên kết dẫn đến khi Click (URL)</label>
                <input 
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="http://example.com/books/discounted"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                />
              </div>

              {/* Preview image */}
              {imageUrl && (
                <div className="border border-gray-150 p-2 rounded-lg bg-gray-50 flex items-center justify-center relative pt-[40%] overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}

              {/* Form Footer */}
              <div className="pt-4 border-t border-gray-150 flex justify-end gap-3.5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition-all text-sm cursor-pointer"
                >
                  {editingBanner ? 'Lưu thay đổi' : 'Thêm banner'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
