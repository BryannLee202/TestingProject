import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaPrint, FaTruck, FaFileInvoice, FaCheckCircle, FaSpinner } from 'react-icons/fa';

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

  const handlePrint = () => {
    window.print();
  };

  const getStepStatus = (currentStatus, stepIndex) => {
    // 0: PENDING, 1: PROCESSING, 2: SHIPPING, 3: DELIVERED
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentStatus === 'CANCELLED') {
      return stepIndex === 0 ? 'cancelled' : 'pending';
    }

    if (currentIndex >= stepIndex) {
      return 'completed';
    } else if (currentIndex + 1 === stepIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6 print:bg-white print:p-0">
      
      {/* CSS print style */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link - Hidden during print */}
        <div className="mb-6 flex justify-between items-center no-print">
          <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm font-medium">
            <FaArrowLeft /> Danh sách đơn hàng
          </Link>
          <button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-5 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-all cursor-pointer"
          >
            <FaPrint /> In hóa đơn
          </button>
        </div>

        {/* Outer Container containing both Stepper and Invoice */}
        <div className="space-y-6">
          
          {/* Stepper Timeline - Hidden during print */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 no-print">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaTruck className="text-primary" /> Trạng thái vận chuyển
            </h3>
            
            {order.status === 'CANCELLED' ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
                Đơn hàng này đã bị hủy.
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                {/* Connector Line for Desktop */}
                <div className="hidden md:block absolute left-8 right-8 top-5 h-0.5 bg-gray-200 z-0">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ 
                      width: order.shippingStatus === 'DELIVERED' ? '100%' : 
                             order.shippingStatus === 'SHIPPING' ? '66%' : 
                             order.shippingStatus === 'PROCESSING' ? '33%' : '0%' 
                    }}
                  ></div>
                </div>

                {/* Step 1: Placed */}
                <div className="flex md:flex-col items-center gap-3 z-10 w-full md:w-auto relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    getStepStatus(order.shippingStatus, 0) === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <div className="text-left md:text-center">
                    <span className="block font-bold text-sm text-gray-800">Đã đặt hàng</span>
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex md:flex-col items-center gap-3 z-10 w-full md:w-auto relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    getStepStatus(order.shippingStatus, 1) === 'completed' ? 'bg-green-500 text-white' :
                    getStepStatus(order.shippingStatus, 1) === 'active' ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <div className="text-left md:text-center">
                    <span className="block font-bold text-sm text-gray-800">Đang chuẩn bị</span>
                    <span className="text-xs text-gray-400">{order.shippingStatus === 'PROCESSING' ? 'Đang chuẩn bị hàng' : 'Hoàn thành'}</span>
                  </div>
                </div>

                {/* Step 3: Shipping */}
                <div className="flex md:flex-col items-center gap-3 z-10 w-full md:w-auto relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    getStepStatus(order.shippingStatus, 2) === 'completed' ? 'bg-green-500 text-white' :
                    getStepStatus(order.shippingStatus, 2) === 'active' ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500'
                  }`}>
                    3
                  </div>
                  <div className="text-left md:text-center">
                    <span className="block font-bold text-sm text-gray-800">Đang vận chuyển</span>
                    <span className="text-xs text-gray-400">
                      {order.shippingPartner ? `${order.shippingPartner}` : 'Chưa giao'}
                    </span>
                    {order.trackingNumber && (
                      <span className="block text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-mono mt-0.5">
                        Mã: {order.trackingNumber}
                      </span>
                    )}
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex md:flex-col items-center gap-3 z-10 w-full md:w-auto relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    order.shippingStatus === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    4
                  </div>
                  <div className="text-left md:text-center">
                    <span className="block font-bold text-sm text-gray-800">Đã giao</span>
                    <span className="text-xs text-gray-400">{order.shippingStatus === 'DELIVERED' ? 'Hoàn thành nhận hàng' : 'Chưa giao tới'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Printable Invoice Container */}
          <div id="printable-invoice" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
            
            {/* Store details & Invoice title */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-primary uppercase">YIYI BOOK</h2>
                <p className="text-xs text-gray-500">Địa chỉ: 123 Đường Láng, Đống Đa, Hà Nội</p>
                <p className="text-xs text-gray-500">Hotline: 1900 1234 | Website: grapebook.com</p>
              </div>
              <div className="text-right space-y-1">
                <h1 className="text-xl font-bold text-gray-800 uppercase flex items-center gap-2 justify-end">
                  <FaFileInvoice className="text-primary no-print" /> HÓA ĐƠN BÁN HÀNG
                </h1>
                <p className="text-sm font-semibold text-gray-800">Mã đơn: <strong>#GB-{order.id}</strong></p>
                <p className="text-xs text-gray-400">
                  Ngày in: {new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Billing details info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6 mb-6 text-sm">
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-800 text-base mb-2">Thông tin khách hàng:</h4>
                <p><span className="text-gray-400">Người nhận:</span> <strong className="text-gray-800">{order.user?.fullName || 'Khách vãng lai'}</strong></p>
                <p><span className="text-gray-400">Số điện thoại:</span> <strong className="text-gray-800">{order.phoneNumber || 'Không có'}</strong></p>
                <p><span className="text-gray-400">Địa chỉ:</span> <span className="text-gray-800">{order.shippingAddress || 'Không có'}</span></p>
              </div>
              <div className="space-y-1.5 md:border-l md:pl-6 border-gray-100">
                <h4 className="font-bold text-gray-800 text-base mb-2">Thông tin thanh toán & vận chuyển:</h4>
                <p><span className="text-gray-400">Phương thức thanh toán:</span> <strong className="text-gray-800">
                  {order.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' :
                   order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                   order.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' :
                   order.paymentMethod === 'ZALOPAY' ? 'Ví điện tử ZaloPay' : order.paymentMethod || 'Khác'}
                </strong></p>
                <p><span className="text-gray-400">Đơn vị vận chuyển:</span> <strong className="text-gray-800">{order.shippingPartner || 'Mặc định'}</strong></p>
                {order.customerNote && (
                  <p><span className="text-gray-400">Ghi chú:</span> <span className="text-gray-600 italic">"{order.customerNote}"</span></p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <th className="p-3">#</th>
                    <th className="p-3">Tên cuốn sách</th>
                    <th className="p-3 text-center">Đơn giá</th>
                    <th className="p-3 text-center">Số lượng</th>
                    <th className="p-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {order.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-medium">{item.book?.title}</td>
                      <td className="p-3 text-center">{item.price.toLocaleString('vi-VN')} đ</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right font-semibold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations and sign off */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-6">
              
              {/* Left signatures (visible during print) */}
              <div className="hidden print:flex flex-col items-center w-48 text-center text-xs space-y-12">
                <div>
                  <span className="block font-bold">Người nhận hàng</span>
                  <span className="text-gray-400 italic">(Ký, ghi rõ họ tên)</span>
                </div>
                <div className="h-12"></div>
              </div>

              <div className="hidden print:flex flex-col items-center w-48 text-center text-xs space-y-12">
                <div>
                  <span className="block font-bold">Người lập hóa đơn</span>
                  <span className="text-gray-400 italic">(Ký, ghi rõ họ tên)</span>
                </div>
                <div className="h-12"><strong>YiYi Book</strong></div>
              </div>

              {/* Right calculations details */}
              <div className="w-full sm:w-80 ml-auto space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng tiền sách:</span>
                  <span className="font-semibold text-gray-800">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-gray-800">{order.shippingFee.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-850 font-bold text-base border-t border-gray-100 pt-3">
                  <span>Tổng hóa đơn:</span>
                  <span className="text-primary text-lg font-black">
                    {order.totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
