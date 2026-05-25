import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-gray-600">Chào mừng bạn trở lại Bookstore</p>
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input type="password" required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded" />
              <label className="ml-2 block text-sm text-gray-900">Ghi nhớ đăng nhập</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-light">Quên mật khẩu?</a>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 rounded-lg transition-colors">
            Đăng nhập
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="font-medium text-primary hover:text-primary-light">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
