import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const total = getCartTotal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (!user) {
      return Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Vui lòng đăng nhập để tiến hành thanh toán.',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#FF0000'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    }

    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 pb-10 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaShoppingCart className="text-6xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn còn trống</h2>
            <p className="text-gray-500 mb-6 text-center">Hãy chọn thêm sản phẩm và quay lại đây nhé!</p>
            <Link 
              to="/" 
              className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-primary-light transition-colors"
            >
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-10 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">GIỎ HÀNG CỦA BẠN</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left: Cart Items */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-center">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-center">Thành tiền</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <Link to={`/book/${item.id}`} className="shrink-0">
                        <img 
                          src={item.image_url || item.img || 'https://placehold.co/100'} 
                          alt={item.title} 
                          className="w-20 h-24 object-contain border border-gray-100 rounded"
                        />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <Link to={`/book/${item.id}`} className="font-semibold text-gray-800 hover:text-primary line-clamp-2 text-sm sm:text-base">
                          {item.title}
                        </Link>
                        {item.author && <span className="text-sm text-gray-500 mt-1">{item.author}</span>}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 text-sm font-medium mt-2 flex items-center gap-1 hover:underline w-fit"
                        >
                          <FaTrash className="text-xs" /> Xóa
                        </button>
                      </div>
                    </div>

                    {/* Unit Price (Hidden on mobile, shown on md+) */}
                    <div className="hidden md:block col-span-2 text-center font-medium text-gray-800">
                      {item.price ? item.price.toLocaleString('vi-VN') : '0'} đ
                    </div>

                    {/* Mobile layout for price and quantity */}
                    <div className="col-span-1 md:hidden flex justify-between items-center mt-2">
                      <div className="font-bold text-primary">
                        {item.price ? item.price.toLocaleString('vi-VN') : '0'} đ
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                      <div className="flex items-center border border-gray-300 rounded bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity}
                          readOnly
                          className="w-10 text-center text-sm font-medium border-x border-gray-300 py-1"
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          <FaPlus className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center mt-2 md:mt-0 font-bold text-primary">
                      <span className="md:hidden text-gray-600 font-medium">Thành tiền: </span>
                      {item.price ? (item.price * item.quantity).toLocaleString('vi-VN') : '0'} đ
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
              <h2 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">THÔNG TIN ĐƠN HÀNG</h2>
              
              <div className="flex justify-between items-center mb-3 text-gray-600">
                <span>Tạm tính ({cart.length} sản phẩm):</span>
                <span className="font-medium text-gray-800">{total.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-gray-600 pb-4 border-b border-gray-100">
                <span>Phí giao hàng:</span>
                <span className="font-medium text-gray-800">Miễn phí</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800">Tổng cộng:</span>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-2xl text-primary">{total.toLocaleString('vi-VN')} đ</span>
                  <span className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT)</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full bg-primary text-white font-bold py-3.5 rounded-md hover:bg-primary-light transition-colors text-center shadow-md shadow-red-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'ĐANG CHUYỂN TRANG...' : 'TIẾN HÀNH THANH TOÁN'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
