import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showNotification } from '../utils/alert';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showNotification('Lỗi', 'Mật khẩu xác nhận không khớp', 'warning');
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password
      });

      if (res.data.token || res.status === 201 || res.status === 200) {
        if (res.data.token && res.data.user) {
          login(res.data.user, res.data.token);
          showNotification('Đăng ký thành công', `Chào mừng ${res.data.user.fullName}!`, 'success');
          navigate('/');
        } else {
          showNotification('Đăng ký thành công', 'Vui lòng đăng nhập để tiếp tục', 'success');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error(error);
      showNotification('Đăng ký thất bại', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng ký</h2>
          <p className="mt-2 text-sm text-gray-600">Tạo tài khoản mới</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Đã có tài khoản? <Link to="/login" className="font-medium text-red-600 hover:text-red-700">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
