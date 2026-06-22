import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaBox, FaArrowRight, FaHome } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setOrder(res.data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Không tìm thấy thông tin đơn hàng.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-sm text-center">
        <div className="text-red-500 mb-4 flex justify-center">
          <FaCheckCircle size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Đã có lỗi xảy ra</h2>
        <p className="text-gray-600 mb-6">{error || 'Không tìm thấy đơn hàng'}</p>
        <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle size={40} className="text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Cảm ơn bạn đã mua sắm tại YiYi Book. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 text-left max-w-lg mx-auto mb-8 border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="text-gray-500">Mã đơn hàng</div>
            <div className="font-bold text-lg text-gray-900">#{order.id}</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Người nhận:</span>
              <span className="font-medium text-gray-900">{order.user?.fullName || 'Khách hàng'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số điện thoại:</span>
              <span className="font-medium text-gray-900">{order.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phương thức thanh toán:</span>
              <span className="font-medium text-gray-900">{order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng thanh toán:</span>
              <span className="font-bold text-red-600 text-lg">{(order.totalAmount + order.shippingFee - order.discountAmount).toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/orders" 
            className="flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            <FaBox size={20} />
            Quản lý đơn hàng
          </Link>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
          >
            <FaHome size={20} />
            Tiếp tục mua sắm
            <FaArrowRight size={20} />
          </Link>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Bạn sẽ sớm nhận được email xác nhận đơn hàng kèm theo chi tiết.
      </div>
    </div>
  );
};

export default OrderSuccess;
