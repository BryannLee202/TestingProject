import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/alert';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (res.data.token) {
        login(res.data.user, res.data.token);
        showNotification('Đăng nhập thành công', `Chào mừng ${res.data.user.fullName}!`, 'success');
        navigate('/');
      }
    } catch (error) {
      showNotification('Đăng nhập thất bại', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng nhập</h2>
          <p className="mt-2 text-sm text-gray-600">Chào mừng bạn trở lại với YiYi Book</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer select-none">
              <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded cursor-pointer" />
              <span className="ml-2 block text-sm text-gray-900 cursor-pointer">Ghi nhớ đăng nhập</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="font-medium text-red-600 hover:text-red-700">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
