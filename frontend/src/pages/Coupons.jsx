import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaTicketAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { showNotification } from '../utils/alert';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Coupons() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [couponHistory, setCouponHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null); // For detail modal
  const savedKey = user?.username ? `savedCoupons_${user.username}` : 'savedCoupons';
  
  const [savedCoupons, setSavedCoupons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(savedKey) || '[]');
    } catch (error) {
      console.error('Failed to parse savedCoupons from localStorage:', error);
      return [];
    }
  });

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

  const handleSave = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    
    // Save to local storage for Cart to auto apply if needed, or just to keep it
    localStorage.setItem('autoApplyCoupon', code);

    // Add to savedCoupons array
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
    } catch {
      saved = [];
    }
    
    if (!saved.includes(code)) {
      saved.push(code);
      localStorage.setItem(savedKey, JSON.stringify(saved));
      setSavedCoupons(saved);
    }
    
    showNotification('Thành công', `Đã lưu mã "${code}".`, 'success');

    setTimeout(() => {
      setCopiedCode('');
    }, 2000);
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

        <div className="bg-gradient-to-r from-[#C92127] to-[#e63946] rounded-2xl p-6 text-white shadow-lg mb-6 flex items-center gap-5 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-16 -mb-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white opacity-5 transform -translate-y-1/2"></div>
          
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30 z-10">
            🎟️
          </div>
          <div className="z-10">
            <h1 className="text-2xl font-extrabold uppercase tracking-wide drop-shadow-md">Kho Voucher Khuyến Mãi</h1>
            <p className="text-red-50 text-sm mt-1.5 font-medium opacity-90">Lấy mã ngay, chốt đơn liền tay cùng YiYi Book!</p>
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
                  <div className={`w-24 text-white flex flex-col items-center justify-center p-3 text-center shrink-0 ${coupon.isPartner ? 'bg-gradient-to-br from-orange-500 to-yellow-500' : 'bg-gradient-to-br from-primary to-red-500'}`}>
                    <span className="text-2xl mb-1"><FaTicketAlt /></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                      {coupon.isPartner ? 'Đối tác' : 'Hệ thống'}
                    </span>
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between pr-24">
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-snug">
                        {coupon.discountType === 'PERCENTAGE' 
                          ? `Giảm ${coupon.discountValue || 0}% tổng đơn hàng${coupon.maxDiscountAmount > 0 ? ` (Tối đa ${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ)` : ''}`
                          : `Giảm ${(coupon.discountValue || 0).toLocaleString('vi-VN')} đ`
                        }
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Đơn hàng tối thiểu: <span className="font-semibold text-gray-700">{(coupon.minOrderAmount || 0).toLocaleString('vi-VN')} đ</span>
                      </p>
                      <button 
                        onClick={() => setSelectedCoupon(coupon)}
                        className="text-xs text-[#2489F4] hover:underline mt-1 text-left w-fit"
                      >
                        Chi tiết & Điều kiện
                      </button>
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
                      onClick={() => !savedCoupons.includes(coupon.code) && handleSave(coupon.code)}
                      disabled={savedCoupons.includes(coupon.code)}
                      className={`flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all ${
                        savedCoupons.includes(coupon.code)
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : copiedCode === coupon.code
                          ? 'bg-green-500 text-white cursor-pointer'
                          : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'
                      }`}
                    >
                      {savedCoupons.includes(coupon.code) ? (
                        <><FaCheck /> Đã lưu</>
                      ) : copiedCode === coupon.code ? (
                        <><FaCheck /> Đã lưu</>
                      ) : (
                        <><FaCopy /> Lưu mã</>
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

      {/* Detail Modal */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCoupon(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết Voucher</h3>
              <button 
                onClick={() => setSelectedCoupon(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-600">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Mã Voucher:</span>
                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{selectedCoupon.code}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Phân loại:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${selectedCoupon.isPartner ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedCoupon.isPartner ? 'Voucher Đối Tác' : 'Voucher Hệ Thống (Tất cả)'}
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Mức ưu đãi:</span>
                <span className="font-bold text-green-600 text-right">
                  {selectedCoupon.discountType === 'PERCENTAGE' 
                    ? `Giảm ${selectedCoupon.discountValue || 0}% (Tối đa ${selectedCoupon.maxDiscountAmount ? selectedCoupon.maxDiscountAmount.toLocaleString('vi-VN') + ' đ' : 'Không giới hạn'})`
                    : `Giảm ${(selectedCoupon.discountValue || 0).toLocaleString('vi-VN')} đ`
                  }
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Đơn tối thiểu:</span>
                <span className="font-semibold text-gray-800">{(selectedCoupon.minOrderAmount || 0).toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Hạn sử dụng:</span>
                <span className="font-semibold text-gray-800">{formatDate(selectedCoupon.expirationDate)}</span>
              </div>

              <div className="pt-2">
                <span className="font-bold text-gray-800 block mb-1">Cách sử dụng:</span>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li>Bấm <b>"Lưu mã"</b> để thêm voucher này vào <b>Ví Voucher</b> của bạn.</li>
                  <li>Mã sẽ được tự động áp dụng nếu đơn hàng của bạn thỏa mãn điều kiện khi ở trang <b>Giỏ hàng</b> hoặc <b>Thanh toán</b>.</li>
                  <li>Bạn cũng có thể tự nhập mã <span className="font-mono bg-gray-100 px-1 rounded">{selectedCoupon.code}</span> tại bước thanh toán.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedCoupon(null)}
                className="px-5 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
