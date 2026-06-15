import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaMapMarkerAlt, FaPhoneAlt, FaRegFileAlt, FaCreditCard, FaTruck, FaArrowLeft } from 'react-icons/fa';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const cartTotal = getCartTotal();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingFee, setShippingFee] = useState(30000); // Mặc định Giao hàng tiêu chuẩn: 30k
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    if (user) {
      setName(user.fullName || '');
      setPhone(user.phoneNumber || '');
      setAddress(user.address || '');
    }
  }, [user, cart, navigate]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/coupons/validate`, {
        params: {
          code: couponCode.trim(),
          amount: cartTotal
        }
      });
      if (res.data.valid) {
        setAppliedCoupon(res.data.coupon);
        setDiscountAmount(res.data.discountAmount);
        Swal.fire({
          icon: 'success',
          title: 'Áp dụng thành công!',
          text: `Bạn được giảm ${res.data.discountAmount.toLocaleString('vi-VN')} đ`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        setCouponError(res.data.message || 'Mã giảm giá không hợp lệ.');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Lỗi kiểm tra mã giảm giá.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      return Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ nhận hàng.',
        confirmButtonColor: '#3085d6'
      });
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        bookId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderBody = {
        items,
        shippingAddress: address,
        phoneNumber: phone,
        paymentMethod,
        shippingFee,
        customerNote: note,
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await axios.post(`${API_BASE_URL}/orders`, orderBody);

      if (res.data.id) {
        Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          text: 'Đơn hàng của bạn đã được ghi nhận và đang chuẩn bị giao.',
          confirmButtonColor: '#10B981'
        }).then(() => {
          clearCart();
          navigate('/orders');
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Đặt hàng thất bại',
        text: error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartTotal + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm font-medium">
            <FaArrowLeft /> Quay lại giỏ hàng
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-wide">Tiến Hành Thanh Toán</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Billing Form */}
          <div className="flex-1 space-y-6">
              
              {/* Shipping Address Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <FaMapMarkerAlt className="text-primary" /> Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên người nhận *</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên người nhận hàng"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                      <input 
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại liên hệ"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phương thức vận chuyển</label>
                      <div className="relative">
                        <select 
                          value={shippingFee}
                          onChange={(e) => setShippingFee(Number(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none transition-shadow bg-white"
                        >
                          <option value={30000}>Tiêu chuẩn (GHN/GHTK) - 30,000 đ</option>
                          <option value={50000}>Hỏa tốc (Grab/AhaMove) - 50,000 đ</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <FaTruck />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ nhận hàng *</label>
                    <textarea 
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú giao hàng</label>
                    <textarea 
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Lưu ý cho shipper (ví dụ: giao giờ hành chính, gọi trước khi giao...)"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                  <FaCreditCard className="text-primary" /> Phương thức thanh toán
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-purple-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 accent-primary" 
                    />
                    <div>
                      <span className="font-bold text-gray-800 block">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-xs text-gray-500 mt-0.5 block">Thanh toán tiền mặt cho shipper khi nhận được hàng</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'border-primary bg-purple-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="BANK_TRANSFER" 
                      checked={paymentMethod === 'BANK_TRANSFER'}
                      onChange={() => setPaymentMethod('BANK_TRANSFER')}
                      className="mt-1 accent-primary" 
                    />
                    <div>
                      <span className="font-bold text-gray-800 block">Chuyển khoản Ngân hàng</span>
                      <span className="text-xs text-gray-500 mt-0.5 block">Chuyển khoản qua số tài khoản hoặc quét mã QR ngân hàng</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'MOMO' ? 'border-primary bg-purple-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="MOMO" 
                      checked={paymentMethod === 'MOMO'}
                      onChange={() => setPaymentMethod('MOMO')}
                      className="mt-1 accent-primary" 
                    />
                    <div>
                      <span className="font-bold text-gray-800 block">Ví điện tử MoMo</span>
                      <span className="text-xs text-gray-500 mt-0.5 block">Thanh toán nhanh qua ứng dụng MoMo bằng quét mã QR</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'ZALOPAY' ? 'border-primary bg-purple-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="ZALOPAY" 
                      checked={paymentMethod === 'ZALOPAY'}
                      onChange={() => setPaymentMethod('ZALOPAY')}
                      className="mt-1 accent-primary" 
                    />
                    <div>
                      <span className="font-bold text-gray-800 block">Ví điện tử ZaloPay</span>
                      <span className="text-xs text-gray-500 mt-0.5 block">Thanh toán an toàn, bảo mật qua ví điện tử ZaloPay</span>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="mt-5 p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn">
                    <div className="flex-1 space-y-2 text-sm text-gray-700">
                      <div className="font-bold text-gray-800 text-base mb-1">Thông tin chuyển khoản:</div>
                      <div>Ngân hàng: <strong>Vietcombank (VCB)</strong></div>
                      <div>Số tài khoản: <strong>1234567890</strong></div>
                      <div>Chủ tài khoản: <strong>CONG TY CP GRAPE BOOK</strong></div>
                      <div>Nội dung chuyển khoản: <strong>THANH TOAN {user?.email?.split('@')[0] || 'KH'}</strong></div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">Mẹo: Quét mã QR bên cạnh bằng ứng dụng ngân hàng để tự động nhập thông tin và số tiền.</div>
                    </div>
                    <div className="w-36 h-36 bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                      <img src={`https://img.vietqr.io/image/vcb-1234567890-compact2.png?amount=${totalAmount}&addInfo=THANH%20TOAN%20${encodeURIComponent(user?.email?.split('@')[0] || 'KH')}&accountName=CONG%20TY%20CP%20GRAPE%20BOOK`} alt="Mã QR Chuyển Khoản" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'MOMO' && (
                  <div className="mt-5 p-5 bg-pink-50/30 rounded-xl border border-pink-100 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn">
                    <div className="flex-1 space-y-2 text-sm text-gray-700">
                      <div className="font-bold text-pink-700 text-base mb-1">Thanh toán qua Ví MoMo:</div>
                      <div>Số điện thoại ví: <strong>0987654321</strong></div>
                      <div>Tên người nhận: <strong>CONG TY CP GRAPE BOOK</strong></div>
                      <div>Nội dung chuyển tiền: <strong>MOMO {user?.email?.split('@')[0] || 'KH'}</strong></div>
                      <div className="text-xs text-gray-500 italic mt-2 font-medium">Mở ứng dụng MoMo và quét mã VietQR bên cạnh để thanh toán tự động với số tiền chính xác.</div>
                    </div>
                    <div className="w-36 h-36 bg-white p-2 rounded-lg border border-pink-200 flex items-center justify-center shrink-0">
                      <img src={`https://img.vietqr.io/image/vcb-1234567890-compact2.png?amount=${totalAmount}&addInfo=MOMO%20${encodeURIComponent(user?.email?.split('@')[0] || 'KH')}&accountName=CONG%20TY%20CP%20GRAPE%20BOOK`} alt="Mã QR MoMo" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'ZALOPAY' && (
                  <div className="mt-5 p-5 bg-blue-50/30 rounded-xl border border-blue-100 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn">
                    <div className="flex-1 space-y-2 text-sm text-gray-700">
                      <div className="font-bold text-blue-700 text-base mb-1">Thanh toán qua Ví ZaloPay:</div>
                      <div>Số điện thoại ví: <strong>0987654321</strong></div>
                      <div>Tên người nhận: <strong>CONG TY CP GRAPE BOOK</strong></div>
                      <div>Nội dung chuyển tiền: <strong>ZALOPAY {user?.email?.split('@')[0] || 'KH'}</strong></div>
                      <div className="text-xs text-gray-500 italic mt-2 font-medium">Mở ứng dụng ZaloPay (hoặc Zalo) và quét mã VietQR bên cạnh để thanh toán tiện lợi.</div>
                    </div>
                    <div className="w-36 h-36 bg-white p-2 rounded-lg border border-blue-200 flex items-center justify-center shrink-0">
                      <img src={`https://img.vietqr.io/image/vcb-1234567890-compact2.png?amount=${totalAmount}&addInfo=ZALOPAY%20${encodeURIComponent(user?.email?.split('@')[0] || 'KH')}&accountName=CONG%20TY%20CP%20GRAPE%20BOOK`} alt="Mã QR ZaloPay" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
                <FaRegFileAlt className="text-primary" /> Tóm tắt đơn hàng
              </h2>
              
              {/* Items List */}
              <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto mb-5 pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 items-center">
                    <img src={item.img} alt={item.title} className="w-12 h-16 object-cover rounded bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">{item.title}</h4>
                      <div className="text-xs text-gray-400 mt-0.5">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="border-t border-gray-50 pt-4 mb-4 text-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mã giảm giá</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 text-green-700 p-2.5 rounded-lg border border-green-200">
                    <span className="font-bold font-mono text-sm uppercase">{appliedCoupon.code}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                      <button type="button" onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 font-bold">Xóa</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary uppercase font-mono"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                      className="bg-primary text-white hover:bg-primary-light px-4 py-2 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      {validatingCoupon ? 'Đang check...' : 'ÁP DỤNG'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-xs mt-1 font-medium">{couponError}</p>}
              </div>

              {/* Calc details */}
              <div className="space-y-3 border-t border-gray-50 pt-4 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tiền sách:</span>
                  <span className="font-medium">{cartTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span className="font-medium">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium">{shippingFee.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-800 font-bold text-base border-t border-gray-100 pt-3">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary">{(cartTotal - discountAmount + shippingFee).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Đang tạo đơn hàng...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
