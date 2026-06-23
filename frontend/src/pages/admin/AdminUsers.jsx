import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUserShield, FaUser, FaTrash, FaSearch, FaUserTie } from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/users`);
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Có lỗi xảy ra khi đồng bộ danh sách tài khoản từ máy chủ.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMsg = newRole === 'ADMIN' 
      ? `Bạn có chắc muốn cấp quyền ADMIN cho ${user.fullName}?`
      : `Bạn có chắc muốn giáng cấp ${user.fullName} xuống USER?`;

    const result = await Swal.fire({
      title: 'Xác nhận đổi quyền',
      text: confirmMsg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${API_BASE_URL}/admin/users/${user.id}/role`, { role: newRole });
        Swal.fire('Thành công!', 'Đã cập nhật quyền tài khoản.', 'success');
        fetchUsers();
      } catch (error) {
        Swal.fire('Lỗi!', 'Không thể cập nhật quyền.', 'error');
      }
    }
  };

  const handleDelete = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có chắc chắn muốn xóa tài khoản ${userName}? Hành động này không thể hoàn tác!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa vĩnh viễn',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
        Swal.fire('Đã xóa!', 'Tài khoản đã bị xóa.', 'success');
        fetchUsers();
      } catch (error) {
        if (error.response && error.response.status === 409) {
          Swal.fire('Từ chối xóa!', error.response.data.message || 'Tài khoản này đã có dữ liệu giao dịch.', 'warning');
        } else {
          Swal.fire('Lỗi!', 'Không thể xóa tài khoản này.', 'error');
        }
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone || '').includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUserTie className="text-primary" />
            Quản lý Tài khoản
          </h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và cấp quyền cho người dùng hệ thống</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email, sđt..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Tổng cộng: {filteredUsers.length} tài khoản
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Không tìm thấy tài khoản nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Họ Tên</th>
                  <th className="p-4 font-semibold">Liên hệ</th>
                  <th className="p-4 font-semibold">Chi tiêu & Điểm</th>
                  <th className="p-4 font-semibold">Quyền</th>
                  <th className="p-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-medium text-gray-900">#{user.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{user.fullName}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="text-gray-600">{user.email || 'Chưa có'}</div>
                      <div className="text-gray-500 text-xs">{user.phone || 'Chưa có SĐT'}</div>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="text-xs">
                        <span className="text-gray-500">Đã chi: </span>
                        <span className="font-bold text-[#C92127]">{(user.totalSpent || 0).toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div className="text-xs flex gap-2">
                        <span><span className="text-gray-500">Tích lũy:</span> <span className="font-semibold text-orange-600">{user.accumulatedPoints || 0}</span></span>
                        <span><span className="text-gray-500">Y-Points:</span> <span className="font-semibold text-purple-600">{user.yPoints || 0}</span></span>
                      </div>
                      <div className="mt-1">
                        {(() => {
                           const acc = user.accumulatedPoints || 0;
                           let rank = { name: 'Thành viên Đồng', bg: 'bg-orange-100', text: 'text-orange-800' };
                           if (user.role === 'ADMIN' || acc >= 100000) rank = { name: 'Thành viên Kim Cương', bg: 'bg-gray-800', text: 'text-yellow-500' };
                           else if (acc >= 50000) rank = { name: 'Thành viên Vàng', bg: 'bg-yellow-100', text: 'text-yellow-700' };
                           else if (acc >= 20000) rank = { name: 'Thành viên Bạc', bg: 'bg-gray-200', text: 'text-gray-700' };
                           return (
                             <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${rank.bg} ${rank.text}`}>
                               {rank.name}
                             </span>
                           );
                        })()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'ADMIN' ? <FaUserShield /> : <FaUser />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(user)}
                          title="Đổi quyền"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaUserShield />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.fullName)}
                          title="Xóa tài khoản"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </div>
  );
}
