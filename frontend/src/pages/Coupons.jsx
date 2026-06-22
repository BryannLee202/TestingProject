import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTicketAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { showNotification } from '../utils/alert';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [couponHistory, setCouponHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const [availableRes, historyRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/coupons`, { headers }),
          token ? axios.get(`${API_BASE_URL}/coupons/history`, { headers }).catch(() => ({data: []})) : Promise.resolve({data: []})
        ]);
        
        setCoupons(availableRes.data || []);
        setCouponHistory(historyRes.data || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleUse = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    // Save to local storage for Cart to auto apply
    localStorage.setItem('autoApplyCoupon', code);
    
    showNotification('Thành công', `Đã lưu mã "${code}". Chuyển đến giỏ hàng...`, 'success');

    setTimeout(() => {
      setCopiedCode('');
      navigate('/cart');
    }, 800);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Vô thời hạn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-12 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Mã Giảm Giá</span>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md mb-6 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-3xl">
            🎟️
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide">Kho Voucher Khuyến Mãi</h1>
            <p className="text-purple-100 text-sm mt-1">Lấy mã ngay, mua sắm tiết kiệm cùng YiYi Book!</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            className={`py-3 px-6 font-semibold text-sm ${activeTab === 'available' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('available')}
          >
            Mã Có Thể Dùng
          </button>
          <button 
            className={`py-3 px-6 font-semibold text-sm ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('history')}
          >
            Lịch Sử Sử Dụng
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === 'available' ? (
          coupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex relative hover:shadow-md transition-shadow"
                >
                  {/* Left Side: Badge */}
                  <div className="w-24 bg-gradient-to-br from-primary to-red-500 text-white flex flex-col items-center justify-center p-3 text-center shrink-0">
                    <span className="text-2xl mb-1"><FaTicketAlt /></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ưu đãi</span>
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between pr-24">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-snug">
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `Giảm ${coupon.discountValue}% tổng đơn hàng${coupon.maxDiscountAmount > 0 ? ` (Tối đa ${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ)` : ''}`
                          : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')} đ`
                        }
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Đơn hàng tối thiểu: <span className="font-semibold text-gray-700">{coupon.minOrderAmount.toLocaleString('vi-VN')} đ</span>
                      </p>
                    </div>
                    
                    <div className="text-[10px] text-gray-400 mt-4 border-t border-gray-50 pt-2">
                      Hạn dùng: <span className="font-semibold text-gray-500">{formatDate(coupon.expirationDate)}</span>
                    </div>
                  </div>

                  {/* Copy Button Container */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-mono font-bold bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-200 uppercase">
                      {coupon.code}
                    </span>
                    <button 
                      onClick={() => handleUse(coupon.code)}
                      className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all cursor-pointer ${
                        copiedCode === coupon.code
                          ? 'bg-green-500 text-white'
                          : 'bg-primary text-white hover:bg-primary-dark'
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <><FaCheck /> Đang chuyển...</>
                      ) : (
                        <><FaTicketAlt /> Sử dụng</>
                      )}
                    </button>
                  </div>

                  {/* Decorative border dotted line */}
                  <div className="absolute left-[95px] top-0 bottom-0 border-l border-dashed border-gray-200"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500 border border-gray-100">
              Hiện tại chưa có mã giảm giá nào được phát hành cho bạn.
            </div>
          )
        ) : (
          /* Lịch sử sử dụng Tab */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {couponHistory.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-600">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                    <th className="p-4 font-medium w-40">Thời gian</th>
                    <th className="p-4 font-medium">Mã Voucher</th>
                    <th className="p-4 font-medium">Loại</th>
                    <th className="p-4 font-medium">Trạng thái đơn</th>
                    <th className="p-4 font-medium text-right">Mã Đơn hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {couponHistory.map((h, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 bg-white transition-colors">
                      <td className="p-4 text-xs text-gray-500">{new Date(h.createdAt).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                      <td className="p-4 font-mono font-bold text-gray-800">{h.couponCode}</td>
                      <td className="p-4">{h.type}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          h.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          h.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {h.status === 'COMPLETED' ? 'Hoàn thành' : h.status === 'CANCELLED' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="p-4 text-right">#{h.orderId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-500">
                Bạn chưa sử dụng mã giảm giá nào.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
