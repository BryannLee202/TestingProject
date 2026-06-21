import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBolt, FaChevronRight, FaStar } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function FlashSale() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 55 });
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortOrder, setSortOrder] = useState('none');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDiscountedBooks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/books/discounted`);
        setBooks(res.data || []);
      } catch (error) {
        console.error('Error fetching discounted books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountedBooks();
  }, []);

  useEffect(() => {
    let result = [...books];
    if (minDiscount > 0) {
      result = result.filter(b => b.discount >= minDiscount);
    }
    if (sortOrder === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'discountDesc') {
      result.sort((a, b) => b.discount - a.discount);
    }
    setFilteredBooks(result);
  }, [books, minDiscount, sortOrder]);

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <div className="bg-gray-100 min-h-screen pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Flash Sale</span>
        </div>

        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#C92127] via-[#8B0000] to-[#1a1a1a] rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-100px] left-[-50px] w-[250px] h-[250px] bg-red-500/30 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-100px] right-20 w-[250px] h-[250px] bg-red-500/20 rounded-full blur-[80px]"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(250,204,21,0.3)] border border-white/10 animate-pulse">
              ⚡
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 uppercase tracking-wider drop-shadow-sm">
                Flash Sale Giờ Vàng
              </h1>
              <p className="text-gray-300 font-medium text-sm md:text-base mt-1">Khuyến mãi cực sốc, số lượng giới hạn!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10 bg-black/30 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Kết thúc sau:</span>
            <div className="flex items-center gap-1.5 font-mono text-xl font-bold">
              <span className="bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 shadow-inner leading-none">{formatTime(timeLeft.hours)}</span>
              <span className="text-white/80 font-black animate-pulse pb-1">:</span>
              <span className="bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 shadow-inner leading-none">{formatTime(timeLeft.minutes)}</span>
              <span className="text-white/80 font-black animate-pulse pb-1">:</span>
              <span className="bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 shadow-inner leading-none">{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Column: Filters */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 uppercase mb-4 pb-2 border-b">Bộ lọc ưu đãi</h3>
              
              {/* Discount Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Mức giảm giá</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  {[
                    { label: 'Tất cả mức giảm', value: 0 },
                    { label: 'Từ 20% trở lên', value: 20 },
                    { label: 'Từ 30% trở lên', value: 30 }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="discountOpt"
                        checked={minDiscount === opt.value}
                        onChange={() => setMinDiscount(opt.value)}
                        className="text-primary focus:ring-primary border-gray-300 w-4 h-4" 
                      />
                      <span className={minDiscount === opt.value ? 'text-gray-900 font-semibold' : ''}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-sm">Sắp xếp theo</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  {[
                    { label: 'Mặc định', value: 'none' },
                    { label: 'Giá thấp đến cao', value: 'asc' },
                    { label: 'Giá cao đến thấp', value: 'desc' },
                    { label: 'Giảm giá nhiều nhất', value: 'discountDesc' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="sortOpt"
                        checked={sortOrder === opt.value}
                        onChange={() => setSortOrder(opt.value)}
                        className="text-primary focus:ring-primary border-gray-300 w-4 h-4" 
                      />
                      <span className={sortOrder === opt.value ? 'text-gray-900 font-semibold' : ''}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Book Grid */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 min-h-[400px]">
              
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBooks.map((product) => {
                    const salesCount = product.salesCount || 0;
                    const stockQuantity = product.stockQuantity || 0;
                    const total = salesCount + stockQuantity;
                    const soldPercent = total > 0 ? Math.floor((salesCount / total) * 100) : 0;

                    return (
                      <Link 
                        key={product.id}
                        to={`/book/${product.id}`}
                        className="flex flex-col bg-white p-3 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer relative"
                      >
                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-[#C92127] to-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-tl-lg rounded-br-lg shadow-md border border-red-400/30 tracking-wide">
                            -{product.discount}%
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className="relative pt-[100%] mb-3 overflow-hidden rounded-lg bg-gray-50">
                          <img 
                            src={product.imageUrl || 'https://placehold.co/150'} 
                            alt={product.title} 
                            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2" 
                          />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 min-h-[40px] leading-snug group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                        
                        {/* Price */}
                        <div className="mt-auto pt-2">
                          <div className="flex flex-col mb-3">
                            <span className="text-[#C92127] font-bold text-base sm:text-lg leading-none mb-1">
                              {product.price.toLocaleString('vi-VN')} đ
                            </span>
                            {product.oldPrice > 0 && (
                              <span className="text-gray-400 text-[10px] sm:text-[11px] font-medium line-through">
                                {product.oldPrice.toLocaleString('vi-VN')} đ
                              </span>
                            )}
                          </div>
                          
                          {/* Modern Progress Bar */}
                          <div className="relative w-full h-[18px] bg-[#ffe0e0] rounded-full overflow-hidden flex items-center mt-2 border border-[#ffb3b3]">
                            <div 
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff6b6b] to-[#C92127] transition-all duration-1000 ease-out" 
                              style={{ width: `${Math.max(8, soldPercent)}%` }}
                            ></div>

                            
                            <div className="absolute inset-0 flex items-center justify-center gap-1 z-10">
                              {soldPercent >= 80 ? (
                                <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] flex items-center gap-1 tracking-wider uppercase">
                                  🔥 Sắp cháy hàng
                                </span>
                              ) : (
                                <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide uppercase">
                                  Đã bán {soldPercent}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 text-gray-500">
                  Không tìm thấy sản phẩm giảm giá nào phù hợp với bộ lọc.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
