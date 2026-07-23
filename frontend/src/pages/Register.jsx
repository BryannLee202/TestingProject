import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showNotification } from '../utils/alert';
import { useAuth } from '../context/AuthContext';
import { FaGoogle } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

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
        showNotification('Lỗi', `Đăng nhập Google thất bại: ${error.response?.data?.message || error.message}`, 'error');
      }
    } else {
      showNotification('Thông báo', `Tính năng đăng nhập bằng ${providerName} đang phát triển!`, 'info');
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return showNotification('Lỗi', 'Vui lòng nhập số điện thoại', 'warning');
    if (!email) return showNotification('Lỗi', 'Vui lòng nhập email trước', 'warning');
    
    setSendingOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/send-otp`, { phone, email });
      setOtpSent(true);
      showNotification('Thành công', 'Đã gửi mã xác thực OTP vào Email của bạn!', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Lỗi gửi OTP', error.response?.data?.message || 'Không thể gửi OTP. Hãy thử lại sau.', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showNotification('Lỗi', 'Mật khẩu xác nhận không khớp', 'warning');
    }
    if (!otpSent) {
      return showNotification('Lỗi', 'Vui lòng bấm "Nhận OTP" và kiểm tra Email của bạn', 'warning');
    }
    if (!otp) {
      return showNotification('Lỗi', 'Vui lòng nhập mã OTP 6 số', 'warning');
    }

    setLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone,
        password,
        otp
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
      showNotification('Đăng ký thất bại', error.response?.data?.message || 'Mã OTP không đúng hoặc có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng ký</h2>
          <p className="mt-2 text-sm text-gray-600">Tạo tài khoản bằng Email OTP</p>
        </div>

        <form className="space-y-5" onSubmit={verifyOtpAndRegister}>
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
            <label className="block text-sm font-medium text-gray-700">Email (Dùng để nhận OTP)</label>
            <div className="mt-1 flex gap-2">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary outline-none disabled:bg-gray-100" 
              />
              <button 
                type="button" 
                onClick={handleSendOtp}
                disabled={sendingOtp || !email || !phone}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 whitespace-nowrap transition-colors"
              >
                {sendingOtp ? 'Đang gửi...' : (otpSent ? 'Gửi lại OTP' : 'Nhận OTP')}
              </button>
            </div>
          </div>
          
          {otpSent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã OTP (Kiểm tra Hộp thư hoặc Spam)</label>
              <input 
                type="text" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã 6 số"
                maxLength="6"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 outline-none text-center tracking-[0.5em] font-bold text-lg" 
              />
            </div>
          )}

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

        <div className="mt-6 flex items-center justify-center space-x-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500">Hoặc đăng ký bằng</span>
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
          Đã có tài khoản? <Link to="/login" className="font-medium text-red-600 hover:text-red-700">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
