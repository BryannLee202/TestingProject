import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { showNotification } from '../utils/alert';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

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
  
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState(null);

  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const handleSendOtp = async () => {
    if (!phone) return showNotification('Lỗi', 'Vui lòng nhập số điện thoại', 'warning');
    
    // Đảm bảo sđt có mã vùng +84
    let targetPhone = phone;
    if (targetPhone.startsWith('0')) {
      targetPhone = '+84' + targetPhone.slice(1);
    } else if (!targetPhone.startsWith('+')) {
      targetPhone = '+' + targetPhone;
    }

    setSendingOtp(true);
    try {
      // Tạo một div hoàn toàn mới để chứa Recaptcha, đảm bảo không bao giờ bị trùng lặp hoặc mất kết nối
      const wrapper = document.getElementById('recaptcha-wrapper');
      const uniqueId = 'recaptcha-' + Date.now();
      wrapper.innerHTML = `<div id="${uniqueId}"></div>`;

      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
        window.recaptchaVerifier = null;
      }
      
      const appVerifier = new RecaptchaVerifier(auth, uniqueId, {
        'size': 'invisible'
      });
      window.recaptchaVerifier = appVerifier;

      const confirmation = await signInWithPhoneNumber(auth, targetPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      showNotification('Thành công', 'Google đã gửi SMS OTP đến máy của bạn', 'success');
    } catch (error) {
      console.error(error);
      let errorMsg = 'Không thể gửi SMS. Hãy kiểm tra lại số điện thoại hoặc thử lại sau.';
      if (error.code === 'auth/billing-not-enabled') errorMsg = 'Chưa bật thanh toán (Billing) trên Firebase.';
      if (error.code === 'auth/invalid-phone-number') errorMsg = 'Số điện thoại không hợp lệ.';
      if (error.code === 'auth/too-many-requests') errorMsg = 'Đã gửi quá nhiều yêu cầu, vui lòng thử lại sau.';
      showNotification('Lỗi gửi SMS', errorMsg + ' Chi tiết: ' + error.message, 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return showNotification('Lỗi', 'Mật khẩu xác nhận không khớp', 'warning');
    }

    setLoading(true);
    
    try {
      let tokenToSubmit = firebaseToken;
      
      // Nếu chưa có token mà đang nhập OTP thì Verify OTP với Google trước
      if (!tokenToSubmit && confirmationResult && otp) {
        const result = await confirmationResult.confirm(otp);
        // OTP đúng -> Lấy ID Token từ Google
        tokenToSubmit = await result.user.getIdToken();
        setFirebaseToken(tokenToSubmit);
      }

      if (!tokenToSubmit) {
        setLoading(false);
        return showNotification('Lỗi', 'Vui lòng xác minh số điện thoại trước!', 'warning');
      }

      // Gửi token lên backend
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        phone, // Backend sẽ dùng số đt thực tế từ Firebase
        password,
        firebaseToken: tokenToSubmit
      });

      if (res.data.token || res.status === 201 || res.status === 200) {
        showNotification('Đăng ký thành công', 'Vui lòng đăng nhập để tiếp tục', 'success');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-verification-code') {
        showNotification('Lỗi xác thực', 'Mã OTP không chính xác!', 'error');
      } else {
        showNotification('Đăng ký thất bại', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng ký</h2>
          <p className="mt-2 text-sm text-gray-600">Tạo tài khoản với Firebase Phone Auth</p>
        </div>
        
        {/* Nơi chứa Recaptcha vô hình */}
        <div id="recaptcha-wrapper"></div>

        <form className="space-y-5" onSubmit={verifyOtpAndRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input 
              type="text" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
            <div className="mt-1 flex gap-2">
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={firebaseToken != null}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary disabled:bg-gray-100" 
              />
              {!firebaseToken && (
                <button 
                  type="button" 
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !phone}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingOtp ? 'Đang gửi...' : (otpSent ? 'Gửi lại' : 'Gửi SMS')}
                </button>
              )}
            </div>
            {firebaseToken && <p className="text-xs text-green-600 mt-1 font-semibold">✓ Đã xác minh số điện thoại</p>}
          </div>
          
          {otpSent && !firebaseToken && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã OTP (Từ Google)</label>
              <input 
                type="text" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã 6 số từ tin nhắn"
                maxLength="6"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary text-center tracking-[0.5em] font-bold" 
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || (!firebaseToken && (!otpSent || !otp))}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
