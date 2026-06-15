import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingCart, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/books/search?keyword=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (error) {
        console.error('Lỗi khi tìm kiếm sách:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Kết quả tìm kiếm cho: <span className="text-primary">"{query}"</span>
        </h1>
        <p className="text-gray-500 mt-2">Tìm thấy {results.length} kết quả phù hợp</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {results.map((book) => (
            <div key={book.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 group flex flex-col">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg">
                <img 
                  src={book.imageUrl || 'https://placehold.co/300x400?text=No+Cover'} 
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {book.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{book.discount}%
                  </div>
                )}
              </div>
              
              <Link to={`/book/${book.id}`} className="font-bold text-gray-800 hover:text-primary transition-colors line-clamp-2 min-h-[40px] mb-1">
                {book.title}
              </Link>
              
              <div className="text-xs text-gray-500 mb-2">{book.author}</div>
              
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-[10px]" />
                ))}
                <span className="text-xs text-gray-400 ml-1">Đã bán {book.salesCount || 0}</span>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-primary font-bold">{formatPrice(book.price)}</span>
                  {book.oldPrice && (
                    <span className="text-xs text-gray-400 line-through mb-0.5">{formatPrice(book.oldPrice)}</span>
                  )}
                </div>
                
                <button 
                  onClick={() => addToCart(book)}
                  className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg transition-colors font-medium text-sm"
                >
                  <FaShoppingCart /> Thêm
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" alt="No results" className="w-48 mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-gray-700 mt-4">Không tìm thấy sản phẩm nào</h3>
          <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác hoặc kiểm tra lỗi chính tả.</p>
          <Link to="/" className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-light transition-colors">
            Về trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}
