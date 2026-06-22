import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const searchParams = location.search; // ?vnp_Amount=...&vnp_BankCode=...
        if (!searchParams) {
          setResult({ status: 'error', message: 'Không có thông tin giao dịch' });
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/payment/vnpay-return${searchParams}`);
        setResult(res.data);
      } catch (error) {
        if (error.response && error.response.data) {
          setResult(error.response.data);
        } else {
          setResult({ status: 'error', message: 'Không thể kết nối đến máy chủ' });
        }
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-primary text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Đang xử lý kết quả giao dịch...</h2>
          <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt</p>
        </div>
      </div>
    );
  }

  const isSuccess = result?.status === 'success';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center transform transition-all animate-fade-in-up">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 mb-8">
              Giao dịch qua VNPay đã hoàn tất. Cảm ơn bạn đã mua sắm tại YiYi Book!
            </p>
            <div className="space-y-3">
              <Link
                to={`/order-success/${result.orderId}`}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
              >
                Xem chi tiết đơn hàng
              </Link>
              <Link
                to="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTimesCircle className="text-5xl text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-500 mb-8">
              {result?.message || 'Giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra.'}
            </p>
            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
              >
                Thử thanh toán lại
              </Link>
              <Link
                to="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
