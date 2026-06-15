import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaList, FaTimes } from 'react-icons/fa';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Không thể kết nối đến máy chủ. Vui lòng tải lại trang.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: `Danh mục "${name}" và tất cả sách thuộc danh mục này có thể bị ảnh hưởng!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/categories/${id}`);
          setCategories(prev => prev.filter(c => c.id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Danh mục đã được gỡ khỏi hệ thống thành công.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Error deleting category:', error);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi khi xóa',
            text: error.response?.data?.message || 'Không thể xóa danh mục này do có sách đang liên kết.'
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền tên danh mục.'
      });
    }

    try {
      if (editingCategory) {
        // Cập nhật
        await axios.put(`${API_BASE_URL}/categories/${editingCategory.id}`, { name: categoryName });
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công',
          text: `Danh mục đã được đổi tên thành "${categoryName}".`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Tạo mới
        await axios.post(`${API_BASE_URL}/categories`, { name: categoryName });
        Swal.fire({
          icon: 'success',
          title: 'Thêm mới thành công',
          text: `Danh mục "${categoryName}" đã được lưu.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi lưu dữ liệu',
        text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
      });
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý và phân loại các chủ đề sách trong cửa hàng.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary text-white hover:bg-primary-light font-medium py-2.5 px-5 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <FaPlus />
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex gap-4 items-center">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-all text-sm"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Chưa có danh mục nào được tìm thấy.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-250">
                <th className="px-6 py-4 w-20">Mã ID</th>
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4 text-center w-36">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/40">
                  <td className="px-6 py-4 font-bold text-gray-450">#{cat.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{cat.name}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="Đổi tên"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-white">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaList className="text-primary" />
                {editingCategory ? 'Chỉnh sửa tên danh mục' : 'Tạo danh mục phân loại mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 uppercase">Tên danh mục *</label>
                <input 
                  type="text" 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  placeholder="Ví dụ: Tiểu thuyết, Sách kỹ năng..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm"
                />
              </div>

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
                  {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
