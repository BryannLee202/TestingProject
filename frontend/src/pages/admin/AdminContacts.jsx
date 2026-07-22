import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPhoneAlt, FaEnvelope, FaTrash, FaCheck, FaComments, FaRegClock, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải danh sách liên hệ/góp ý.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/contacts/${id}/status`, { status: 'PROCESSED' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã đánh dấu giải quyết góp ý thành công!',
        confirmButtonColor: '#10B981'
      });
      fetchContacts();
    } catch (error) {
      console.error('Error resolving contact:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể cập nhật trạng thái.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa góp ý?',
      text: 'Bạn có chắc chắn muốn xóa thư góp ý này khỏi hệ thống? Hành động này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Có, xóa đi!',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/contacts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          icon: 'success',
          title: 'Đã xóa',
          text: 'Đã xóa góp ý thành công.',
          confirmButtonColor: '#10B981'
        });
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể xóa thư góp ý này.',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg">
            <FaComments />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản Lý Góp Ý & Liên Hệ</h2>
            <p className="text-sm text-gray-500">Xem và quản lý tất cả ý kiến đóng góp của độc giả từ trang Liên hệ</p>
          </div>
        </div>
        <button 
          onClick={fetchContacts}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
        >
          Làm mới
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : contacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Người gửi</th>
                  <th className="px-4 py-3">Thông tin liên lạc</th>
                  <th className="px-4 py-3">Nội dung góp ý</th>
                  <th className="px-4 py-3">Ngày gửi</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/40 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <FaUser size={14} />
                        </div>
                        <span className="font-semibold text-gray-800">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1.5 text-gray-700">
                          <FaPhoneAlt size={10} className="text-gray-400" /> {c.phone || 'Chưa cung cấp'}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <FaEnvelope size={10} className="text-gray-400" /> {c.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 max-w-xs">
                      <p className="text-gray-700 leading-relaxed text-xs break-words whitespace-pre-wrap">{c.content}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaRegClock className="text-gray-400" /> {formatDateTime(c.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                        c.status === 'PROCESSED' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {c.status === 'PROCESSED' ? 'Đã xử lý' : 'Đang xử lý'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        {c.status !== 'PROCESSED' && (
                          <button
                            onClick={() => handleResolve(c.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                            title="Đánh dấu đã giải quyết"
                          >
                            <FaCheck size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition"
                          title="Xóa góp ý"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center justify-center gap-2">
            <FaComments size={40} className="text-gray-300" />
            <p>Hộp thư góp ý hiện đang trống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
