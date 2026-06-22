import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaBoxOpen, FaEye, FaCalendarAlt, FaCreditCard, FaTruck, FaMoneyBillWave } from 'react-icons/fa';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

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

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPING': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ duyệt';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const getShippingStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ chuẩn bị';
      case 'PROCESSING': return 'Đang đóng gói';
      case 'SHIPPING': return 'Đang vận chuyển';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'CANCELLED': return 'Đã hủy giao';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return order.status === 'PENDING' || order.status === 'PENDING_PAYMENT';
    if (activeTab === 'PROCESSING') return order.status === 'PROCESSING';
    if (activeTab === 'SHIPPED') return order.status === 'SHIPPED' || order.shippingStatus === 'SHIPPING';
    if (activeTab === 'COMPLETED') return order.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 uppercase tracking-wide">Đơn Hàng Của Tôi</h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ xác nhận' },
            { id: 'PROCESSING', label: 'Đang xử lý' },
            { id: 'SHIPPED', label: 'Đang giao' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[350px] border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaBoxOpen className="text-5xl" />
            </div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Bạn chưa có đơn đặt hàng nào</h2>
            <p className="text-gray-400 mb-6 text-center max-w-sm">Mua sắm ngay hôm nay để nhận được các ưu đãi hấp dẫn nhất!</p>
            <Link to="/" className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg hover:bg-primary-light transition-colors">
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Mã đơn hàng:</div>
                    <div className="font-bold text-gray-800 text-lg">#GB-{order.id}</div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      Đơn hàng: {getStatusText(order.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.shippingStatus)}`}>
                      Vận chuyển: {getShippingStatusText(order.shippingStatus)}
                    </span>
                  </div>
                </div>

                {/* Order Details Brief */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendarAlt className="text-gray-400 shrink-0" />
                    <div>
                      <span className="block text-xs text-gray-400">Ngày đặt:</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(order.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCreditCard className="text-gray-400 shrink-0" />
                    <div>
                      <span className="block text-xs text-gray-400">Thanh toán:</span>
                      <span className="font-semibold text-gray-800">
                        {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' :
                         order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                         order.paymentMethod === 'MOMO' ? 'Ví MoMo' :
                         order.paymentMethod === 'ZALOPAY' ? 'Ví ZaloPay' : order.paymentMethod || 'Khác'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaTruck className="text-gray-400 shrink-0" />
                    <div>
                      <span className="block text-xs text-gray-400">Đối tác:</span>
                      <span className="font-semibold text-gray-800">
                        {order.shippingPartner || 'Chờ xác nhận'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaMoneyBillWave className="text-gray-400 shrink-0" />
                    <div>
                      <span className="block text-xs text-gray-400">Tổng thanh toán:</span>
                      <span className="font-bold text-primary text-base">
                        {order.totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <div className="text-xs text-gray-400">
                    Số lượng sách: {order.items?.reduce((acc, curr) => acc + curr.quantity, 0) || 0} quyển
                  </div>
                  <Link 
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light border border-primary/20 hover:border-primary/50 py-1.5 px-4 rounded-lg transition-all"
                  >
                    <FaEye /> Xem chi tiết & hóa đơn
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
