import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaCheck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProductDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/books/${id}`);
        if (res.data.success) {
          setBook(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, quantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sách</h2>
        <Link to="/" className="text-primary hover:underline">Quay về trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">{book.title}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
          
          {/* Left: Product Image */}
          <div className="w-full md:w-2/5 lg:w-1/3">
            <div className="border border-gray-100 rounded-lg p-4 flex items-center justify-center bg-white h-auto max-w-sm mx-auto">
              <img 
                src={book.image_url || book.img || 'https://via.placeholder.com/400'} 
                alt={book.title} 
                className="w-full object-contain max-h-[400px]"
              />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full md:w-3/5 lg:w-2/3 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 leading-tight">
              {book.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                Tác giả: <span className="font-bold text-primary">{book.author || 'Đang cập nhật'}</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < (book.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />)}
                <span className="text-gray-500 ml-1">(12 đánh giá)</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                {book.price ? book.price.toLocaleString('vi-VN') : '0'} đ
              </span>
              {book.original_price && (
                <span className="text-gray-400 text-lg line-through mb-1">
                  {book.original_price.toLocaleString('vi-VN')} đ
                </span>
              )}
              {book.original_price && book.price && (
                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded ml-2 mb-1.5">
                  -{Math.round(((book.original_price - book.price) / book.original_price) * 100)}%
                </span>
              )}
            </div>

            {/* Description Preview */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Mô tả ngắn:</h3>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {book.description || 'Chưa có mô tả cho sản phẩm này.'}
              </p>
            </div>

            {/* Quantity & Actions */}
            <div className="mt-auto border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FaMinus className="text-xs" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center text-sm font-medium border-x border-gray-300 py-1 focus:outline-none appearance-none"
                    readOnly
                  />
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {book.stock_quantity > 0 ? (
                    <span className="flex items-center gap-1 text-green-600"><FaCheck /> Còn hàng ({book.stock_quantity})</span>
                  ) : (
                    <span className="text-red-500">Hết hàng</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-primary border border-primary hover:bg-red-100 font-bold py-3 px-6 rounded-md transition-colors"
                >
                  <FaShoppingCart /> Thêm Vào Giỏ Hàng
                </button>
                <button 
                  className="flex-1 bg-primary text-white hover:bg-primary-light font-bold py-3 px-6 rounded-md transition-colors"
                >
                  Mua Ngay
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
