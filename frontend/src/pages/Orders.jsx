import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';
import { FaStore, FaCommentDots, FaBoxOpen, FaSearch } from 'react-icons/fa';

export default function Orders({ embedded = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders`);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải đơn hàng',
        text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const getStatusText = (status, shippingStatus, paymentMethod) => {
    if (status === 'RETURNED') return 'YÊU CẦU TRẢ HÀNG';
    if (status === 'REFUNDED') return 'ĐÃ HOÀN TIỀN';
    if (status === 'COMPLETED') return 'HOÀN THÀNH';
    if (status === 'CANCELLED') return 'ĐÃ HỦY';
    if (shippingStatus === 'SHIPPING') return 'ĐANG VẬN CHUYỂN';
    if (status === 'PENDING_PAYMENT') return 'CHỜ THANH TOÁN';
    if (status === 'PENDING' || status === 'PROCESSING') return 'CHỜ GIAO HÀNG';
    return status;
  };

  const filteredOrders = orders.filter(order => {
    // Filter by tab
    let tabMatch = true;
    if (activeTab === 'PENDING') {
      tabMatch = order.status === 'PENDING_PAYMENT';
    } else if (activeTab === 'SHIPPING') {
      tabMatch = order.shippingStatus === 'SHIPPING' || (order.shippingStatus === 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'RETURNED' && order.status !== 'REFUNDED');
    } else if (activeTab === 'PROCESSING') {
      tabMatch = (order.status === 'PROCESSING' || order.status === 'PENDING') && order.shippingStatus !== 'SHIPPING';
    } else if (activeTab === 'COMPLETED') {
      tabMatch = order.status === 'COMPLETED';
    } else if (activeTab === 'CANCELLED') {
      tabMatch = order.status === 'CANCELLED';
    } else if (activeTab === 'RETURN') {
      tabMatch = order.status === 'RETURNED' || order.shippingStatus === 'RETURNED' || order.status === 'REFUNDED';
    }

    // Filter by search term
    let searchMatch = true;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchId = String(order.id).toLowerCase().includes(lowerSearch);
      const matchProduct = order.items?.some(item => item.book?.title?.toLowerCase().includes(lowerSearch));
      searchMatch = matchId || matchProduct;
    }

    return tabMatch && searchMatch;
  }).sort((a, b) => {
    // Ưu tiên đơn hàng vừa thanh toán xong (PROCESSING) lên đầu
    const aIsNew = a.status === 'PROCESSING' && a.shippingStatus !== 'SHIPPING';
    const bIsNew = b.status === 'PROCESSING' && b.shippingStatus !== 'SHIPPING';
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;
    // Còn lại sắp xếp theo ID mới nhất
    return b.id - a.id;
  });

  const handleCancel = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Hủy Đơn Hàng?',
        text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#C92127',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Không'
      });

      if (result.isConfirmed) {
        await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Hủy đơn hàng thành công', 'success');
        fetchOrders();
      }
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể hủy đơn', 'error');
    }
  };

  const handleReturn = async (orderId) => {
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
                    <path d="M28 8H12a4 4 compiled 4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
        // Pass data to backend if supported in the future, for now just call the endpoint
        await axios.put(`${API_BASE_URL}/orders/${orderId}/return`, {
          reason: result.value.reason,
          phone: result.value.phone,
          bank: result.value.bank,
          details: result.value.details
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã gửi yêu cầu trả hàng/hoàn tiền', 'success');
        fetchOrders();
      }
    } catch (error) {
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể gửi yêu cầu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReceived = async (orderId) => {
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
        await axios.put(`${API_BASE_URL}/orders/${orderId}/confirm-received`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire({
          icon: 'success',
          title: 'Cảm ơn bạn!',
          text: 'Xác nhận nhận hàng thành công. Bạn có thể đánh giá sản phẩm hoặc yêu cầu trả hàng nếu cần.',
          confirmButtonColor: '#C92127'
        }).then(() => {
          fetchOrders();
          setActiveTab('COMPLETED');
        });
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async (order) => {
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

  const handlePayment = async (order) => {
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
            fetchOrders();
            setActiveTab('PROCESSING');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getTabCount = (tabId) => {
    return orders.filter(order => {
      if (tabId === 'PENDING') {
        return order.status === 'PENDING_PAYMENT';
      } else if (tabId === 'SHIPPING') {
        return order.shippingStatus === 'SHIPPING' || (order.shippingStatus === 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'RETURNED' && order.status !== 'REFUNDED');
      } else if (tabId === 'PROCESSING') {
        return (order.status === 'PROCESSING' || order.status === 'PENDING') && order.shippingStatus !== 'SHIPPING';
      } else if (tabId === 'COMPLETED') {
        return order.status === 'COMPLETED';
      } else if (tabId === 'CANCELLED') {
        return order.status === 'CANCELLED';
      } else if (tabId === 'RETURN') {
        return order.status === 'RETURNED' || order.shippingStatus === 'RETURNED' || order.status === 'REFUNDED';
      }
      return false;
    }).length;
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-100 pb-12 pt-6"}>
      <div className={embedded ? "px-0" : "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"}>
        
        {/* Shopee-style Tabs */}
        <div className="bg-white flex w-full overflow-x-auto scrollbar-hide mb-4 shadow-sm">
          {[
            { id: 'PENDING', label: 'Chờ thanh toán' },
            { id: 'PROCESSING', label: 'Chờ giao hàng' },
            { id: 'SHIPPING', label: 'Vận chuyển' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
            { id: 'RETURN', label: 'Trả hàng/Hoàn tiền' }
          ].map(tab => {
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex-shrink-0 sm:flex-1 py-3 px-3 sm:px-2 text-xs sm:text-sm text-center transition-colors relative ${
                  activeTab === tab.id 
                    ? 'text-primary font-medium' 
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {tab.label} {count > 0 && `(${count})`}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded shadow-sm flex items-center px-3 py-2.5 mb-4 border border-gray-200 focus-within:border-primary transition-colors">
          <FaSearch className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo ID đơn hàng hoặc tên sản phẩm"
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaBoxOpen className="text-5xl" />
            </div>
            <h2 className="text-lg text-gray-700 mb-2">Chưa có đơn hàng</h2>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
                
                {/* Order Header (Shop Info & Status) */}
                <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-3 mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">Yêu thích</span>
                    <span className="font-bold text-gray-800 text-sm">YiYi Book</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {order.shippingStatus === 'DELIVERED' && (
                      <span className="text-teal-600 flex items-center gap-1 border-r border-gray-300 pr-2 mr-1">
                         <span className="text-base leading-none">🚚</span> <span className="hidden sm:inline">Giao hàng thành công</span>
                      </span>
                    )}
                    <span className="text-primary font-medium uppercase">
                      {getStatusText(order.status, order.shippingStatus, order.paymentMethod)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <Link to={`/book/${item.book?.id}`} key={index} className="flex gap-3 items-start hover:bg-gray-50 p-2 -mx-2 rounded transition-colors">
                      <div className="w-16 h-20 sm:w-20 sm:h-24 border border-gray-200 shrink-0 bg-white p-1 rounded">
                        <img 
                          src={item.book?.imageUrl || 'https://via.placeholder.com/80'} 
                          alt={item.book?.title} 
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base text-gray-800 font-medium line-clamp-2">{item.book?.title}</h3>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">Phân loại hàng: Sách in</div>
                        <div className="text-xs sm:text-sm text-gray-700 mt-1">x{item.quantity}</div>
                      </div>
                      <div className="text-right flex flex-col justify-center min-w-[70px]">
                        {item.book?.oldPrice && item.book.oldPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">
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

                {/* Order Total */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-end items-center bg-orange-50/30 -mx-5 px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Thành tiền:</span>
                    <span className="text-2xl font-medium text-primary">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Order Status Message */}
                <div className="text-xs text-gray-500 pt-4">
                  {order.status === 'COMPLETED' ? 'Đánh giá sản phẩm trước để nhận Thưởng Xu' : 
                   order.status === 'RETURNED' ? 'Đơn hàng đang được yêu cầu trả hàng/hoàn tiền' : 
                   order.status === 'REFUNDED' ? 'Đơn hàng đã được xử lý hoàn tiền thành công' : 
                   order.status === 'CANCELLED' ? 'Đơn hàng đã hủy' : 
                   'Vui lòng kiểm tra kỹ tình trạng hàng hóa'}
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap justify-end items-center pt-4 gap-2">
                    {order.status === 'COMPLETED' ? (
                      <>
                        <button onClick={() => navigate(`/book/${order.items[0]?.book?.id}#reviews`)} className="bg-primary text-white border border-primary px-4 sm:px-8 py-2 text-xs sm:text-sm rounded hover:bg-primary-light transition-colors">
                          Đánh Giá
                        </button>
                        <button onClick={() => handleReturn(order.id)} className="bg-white text-primary border border-primary px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-red-50 transition-colors">
                          Trả Hàng/Hoàn Tiền
                        </button>
                        <button onClick={(() => handleBuyAgain(order))} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-gray-50 transition-colors">
                          Mua Lại
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : order.status === 'PENDING_PAYMENT' ? (
                      <>
                        <button onClick={() => handlePayment(order)} className="bg-primary text-white border border-primary px-4 sm:px-8 py-2 text-xs sm:text-sm rounded hover:bg-primary-light transition-colors">
                          Thanh Toán Ngay
                        </button>
                        <button onClick={() => handleCancel(order.id)} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-gray-50 transition-colors">
                          Hủy Đơn Hàng
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : order.status === 'CANCELLED' || order.status === 'RETURNED' || order.status === 'REFUNDED' ? (
                      <>
                        <button onClick={(() => handleBuyAgain(order))} className="bg-primary text-white border border-primary px-4 sm:px-8 py-2 text-xs sm:text-sm rounded hover:bg-primary-light transition-colors">
                          Mua Lại
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : (
                      <>
                        <button 
                          disabled={order.shippingStatus !== 'DELIVERED'}
                          onClick={() => handleReceived(order.id)} 
                          className={`border px-4 sm:px-8 py-2 text-xs sm:text-sm rounded transition-colors ${order.shippingStatus === 'DELIVERED' ? 'bg-primary text-white border-primary hover:bg-primary-light' : 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'}`}
                        >
                          Đã Nhận Được Hàng
                        </button>
                        {order.shippingStatus === 'PENDING' && (
                          <button onClick={() => handleCancel(order.id)} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded hover:bg-gray-50 transition-colors">
                            Hủy Đơn Hàng
                          </button>
                        )}
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center rounded hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
