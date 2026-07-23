import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/alert';
import { FaGoogle, FaTimes } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: input email, 2: verify otp, 3: new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleSendForgotOtp = async () => {
    if (!forgotEmail) return showNotification('Lỗi', 'Vui lòng nhập Email', 'warning');
    setForgotLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/send-otp`, { phone: forgotEmail, email: forgotEmail });
      showNotification('Thành công', 'Đã gửi mã OTP đến Email của bạn', 'success');
      setForgotStep(2);
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp) return showNotification('Lỗi', 'Vui lòng nhập mã OTP', 'warning');
    setForgotLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/verify-forgot-otp`, { email: forgotEmail, otp: forgotOtp });
      showNotification('Thành công', 'Xác thực OTP thành công', 'success');
      setForgotStep(3);
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Mã OTP không chính xác', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) return showNotification('Lỗi', 'Vui lòng nhập đầy đủ thông tin', 'warning');
    if (newPassword !== confirmNewPassword) return showNotification('Lỗi', 'Mật khẩu xác nhận không khớp', 'warning');
    
    setForgotLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { email: forgotEmail, otp: forgotOtp, newPassword });
      showNotification('Thành công', 'Lấy lại mật khẩu thành công. Vui lòng đăng nhập lại.', 'success');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    if (providerName.toUpperCase() === 'GOOGLE') {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();

        const res = await axios.post(`${API_BASE_URL}/auth/social-login`, {
          provider: 'GOOGLE',
          providerId: user.uid,
          email: user.email,
          name: user.displayName,
          token: idToken
        });

        if (res.data.token) {
          login(res.data.user, res.data.token);
          showNotification('Đăng nhập thành công', `Chào mừng ${res.data.user.fullName}!`, 'success');
          navigate('/');
        }
      } catch (error) {
        console.error(error);
        if (error.code === 'auth/popup-closed-by-user') {
          // Người dùng tự đóng popup
          return;
        }
        showNotification('Lỗi', `Đăng nhập Google thất bại: ${error.response?.data?.message || error.message}`, 'error');
      }
    } else {
      showNotification('Thông báo', `Tính năng đăng nhập bằng ${providerName} đang được phát triển`, 'info');
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
            <div className="text-sm">
              <button type="button" onClick={() => setShowForgotModal(true)} className="font-medium text-red-600 hover:text-red-700">Quên mật khẩu?</button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">Hoặc đăng nhập bằng</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => handleSocialLogin('GOOGLE')}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 font-medium text-gray-700 transition-colors"
          >
            <FaGoogle className="text-red-500" /> Google
          </button>
          {/* Apple login is not wired up yet (needs an Apple Developer Program
              account to configure Sign in with Apple in Firebase) — hidden
              until that's set up. */}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản? <Link to="/register" className="font-medium text-red-600 hover:text-red-700">Đăng ký ngay</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative animate-fade-in-up">
            <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FaTimes className="text-xl" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quên mật khẩu</h3>
            
            {forgotStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Vui lòng nhập Email để nhận mã xác thực OTP.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ Email</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" placeholder="Ví dụ: emailcuaban@gmail.com" />
                </div>
                <button onClick={handleSendForgotOtp} disabled={forgotLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                  {forgotLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
              </div>
            )}
            
            {forgotStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Mã OTP đã được gửi đến <span className="font-bold">{forgotEmail}</span>.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 số)</label>
                  <input type="text" maxLength={6} value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none tracking-widest text-center text-lg font-bold" placeholder="• • • • • •" />
                </div>
                <button onClick={handleVerifyForgotOtp} disabled={forgotLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                  {forgotLoading ? 'Đang xác thực...' : 'Tiếp tục'}
                </button>
              </div>
            )}

            {forgotStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Mã OTP hợp lệ! Vui lòng đặt lại mật khẩu mới của bạn.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" placeholder="Nhập mật khẩu mới" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none" placeholder="Nhập lại mật khẩu mới" />
                </div>
                <button onClick={handleResetPassword} disabled={forgotLoading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors">
                  {forgotLoading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
