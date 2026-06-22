import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function MockPaymentGateway() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const method = queryParams.get('method');
  const orderId = queryParams.get('orderId');
  const amount = queryParams.get('amount');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    if (!method || !orderId) {
      navigate('/');
    }
  }, [method, orderId, navigate]);

  const handlePayment = async (isSuccess) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/payment/mock-return`, {
        orderId: orderId,
        success: isSuccess
      });
      // Redirect back to orders with success/fail indicator
      if (isSuccess) {
        navigate('/orders?payment=success');
      } else {
        navigate('/orders?payment=failed');
      }
    } catch (error) {
      console.error('Error confirming mock payment:', error);
      navigate('/orders?payment=error');
    } finally {
      setLoading(false);
    }
  };

  const getTheme = () => {
    if (method === 'MOMO') return { bg: 'bg-pink-500', logo: 'MoMo Sandbox', color: 'text-pink-500' };
    if (method === 'ZALOPAY') return { bg: 'bg-blue-500', logo: 'ZaloPay Sandbox', color: 'text-blue-500' };
    return { bg: 'bg-gray-800', logo: 'Mock Gateway', color: 'text-gray-800' };
  };

  const theme = getTheme();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${theme.bg}`}>
            {method?.charAt(0)}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {theme.logo}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Môi trường thử nghiệm (Không trừ tiền thật)
          </p>
        </div>
        
        <div className="border-t border-b py-4 my-4 border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 font-medium">Mã đơn hàng:</span>
            <span className="text-gray-900 font-bold">#{orderId}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 font-medium">Phương thức:</span>
            <span className={`font-bold ${theme.color}`}>{method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Tổng thanh toán:</span>
            <span className="text-xl font-bold text-red-500">{Number(amount).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handlePayment(true)}
            disabled={loading}
            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white ${theme.bg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.color} transition-all disabled:opacity-50`}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle className="mr-2 text-lg" /> Xác nhận Thanh Toán (Thành công)</>}
          </button>
          
          <button
            onClick={() => handlePayment(false)}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <><FaTimesCircle className="mr-2 text-lg text-red-500" /> Hủy thanh toán (Thất bại)</>}
          </button>
        </div>
      </div>
    </div>
  );
}
