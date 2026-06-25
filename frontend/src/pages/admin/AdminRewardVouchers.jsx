import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaGift } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { showNotification } from '../../utils/alert';

export default function AdminRewardVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    rewardValue: '',
    expirationDate: '',
    isActive: true
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchVouchers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/admin/rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      showNotification('Lỗi', 'Không thể tải danh sách mã sự kiện.', 'error');
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        rewardValue: voucher.rewardValue,
        expirationDate: voucher.expirationDate ? voucher.expirationDate.substring(0, 16) : '',
        isActive: voucher.isActive
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        rewardValue: '',
        expirationDate: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        code: formData.code.trim().toUpperCase(),
        rewardType: 'POINTS',
        rewardValue: Number(formData.rewardValue),
        expirationDate: formData.expirationDate,
        isActive: formData.isActive
      };

      if (editingVoucher) {
        await axios.put(`${API_BASE_URL}/admin/rewards/${editingVoucher.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Thành công', 'Cập nhật mã sự kiện thành công.', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/admin/rewards`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Thành công', 'Thêm mới mã sự kiện thành công.', 'success');
      }
      setShowModal(false);
      fetchVouchers();
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi lưu mã sự kiện.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, xóa nó!',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/rewards/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('Thành công', 'Xóa mã sự kiện thành công.', 'success');
        fetchVouchers();
      } catch (error) {
        showNotification('Lỗi', 'Không thể xóa mã sự kiện. Có thể mã đã được sử dụng.', 'error');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaGift className="text-purple-600" /> Quản lý Mã Sự Kiện (Y-Point)
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Thêm mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600">Mã (Code)</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Phần thưởng (Y-Point)</th>
              <th className="p-4 font-semibold text-gray-600">Ngày hết hạn</th>
              <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  Chưa có mã sự kiện nào.
                </td>
              </tr>
            ) : (
              vouchers.map(voucher => (
                <tr key={voucher.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-purple-700 uppercase tracking-wider">{voucher.code}</td>
                  <td className="p-4 text-right font-medium text-red-600">{voucher.rewardValue?.toLocaleString()}</td>
                  <td className="p-4 text-gray-600">
                    {voucher.expirationDate ? new Date(voucher.expirationDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${voucher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {voucher.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleOpenModal(voucher)}
                        className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(voucher.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {editingVoucher ? 'Cập nhật mã sự kiện' : 'Thêm mã sự kiện mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mã (Code) *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  disabled={!!editingVoucher}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none uppercase font-bold text-purple-700 disabled:bg-gray-100"
                  placeholder="VD: EVENT2026"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Trị giá thưởng (Y-Point) *</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({...formData, rewardValue: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="VD: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày hết hạn</label>
                <input 
                  type="datetime-local" 
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Bỏ trống nếu không có thời hạn.</p>
              </div>

              {editingVoucher && (
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Trạng thái Kích hoạt
                  </label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  {editingVoucher ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
