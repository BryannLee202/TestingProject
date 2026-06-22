import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { FaChevronLeft, FaReceipt, FaMoneyBillWave, FaTruck, FaBoxOpen, FaStar, FaStore, FaCommentDots } from 'react-icons/fa';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error('Error fetching order detail:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: error.response?.data?.message || 'Không tìm thấy chi tiết đơn hàng.',
          confirmButtonColor: '#EF4444'
        }).then(() => {
          navigate('/orders');
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, user, navigate]);

  const getStatusText = (status, shippingStatus) => {
    if (status === 'COMPLETED') return 'ĐƠN HÀNG ĐÃ HOÀN THÀNH';
    if (status === 'CANCELLED') return 'ĐƠN HÀNG ĐÃ HỦY';
    if (status === 'PENDING' || status === 'PENDING_PAYMENT') return 'ĐƠN HÀNG CHỜ THANH TOÁN';
    if (shippingStatus === 'SHIPPING') return 'ĐƠN HÀNG ĐANG VẬN CHUYỂN';
    if (status === 'PROCESSING') return 'ĐƠN HÀNG CHỜ GIAO';
    return `ĐƠN HÀNG ${status}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Determine current step for stepper
  // Steps: 1: Đặt, 2: Thanh toán, 3: ĐVVC, 4: Nhận hàng, 5: Đánh giá
  let currentStep = 1;
  if (order.status !== 'PENDING' && order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED') currentStep = 2;
  if (order.shippingStatus === 'SHIPPING' || order.shippingStatus === 'DELIVERED') currentStep = 3;
  if (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') currentStep = 4;
  if (order.status === 'COMPLETED') currentStep = 5;

  const handleReceived = async () => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận đã nhận hàng?',
        text: "Bạn đã nhận được đơn hàng này và đồng ý thanh toán?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#26aa99',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đã nhận',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await axios.put(`${API_BASE_URL}/orders/${id}/shipping?status=DELIVERED`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Cảm ơn bạn đã mua sắm tại YiYi Book!', 'success');
        const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
        setOrder(res.data);
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    try {
      setLoading(true);
      for (const item of order.items) {
        await axios.post(`${API_BASE_URL}/cart/items`, {
          bookId: item.book.id,
          quantity: item.quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      navigate('/cart');
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: 'Hủy đơn hàng?',
      text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Vâng, Hủy đơn!',
      cancelButtonText: 'Không'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await axios.put(`${API_BASE_URL}/orders/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Đã hủy!', 'Đơn hàng của bạn đã được hủy.', 'success');
        const res = await axios.get(`${API_BASE_URL}/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        Swal.fire('Lỗi', error.response?.data?.message || 'Không thể hủy đơn hàng', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePayment = async () => {
    const { value: selectedMethod } = await Swal.fire({
      title: 'Chọn phương thức thanh toán',
      input: 'select',
      inputOptions: {
        'VNPAY': 'Thanh toán qua Ví VNPay',
        'MOMO': 'Thanh toán qua Ví MoMo',
        'ZALOPAY': 'Thanh toán qua Ví ZaloPay'
      },
      inputValue: order.paymentMethod !== 'COD' ? order.paymentMethod : 'VNPAY',
      showCancelButton: true,
      confirmButtonText: 'Thanh Toán',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#26aa99'
    });

    if (selectedMethod) {
      try {
        setLoading(true);
        let url = '';
        if (selectedMethod === 'MOMO') {
          const res = await axios.get(`${API_BASE_URL}/payment/momo/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        } else if (selectedMethod === 'ZALOPAY') {
          const res = await axios.get(`${API_BASE_URL}/payment/zalopay/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        } else {
          const res = await axios.get(`${API_BASE_URL}/payment/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        }
        window.location.href = url;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Không thể tạo phiên thanh toán';
        Swal.fire('Lỗi', errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center shadow-sm">
          <Link to="/orders" className="text-gray-500 hover:text-primary flex items-center gap-1 uppercase text-sm font-medium transition-colors">
            <FaChevronLeft /> TRỞ LẠI
          </Link>
          <div className="text-sm font-medium">
            <span className="text-gray-700">MÃ ĐƠN HÀNG. {order.id}</span>
            <span className="text-gray-300 mx-3">|</span>
            <span className="text-primary uppercase font-bold">{getStatusText(order.status, order.shippingStatus)}</span>
          </div>
        </div>

        {/* Stepper */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white p-8 shadow-sm">
            <div className="flex justify-between items-start relative max-w-3xl mx-auto mb-8">
              {/* Line behind circles */}
              <div className="absolute top-7 left-8 right-8 h-1 bg-gray-200 z-0">
                <div 
                  className="h-full bg-[#26aa99] transition-all duration-500" 
                  style={{ width: `${(currentStep - 1) * 25}%` }}
                ></div>
              </div>

              {[
                { icon: <FaReceipt size={24} />, label: 'Đơn Hàng Đã Đặt', time: formatDate(order.createdAt), active: currentStep >= 1 },
                { icon: <FaMoneyBillWave size={24} />, label: 'Đơn Hàng Đã Thanh Toán', time: currentStep >= 2 ? formatDate(order.createdAt) : '', active: currentStep >= 2 },
                { icon: <FaTruck size={24} />, label: 'Đã Giao Cho ĐVVC', time: '', active: currentStep >= 3 },
                { icon: <FaBoxOpen size={24} />, label: 'Đã Nhận Được Hàng', time: '', active: currentStep >= 4 },
                { icon: <FaStar size={24} />, label: 'Đánh Giá', time: '', active: currentStep >= 5 },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center z-10 w-24">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 bg-white mb-3 transition-colors ${step.active ? 'border-[#26aa99] text-[#26aa99]' : 'border-gray-200 text-gray-300'}`}>
                    {step.icon}
                  </div>
                  <div className="text-xs text-center text-gray-700">{step.label}</div>
                  <div className="text-[10px] text-center text-gray-400 mt-1">{step.time}</div>
                </div>
              ))}
            </div>

            {/* Actions below stepper */}
            <div className="bg-[#fffdf8] border border-[#f9ead4] p-4 flex justify-between items-center -mx-8 -mb-8 px-8">
              <div className="text-sm text-gray-600">
                Nếu hàng nhận được có vấn đề, bạn có thể gửi yêu cầu Trả hàng/Hoàn tiền trước <span className="font-medium text-gray-800">23-06-2026</span><br/>
                <span className="text-xs text-gray-500 mt-1 inline-block">🚀 Giao nhanh đúng hẹn: nhận Voucher 15.000đ nếu đơn hàng được giao đến bạn sau ngày dự kiến.</span>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {order.status === 'COMPLETED' ? (
                  <button onClick={() => navigate(`/books/${order.items[0]?.book?.id}`)} className="bg-primary text-white w-full py-2.5 text-sm rounded shadow-sm hover:bg-primary-light transition-colors">
                    Đánh Giá
                  </button>
                ) : (order.status === 'PENDING' || order.status === 'PENDING_PAYMENT') ? (
                  <>
                    <button onClick={handlePayment} className="bg-primary text-white w-full py-2.5 text-sm rounded shadow-sm hover:bg-primary-light transition-colors mb-2">
                      Thanh Toán Ngay
                    </button>
                    <button onClick={handleCancelOrder} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                      Hủy Đơn Hàng
                    </button>
                  </>
                ) : (
                  <button onClick={handleReceived} className="bg-primary text-white w-full py-2.5 text-sm rounded shadow-sm hover:bg-primary-light transition-colors">
                    Đã Nhận Được Hàng
                  </button>
                )}
                {order.status === 'COMPLETED' || order.status === 'CANCELLED' ? (
                  <button onClick={handleBuyAgain} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                    Mua Lại
                  </button>
                ) : (
                  <button onClick={() => Swal.fire('Tính năng đang phát triển', 'Vui lòng liên hệ hotline.', 'info')} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                    Yêu Cầu Trả Hàng/Hoàn Tiền
                  </button>
                )}
                <button onClick={() => Swal.fire('Liên hệ', 'Hotline hỗ trợ: 1900 1234', 'info')} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                  Liên Hệ Người Bán
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address and Tracking */}
        <div className="bg-white p-6 shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden">
          {/* Top striped border like Shopee */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMzAiIGhlaWdodD0iNCIgZmlsbD0ibm9uZSIvPjxwb2x5Z29uIHBvaW50cz0iMCwwIDE1LDAgMCw0IiBmaWxsPSIjZGU1YTVhIi8+PHBvbHlnb24gcG9pbnRzPSIxNSwwIDMwLDAgMTUsNCIgZmlsbD0iIzVjOGFiYyIvPjwvc3ZnPg==')] bg-repeat-x"></div>
          
          <div className="flex-1 md:border-r border-gray-100 md:pr-8">
            <h2 className="text-lg text-gray-800 mb-4 capitalize">Địa Chỉ Nhận Hàng</h2>
            <div className="text-gray-800 font-medium mb-1">{order.user?.fullName || order.shippingAddress?.split(',')[0] || 'Khách hàng'}</div>
            <div className="text-sm text-gray-500 mb-1">(+84) {order.phoneNumber || order.user?.phone || '*** *** ***'}</div>
            <div className="text-sm text-gray-500 leading-relaxed max-w-sm">
              {order.shippingAddress}
            </div>
          </div>

          <div className="flex-1 text-sm text-gray-600">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-800">Thông tin vận chuyển</span>
              <span className="text-gray-500 text-xs uppercase">{order.shippingPartner || 'SPX Express'}</span>
            </div>
            
            <div className="relative pl-6 space-y-4 border-l-2 border-gray-100 ml-2">
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#26aa99] border-4 border-[#e0f3f0]"></div>
                <div className="text-[#26aa99] font-medium">{getStatusText(order.status, order.shippingStatus)}</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</div>
              </div>
              <div className="relative">
                <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="text-gray-600">Đơn hàng đã được đặt</div>
                <div className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">Yêu thích</span>
            <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
              YiYi Book
            </span>
          </div>

          <div className="space-y-4">
            {order.items?.map((item, index) => (
              <div key={index} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="w-20 h-20 border border-gray-200 shrink-0">
                  <img 
                    src={item.book?.imageUrl || 'https://via.placeholder.com/80'} 
                    alt={item.book?.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base text-gray-800 font-medium truncate">{item.book?.title}</h3>
                  <div className="text-sm text-gray-500 mt-1">Phân loại hàng: Sách in</div>
                  <div className="text-sm text-gray-700 mt-1">x{item.quantity}</div>
                </div>
                <div className="text-right flex flex-col justify-center h-20">
                  {item.book?.oldPrice && item.book.oldPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through mr-2">
                      {item.book.oldPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  <span className="text-primary text-sm font-medium">
                    {item.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white shadow-sm flex justify-end p-6">
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center py-2 text-sm text-gray-600">
              <span>Tổng tiền hàng</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm text-gray-600">
              <span>Phí vận chuyển</span>
              <span>{(order.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            {order.shippingCouponCode && (
              <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                <span>Giảm giá phí vận chuyển</span>
                <span>-{(order.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            {(order.discountAmount > 0) && (
              <div className="flex justify-between items-center py-2 text-sm text-gray-600">
                <span>Voucher từ Shop</span>
                <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="flex justify-between items-center py-4 border-t border-gray-100 mt-2">
              <span className="text-sm text-gray-600">Thành tiền</span>
              <span className="text-2xl font-medium text-primary">
                {order.totalAmount?.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Phương thức Thanh toán</span>
              <span className="text-sm text-gray-800">
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 
                 order.paymentMethod === 'VNPAY' ? 'Ví VNPay' : 
                 order.paymentMethod || 'Không xác định'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
