import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaChevronLeft, FaReceipt, FaMoneyBillWave, FaTruck, FaBoxOpen, FaStar, FaStore, FaCommentDots } from 'react-icons/fa';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchOrderDetail = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
  }, [id, user, navigate]);

  const getStatusText = (status, shippingStatus, paymentMethod) => {
    if (status === 'RETURNED') return 'YÊU CẦU TRẢ HÀNG/HOÀN TIỀN';
    if (status === 'REFUNDED') return 'ĐÃ HOÀN TIỀN';
    if (status === 'COMPLETED') return 'ĐƠN HÀNG ĐÃ HOÀN THÀNH';
    if (status === 'CANCELLED') return 'ĐƠN HÀNG ĐÃ HỦY';
    if (shippingStatus === 'SHIPPING') return 'ĐƠN HÀNG ĐANG VẬN CHUYỂN';
    if (status === 'PENDING_PAYMENT') return 'ĐƠN HÀNG CHỜ THANH TOÁN';
    if (status === 'PENDING' || status === 'PROCESSING') return 'ĐƠN HÀNG CHỜ GIAO';
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
  const isCOD = order.paymentMethod === 'COD';
  let currentStep = 1;
  if (isCOD) {
    // COD steps: 1: Đặt, 2: ĐVVC, 3: Nhận hàng, 4: Thanh toán, 5: Đánh giá
    // When DELIVERED or COMPLETED, Nhận hàng (3) and Thanh toán (4) are both active (currentStep = 4)
    if (order.shippingStatus === 'SHIPPING' || order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') currentStep = 2;
    if (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') currentStep = 4;
    if (order.status === 'COMPLETED') currentStep = 5;
  } else {
    // Normal steps: 1: Đặt, 2: Thanh toán, 3: ĐVVC, 4: Nhận hàng, 5: Đánh giá
    if (order.status !== 'PENDING' && order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED') currentStep = 2;
    if (order.shippingStatus === 'SHIPPING' || order.shippingStatus === 'DELIVERED') currentStep = 3;
    if (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') currentStep = 4;
    if (order.status === 'COMPLETED') currentStep = 5;
  }

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
        await axios.put(`${API_BASE_URL}/orders/${id}/confirm-received`, {}, {
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

  const handleReturn = async () => {
    try {
      const result = await Swal.fire({
        title: 'Yêu cầu Trả hàng/Hoàn tiền',
        html: `
          <div class="text-left text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-md border border-blue-100">
            Vui lòng cung cấp chính xác thông tin để quá trình hoàn tiền được diễn ra nhanh chóng.
          </div>
          <div class="space-y-4 text-left">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lý do trả hàng <span class="text-red-500">*</span></label>
              <select id="return-reason" class="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow bg-white appearance-none">
                <option value="">-- Vui lòng chọn lý do --</option>
                <option value="Sản phẩm bị lỗi/hư hỏng">Sản phẩm bị lỗi/hư hỏng</option>
                <option value="Giao sai sản phẩm">Giao sai sản phẩm</option>
                <option value="Thiếu sản phẩm/phụ kiện">Thiếu sản phẩm/phụ kiện</option>
                <option value="Hàng giả/nhái">Hàng giả/nhái</option>
                <option value="Khác">Lý do khác...</option>
              </select>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span class="text-red-500">*</span></label>
                <input id="return-phone" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="Ví dụ: 0912345678" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ngân hàng nhận hoàn tiền</label>
                <input id="return-bank" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="STK - Tên Ngân Hàng - Tên Chủ TK" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Chi tiết tình trạng hàng hóa</label>
              <textarea id="return-details" class="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="Mô tả cụ thể vấn đề bạn gặp phải..." rows="3"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hình ảnh minh chứng (Tùy chọn)</label>
              <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer bg-gray-50" onclick="document.getElementById('return-file').click()">
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 014 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600 justify-center">
                    <label for="return-file" class="relative cursor-pointer rounded-md font-medium text-primary hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Tải ảnh lên</span>
                      <input id="return-file" name="file-upload" type="file" class="sr-only" accept="image/*">
                    </label>
                    <p class="pl-1">hoặc kéo thả</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF lên đến 10MB</p>
                </div>
              </div>
            </div>
          </div>
        `,
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-xl font-bold text-gray-800',
          actions: 'mt-6',
          confirmButton: 'px-6 py-2.5 rounded-md font-medium text-white shadow-sm',
          cancelButton: 'px-6 py-2.5 rounded-md font-medium text-white shadow-sm'
        },
        width: '600px',
        showCancelButton: true,
        confirmButtonColor: '#C92127',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Gửi yêu cầu',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
          const reason = document.getElementById('return-reason').value;
          const phone = document.getElementById('return-phone').value;
          const bank = document.getElementById('return-bank').value;
          const details = document.getElementById('return-details').value;
          if (!reason) {
            Swal.showValidationMessage('Vui lòng chọn lý do trả hàng');
            return false;
          }
          if (!phone) {
            Swal.showValidationMessage('Vui lòng nhập số điện thoại liên hệ');
            return false;
          }
          return { reason, phone, bank, details };
        }
      });

      if (result.isConfirmed) {
        setLoading(true);
        await axios.put(`${API_BASE_URL}/orders/${id}/return`, {
          reason: result.value.reason,
          phone: result.value.phone,
          bank: result.value.bank,
          details: result.value.details
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã gửi yêu cầu trả hàng/hoàn tiền', 'success');
        fetchOrderDetail(false);
      }
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi yêu cầu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async () => {
    try {
      setLoading(true);
      for (const item of order.items) {
        await addToCart(item.book, item.quantity);
      }
      navigate('/cart');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    let text = "Bạn có chắc chắn muốn hủy đơn hàng này không?";
    
    if (order && order.paymentMethod !== 'COD' && order.status !== 'PENDING_PAYMENT') {
      text = `Đơn hàng đã được thanh toán qua ${order.paymentMethod}. Hệ thống sẽ hoàn lại tiền vào tài khoản ${order.paymentMethod} của bạn. Bạn có chắc chắn muốn hủy?`;
    }

    const result = await Swal.fire({
      title: 'Hủy đơn hàng?',
      text: text,
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
        fetchOrderDetail(false);
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
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
          <label class="pay-label" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#C92127'" onmouseout="if(!document.getElementById('pay-VNPAY').checked)this.style.borderColor='#e5e7eb'">
            <input type="radio" name="payMethod" id="pay-VNPAY" value="VNPAY" style="accent-color:#C92127;width:18px;height:18px" ${order.paymentMethod === 'VNPAY' ? 'checked' : ''} onchange="document.querySelectorAll('.pay-label').forEach(l=>l.style.borderColor='#e5e7eb');this.closest('label').style.borderColor='#C92127'">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <rect width="48" height="32" rx="6" fill="#F2F6FE" stroke="#E2E8F0" stroke-width="1"/>
              <text x="24" y="20" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="11" text-anchor="middle" letter-spacing="-0.5">
                <tspan fill="#005AAB">VN</tspan><tspan fill="#E02020">PAY</tspan>
              </text>
            </svg>
            <div style="text-align:left">
              <div style="font-weight:600;color:#111">VNPay</div>
              <div style="font-size:12px;color:#6b7280">Thanh toán qua ví VNPay / ATM / QR Code</div>
            </div>
          </label>
          <label class="pay-label" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#C92127'" onmouseout="if(!document.getElementById('pay-MOMO').checked)this.style.borderColor='#e5e7eb'">
            <input type="radio" name="payMethod" id="pay-MOMO" value="MOMO" style="accent-color:#C92127;width:18px;height:18px" ${order.paymentMethod === 'MOMO' ? 'checked' : ''} onchange="document.querySelectorAll('.pay-label').forEach(l=>l.style.borderColor='#e5e7eb');this.closest('label').style.borderColor='#C92127'">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <rect width="48" height="32" rx="6" fill="#A50064"/>
              <text x="24" y="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="12" fill="white" text-anchor="middle">momo</text>
            </svg>
            <div style="text-align:left">
              <div style="font-weight:600;color:#111">MoMo</div>
              <div style="font-size:12px;color:#6b7280">Thanh toán qua ví điện tử MoMo</div>
            </div>
          </label>
          <label class="pay-label" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#C92127'" onmouseout="if(!document.getElementById('pay-ZALOPAY').checked)this.style.borderColor='#e5e7eb'">
            <input type="radio" name="payMethod" id="pay-ZALOPAY" value="ZALOPAY" style="accent-color:#C92127;width:18px;height:18px" ${order.paymentMethod === 'ZALOPAY' ? 'checked' : ''} onchange="document.querySelectorAll('.pay-label').forEach(l=>l.style.borderColor='#e5e7eb');this.closest('label').style.borderColor='#C92127'">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <rect width="48" height="32" rx="6" fill="#0068FF"/>
              <text x="24" y="20" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="11" fill="white" text-anchor="middle" letter-spacing="-0.5">
                <tspan fill="#FFFFFF">Zalo</tspan><tspan fill="#FFE600">Pay</tspan>
              </text>
            </svg>
            <div style="text-align:left">
              <div style="font-weight:600;color:#111">ZaloPay</div>
              <div style="font-size:12px;color:#6b7280">Thanh toán qua ví ZaloPay</div>
            </div>
          </label>
          <label class="pay-label" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border:2px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#C92127'" onmouseout="if(!document.getElementById('pay-COD').checked)this.style.borderColor='#e5e7eb'">
            <input type="radio" name="payMethod" id="pay-COD" value="COD" style="accent-color:#C92127;width:18px;height:18px" ${order.paymentMethod === 'COD' ? 'checked' : ''} onchange="document.querySelectorAll('.pay-label').forEach(l=>l.style.borderColor='#e5e7eb');this.closest('label').style.borderColor='#C92127'">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0;">
              <rect width="48" height="32" rx="6" fill="#E8F5E9" stroke="#C8E6C9" stroke-width="1"/>
              <text x="24" y="22" font-size="18" text-anchor="middle">💵</text>
            </svg>
            <div style="text-align:left">
              <div style="font-weight:600;color:#111">Tiền mặt (COD)</div>
              <div style="font-size:12px;color:#6b7280">Thanh toán khi nhận hàng</div>
            </div>
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Xác nhận thanh toán',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#C92127',
      cancelButtonColor: '#6b7280',
      width: '480px',
      customClass: { popup: 'rounded-2xl' },
      preConfirm: () => {
        const selected = document.querySelector('input[name="payMethod"]:checked');
        if (!selected) { Swal.showValidationMessage('Vui lòng chọn phương thức thanh toán'); return false; }
        return selected.value;
      }
    });

    if (selectedMethod) {
      try {
        setLoading(true);
        // Cập nhật phương thức thanh toán lên backend
        await axios.put(`${API_BASE_URL}/orders/${order.id}/payment-method?method=${selectedMethod}`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (selectedMethod === 'COD') {
          setLoading(false);
          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Đã chuyển sang thanh toán bằng tiền mặt khi nhận hàng (COD).',
            confirmButtonColor: '#C92127'
          }).then(() => {
            fetchOrderDetail(false);
          });
          return;
        }

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
            <span className="text-primary uppercase font-bold">{getStatusText(order.status, order.shippingStatus, order.paymentMethod)}</span>
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

              {(isCOD ? [
                { icon: <FaReceipt size={24} />, label: 'Đơn Hàng Đã Đặt', time: formatDate(order.createdAt), active: currentStep >= 1 },
                { icon: <FaTruck size={24} />, label: 'Đã Giao Cho ĐVVC', time: (order.shippingStatus === 'SHIPPING' || order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') ? formatDate(order.updatedAt) : '', active: currentStep >= 2 },
                { icon: <FaBoxOpen size={24} />, label: 'Đã Nhận Được Hàng', time: (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') ? formatDate(order.updatedAt) : '', active: currentStep >= 3 },
                { icon: <FaMoneyBillWave size={24} />, label: 'Đơn Hàng Đã Thanh Toán', time: (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') ? formatDate(order.updatedAt) : '', active: currentStep >= 4 },
                { icon: <FaStar size={24} />, label: 'Đánh Giá', time: order.status === 'COMPLETED' ? formatDate(order.updatedAt) : '', active: currentStep >= 5 },
              ] : [
                { icon: <FaReceipt size={24} />, label: 'Đơn Hàng Đã Đặt', time: formatDate(order.createdAt), active: currentStep >= 1 },
                { icon: <FaMoneyBillWave size={24} />, label: 'Đơn Hàng Đã Thanh Toán', time: currentStep >= 2 ? formatDate(order.createdAt) : '', active: currentStep >= 2 },
                { icon: <FaTruck size={24} />, label: 'Đã Giao Cho ĐVVC', time: (order.shippingStatus === 'SHIPPING' || order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') ? formatDate(order.updatedAt) : '', active: currentStep >= 3 },
                { icon: <FaBoxOpen size={24} />, label: 'Đã Nhận Được Hàng', time: (order.shippingStatus === 'DELIVERED' || order.status === 'COMPLETED') ? formatDate(order.updatedAt) : '', active: currentStep >= 4 },
                { icon: <FaStar size={24} />, label: 'Đánh Giá', time: order.status === 'COMPLETED' ? formatDate(order.updatedAt) : '', active: currentStep >= 5 },
              ]).map((step, idx) => (
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
                {order.status === 'RETURNED' ? (
                  <span className="font-medium text-amber-600">Yêu cầu Trả hàng/Hoàn tiền đang được chờ người bán xác nhận.</span>
                ) : order.status === 'REFUNDED' ? (
                  <span className="font-medium text-emerald-600">Đơn hàng đã được xử lý hoàn tiền thành công.</span>
                ) : order.status === 'CANCELLED' ? (
                  <span className="font-medium text-red-500">Đơn hàng đã được hủy.</span>
                ) : (
                  <>
                    Nếu hàng nhận được có vấn đề, bạn có thể gửi yêu cầu Trả hàng/Hoàn tiền trước <span className="font-medium text-gray-800">23-06-2026</span><br/>
                    <span className="text-xs text-gray-500 mt-1 inline-block">🚀 Giao nhanh đúng hẹn: nhận Voucher 15.000đ nếu đơn hàng được giao đến bạn sau ngày dự kiến.</span>
                  </>
                )}
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                {order.status === 'COMPLETED' ? (
                  <>
                    <button onClick={() => navigate(`/book/${order.items[0]?.book?.id}#reviews`)} className="bg-primary text-white w-full py-2.5 text-sm rounded shadow-sm hover:bg-primary-light transition-colors">
                      Đánh Giá
                    </button>
                    <button onClick={handleReturn} className="bg-white border border-primary text-primary w-full py-2.5 text-sm rounded shadow-sm hover:bg-red-50 transition-colors">
                      Trả Hàng/Hoàn Tiền
                    </button>
                    <button onClick={handleBuyAgain} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                      Mua Lại
                    </button>
                  </>
                ) : order.status === 'PENDING_PAYMENT' ? (
                  <>
                    <button onClick={handlePayment} className="bg-primary text-white w-full py-2.5 text-sm rounded shadow-sm hover:bg-primary-light transition-colors">
                      Thanh Toán Ngay
                    </button>
                    <button onClick={handleCancelOrder} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                      Hủy Đơn Hàng
                    </button>
                  </>
                ) : order.status === 'CANCELLED' || order.status === 'RETURNED' || order.status === 'REFUNDED' ? (
                  <button onClick={handleBuyAgain} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                    Mua Lại
                  </button>
                ) : (
                  <>
                    <button 
                      disabled={order.shippingStatus !== 'DELIVERED'}
                      onClick={handleReceived} 
                      className={`w-full py-2.5 text-sm rounded shadow-sm transition-colors ${order.shippingStatus === 'DELIVERED' ? 'bg-primary text-white hover:bg-primary-light' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                    >
                      Đã Nhận Được Hàng
                    </button>
                    {order.shippingStatus === 'PENDING' && (
                      <button onClick={handleCancelOrder} className="bg-white border border-gray-300 text-gray-700 w-full py-2.5 text-sm rounded shadow-sm hover:bg-gray-50 transition-colors">
                        Hủy Đơn Hàng
                      </button>
                    )}
                  </>
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
                <div className="text-[#26aa99] font-medium">{getStatusText(order.status, order.shippingStatus, order.paymentMethod)}</div>
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
              <Link to={`/book/${item.book?.id}`} key={index} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 transition-colors">
                <div className="w-20 h-24 border border-gray-200 shrink-0 bg-white p-1 rounded">
                  <img 
                    src={item.book?.imageUrl || 'https://via.placeholder.com/80'} 
                    alt={item.book?.title} 
                    className="w-full h-full object-contain mix-blend-multiply"
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
              </Link>
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
