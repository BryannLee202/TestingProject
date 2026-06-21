import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBell, FaPlus, FaTrash, FaPaperPlane, FaSearch, FaUser, FaGlobe, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const typeOptions = [
  { value: 'SYSTEM', label: '⚙️ Hệ thống', color: 'bg-gray-100 text-gray-700' },
  { value: 'PROMO', label: '🎁 Khuyến mãi', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ORDER', label: '📦 Đơn hàng', color: 'bg-blue-100 text-blue-700' },
  { value: 'REVIEW_COMMENT', label: '💬 Đánh giá', color: 'bg-purple-100 text-purple-700' },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sending, setSending] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'SYSTEM',
    userId: null, // null = broadcast
  });

  const getToken = () => localStorage.getItem('token');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifications(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUsers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập tiêu đề và nội dung thông báo.', 'error');
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API_BASE_URL}/notifications/admin/send`, form, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      await Swal.fire({
        icon: 'success',
        title: 'Gửi thành công!',
        text: form.userId ? `Đã gửi thông báo đến người dùng #${form.userId}` : 'Đã phát sóng thông báo đến tất cả người dùng!',
        timer: 2000,
        showConfirmButton: false
      });
      setIsModalOpen(false);
      setForm({ title: '', content: '', type: 'SYSTEM', userId: null });
      setUserSearch('');
      fetchNotifications();
    } catch (e) {
      Swal.fire('Lỗi', 'Không thể gửi thông báo. Vui lòng thử lại.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa thông báo?',
      text: 'Thao tác này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C92127',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Xóa'
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      Swal.fire('Lỗi', 'Không thể xóa thông báo.', 'error');
    }
  };

  const filtered = notifications.filter(n => {
    const matchSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || n.type === filterType;
    return matchSearch && matchType;
  });

  const filteredUsers = users.filter(u =>
    (u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
     u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
     u.username?.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const selectedUser = users.find(u => u.id === form.userId);

  const getTypeBadge = (type) => {
    const t = typeOptions.find(t => t.value === type);
    return t ? (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
    ) : (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{type}</span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBell className="text-[#C92127]" /> Quản lý Thông Báo
          </h1>
          <p className="text-sm text-gray-500 mt-1">{notifications.length} thông báo trong hệ thống</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#C92127] hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <FaPlus /> Gửi thông báo mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C92127] w-64"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127]"
          >
            <option value="ALL">Tất cả loại</option>
            {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {typeOptions.map(t => {
          const count = notifications.filter(n => n.type === t.value).length;
          return (
            <div key={t.value} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-xs text-gray-500 mt-1">{t.label}</div>
            </div>
          );
        })}
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Thông báo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Loại</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Người nhận</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Thời gian</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có thông báo nào phù hợp.</td></tr>
            ) : (
              filtered.map(n => (
                <tr key={n.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-gray-800 text-xs">{n.title}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">{n.content}</div>
                  </td>
                  <td className="px-4 py-3">{getTypeBadge(n.type)}</td>
                  <td className="px-4 py-3">
                    {n.userId ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <FaUser className="text-[10px]" /> #{n.userId}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <FaGlobe className="text-[10px]" /> Tất cả
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-gray-400">
                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${n.isRead ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {n.isRead ? 'Đã đọc' : 'Chưa đọc'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Xóa thông báo"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Send Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => { setIsModalOpen(false); setUserSearch(''); }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FaPaperPlane className="text-[#C92127]" /> Gửi thông báo mới
            </h3>
            <form onSubmit={handleSend} className="space-y-4">

              {/* Recipient */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Người nhận</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setForm(f => ({ ...f, userId: null })); setUserSearch(''); }}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${!form.userId ? 'bg-[#C92127] text-white border-[#C92127]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#C92127]'}`}
                  >
                    <FaGlobe /> Tất cả người dùng
                  </button>
                  <button
                    type="button"
                    onClick={() => document.getElementById('userSearchInput').focus()}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${form.userId ? 'bg-[#C92127] text-white border-[#C92127]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#C92127]'}`}
                  >
                    <FaUser /> Người dùng cụ thể
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="userSearchInput"
                    type="text"
                    placeholder="Tìm tên, email, username người dùng..."
                    value={selectedUser ? `${selectedUser.fullName} (${selectedUser.email})` : userSearch}
                    onFocus={() => { if (selectedUser) { setForm(f => ({ ...f, userId: null })); setUserSearch(''); } }}
                    onChange={e => { setUserSearch(e.target.value); setForm(f => ({ ...f, userId: null })); }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127]"
                  />
                  {userSearch && !form.userId && filteredUsers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredUsers.slice(0, 10).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { setForm(f => ({ ...f, userId: u.id })); setUserSearch(''); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                          <div className="font-medium text-gray-800">{u.fullName}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {form.userId && selectedUser && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700 flex items-center justify-between">
                    <span>✓ Gửi đến: <strong>{selectedUser.fullName}</strong> ({selectedUser.email})</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, userId: null }))} className="ml-2 text-blue-400 hover:text-blue-600"><FaTimes /></button>
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại thông báo</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${form.type === t.value ? 'bg-[#C92127] text-white border-[#C92127]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#C92127]'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127]"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung *</label>
                <textarea
                  required
                  rows={3}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#C92127] resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setUserSearch(''); }}
                  className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2 bg-[#C92127] text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <FaPaperPlane className="text-xs" />
                  {sending ? 'Đang gửi...' : (form.userId ? 'Gửi đến người dùng' : 'Phát sóng tất cả')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
