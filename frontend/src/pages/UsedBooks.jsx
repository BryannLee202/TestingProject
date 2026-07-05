import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FaStar, FaRecycle, FaHistory, FaHandshake } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function UsedBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conditionFilter, setConditionFilter] = useState('all');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // Fetch books from backend
        const res = await axios.get(`${API_BASE_URL}/books`);
        let fetchedBooks = [];
        if (Array.isArray(res.data)) {
          fetchedBooks = res.data;
        } else if (res.data?.success && Array.isArray(res.data.data)) {
          fetchedBooks = res.data.data;
        } else if (res.data && Array.isArray(res.data.content)) {
          fetchedBooks = res.data.content;
        }
        
        // Let's filter some books to represent "used books" by adding condition, price discount
        // We will simulate that books with even IDs or specific category IDs are used books
        const usedBooksSimulated = fetchedBooks.map((book, idx) => {
          // Simulate condition: 95% (like new), 90% (good), 80% (acceptable)
          const conditions = ["Mới 95% (Như mới)", "Mới 90% (Tốt)", "Mới 80% (Khá)"];
          const simulatedCondition = conditions[book.id % conditions.length];
          // Used books are cheaper, so let's adjust price simulated-wise
          const simulatedUsedPrice = Math.floor(book.price * 0.6);
          return {
            ...book,
            condition: simulatedCondition,
            usedPrice: simulatedUsedPrice,
            oldPrice: book.price
          };
        });
        
        setBooks(usedBooksSimulated);
      } catch (error) {
        console.error('Error fetching used books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    let result = [...books];
    if (conditionFilter !== 'all') {
      result = result.filter(b => b.condition.includes(conditionFilter));
    }
    setFilteredBooks(result);
  }, [books, conditionFilter]);

  return (
    <div className="bg-orange-50/20 min-h-screen pb-12 pt-6">
      <Helmet>
        <title>Sách Cũ - Ký Gửi & Sưu Tầm | YiYi Book</title>
        <meta name="description" content="Nhà sách cũ trực tuyến YiYi Book. Mua bán, ký gửi sách đã qua sử dụng, sách cổ, sách sưu tầm giá tốt nhất thị trường." />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Sách cũ ký gửi</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-950 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-50px] right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[70px]"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
              📚
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-amber-100">
                Sách Cũ Ký Gửi & Sưu Tầm
              </h1>
              <p className="text-amber-200 text-sm mt-1">Sách đã qua sử dụng chất lượng tốt, tiết kiệm đến 50% chi phí</p>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
              <FaRecycle className="text-amber-300" />
              <span>Bảo vệ môi trường</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs">
              <FaHandshake className="text-amber-300" />
              <span>Dịch vụ ký gửi sách cũ</span>
            </div>
          </div>
        </div>

        {/* Services Showcase */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 mb-8 grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <FaRecycle className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Mô hình tuần hoàn sách</h3>
              <p className="text-gray-500 text-xs mt-1">Mua lại và tái phân phối sách cũ để nâng cao tuổi thọ của tri thức.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <FaHistory className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Kiểm định chất lượng 3 bước</h3>
              <p className="text-gray-500 text-xs mt-1">Mọi cuốn sách ký gửi đều được khử trùng, làm sạch và đánh giá độ mới minh bạch.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <FaHandshake className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Dịch vụ ký gửi đơn giản</h3>
              <p className="text-gray-500 text-xs mt-1">Mang sách cũ đến YiYi Book để ký gửi nhận tiền hoặc quy đổi sang điểm tích lũy Y-Point.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6 border border-orange-100">
              <h3 className="font-bold text-gray-800 uppercase mb-4 pb-2 border-b">Độ mới của sách</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {[
                  { label: 'Tất cả độ mới', value: 'all' },
                  { label: 'Như mới (95%)', value: '95%' },
                  { label: 'Tốt (90%)', value: '90%' },
                  { label: 'Khá (80%)', value: '80%' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="conditionOpt"
                      checked={conditionFilter === opt.value}
                      onChange={() => setConditionFilter(opt.value)}
                      className="text-amber-800 focus:ring-amber-700 border-gray-300 w-4 h-4" 
                    />
                    <span className={conditionFilter === opt.value ? 'text-gray-900 font-semibold' : ''}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Book List Grid */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-orange-100 min-h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Hiện có {filteredBooks.length} cuốn sách cũ trong kho</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBooks.map((product) => (
                      <Link 
                        key={product.id}
                        to={`/book/${product.id}`}
                        className="flex flex-col bg-white p-3 rounded-xl border border-gray-100 hover:border-amber-700/20 hover:shadow-md transition-all group relative cursor-pointer"
                      >
                        {/* Condition Badge */}
                        <div className="absolute top-2 left-2 z-10 bg-amber-700 text-amber-100 text-[9px] font-black px-2 py-0.5 rounded shadow-sm uppercase">
                          {product.condition.split(' ')[0]} {product.condition.split(' ')[1]}
                        </div>

                        {/* Image */}
                        <div className="relative pt-[100%] mb-3 overflow-hidden rounded-lg bg-gray-50">
                          <img 
                            src={product.imageUrl || 'https://placehold.co/150'} 
                            alt={product.title} 
                            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2 filter sepia-[0.1]" 
                          />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 h-[40px] leading-[20px] group-hover:text-amber-800 transition-colors">
                          {product.title}
                        </h3>

                        {/* Condition Text */}
                        <span className="text-[10px] text-amber-700 font-semibold mb-2 bg-amber-50 px-2 py-0.5 rounded w-max">
                          {product.condition}
                        </span>

                        {/* Price */}
                        <div className="mt-auto pt-2">
                          <div className="flex flex-col mb-3">
                            <span className="text-amber-900 font-bold text-base sm:text-lg leading-none mb-1">
                              {product.usedPrice ? product.usedPrice.toLocaleString('vi-VN') : '0'} đ
                            </span>
                            <span className="text-gray-400 text-[10px] font-medium line-through">
                              Giá gốc: {product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') : '0'} đ
                            </span>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              // Add simulated used book
                              const usedProduct = {
                                ...product,
                                price: product.usedPrice,
                                title: `[Sách cũ - ${product.condition.split(' ')[0]}] ` + product.title
                              };
                              addToCart(usedProduct, 1);
                            }}
                            className="w-full py-1.5 border border-amber-800 text-amber-950 text-xs sm:text-sm font-bold rounded-lg hover:bg-amber-850 hover:bg-amber-800 hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            Mua sách cũ
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-gray-500">
                  Không tìm thấy sách cũ nào có độ mới này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
