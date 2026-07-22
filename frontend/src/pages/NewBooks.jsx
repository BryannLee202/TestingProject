import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FaStar, FaRegClock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function NewBooks() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, catsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/books/latest`),
          axios.get(`${API_BASE_URL}/categories`)
        ]);
        
        const fetchedBooks = Array.isArray(booksRes.data) 
          ? booksRes.data 
          : (booksRes.data?.success ? booksRes.data.data : (booksRes.data?.content || []));
          
        const fetchedCategories = Array.isArray(catsRes.data)
          ? catsRes.data
          : (catsRes.data?.success ? catsRes.data.data : []);

        setBooks(fetchedBooks);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching data for new books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...books];
    
    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(b => b.category?.id === Number(selectedCategory));
    }
    
    // Sort
    if (sortOrder === 'newest') {
      // Books are already returned newest first, but if needed:
      result.sort((a, b) => b.id - a.id);
    } else if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredBooks(result);
  }, [books, selectedCategory, sortOrder]);

  return (
    <div className="bg-gray-100 min-h-screen pb-12 pt-6">
      <Helmet>
        <title>Sách Mới Phát Hành | YiYi Book</title>
        <meta name="description" content="Khám phá ngay các tựa sách mới phát hành nóng hổi nhất tại nhà sách YiYi Book. Đầy đủ các thể loại, cập nhật liên tục." />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Sách mới</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-900 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-50px] right-0 w-80 h-80 bg-white/10 rounded-full blur-[70px]"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
              🆕
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                Sách Mới Phát Hành
              </h1>
              <p className="text-teal-100 text-sm mt-1">Cập nhật nhanh nhất các tác phẩm mới xuất bản trên thị trường</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative z-10 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm">
            <FaRegClock className="text-emerald-300" />
            <span className="font-semibold text-gray-200">Liên tục cập nhật hàng ngày</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Filter Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 uppercase mb-4 pb-2 border-b">Bộ lọc thể loại</h3>
              
              <div className="mb-6">
                <div className="space-y-1.5 text-sm">
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left py-2 px-3 rounded-lg transition-all ${selectedCategory === 'all' ? 'bg-emerald-50 text-emerald-600 font-bold border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Tất cả danh mục
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id.toString())}
                      className={`w-full text-left py-2 px-3 rounded-lg transition-all ${selectedCategory === cat.id.toString() ? 'bg-emerald-50 text-emerald-600 font-bold border-l-4 border-emerald-500' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-b border-gray-100 mb-6"></div>

              <div>
                <h3 className="font-bold text-gray-800 uppercase mb-3 text-sm">Sắp xếp</h3>
                <div className="space-y-2.5 text-sm text-gray-600">
                  {[
                    { label: 'Mới nhất', value: 'newest' },
                    { label: 'Giá tăng dần', value: 'price_asc' },
                    { label: 'Giá giảm dần', value: 'price_desc' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="newSortOpt"
                        checked={sortOrder === opt.value}
                        onChange={() => setSortOrder(opt.value)}
                        className="text-emerald-600 focus:ring-emerald-500 border-gray-300 w-4 h-4" 
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
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
              ) : filteredBooks.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 text-sm font-medium">Tìm thấy {filteredBooks.length} cuốn sách mới</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBooks.map((product) => (
                      <Link 
                        key={product.id}
                        to={`/book/${product.id}`}
                        className="flex flex-col bg-white p-3 rounded-xl border border-gray-100 hover:border-emerald-500/20 hover:shadow-md transition-all group relative cursor-pointer"
                      >
                        {/* New Badge */}
                        <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                          NEW
                        </div>

                        {/* Image */}
                        <div className="relative pt-[100%] mb-3 overflow-hidden rounded-lg bg-gray-50">
                          <img 
                            src={product.imageUrl || 'https://placehold.co/150'} 
                            alt={product.title} 
                            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2" 
                          />
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 h-[40px] leading-[20px] group-hover:text-emerald-600 transition-colors">
                          {product.title}
                        </h3>
                        
                        {/* Stars */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={`text-[10px] ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount || 0})</span>
                        </div>

                        {/* Price */}
                        <div className="mt-auto pt-2">
                          <div className="flex flex-col mb-3">
                            <span className="text-[#C92127] font-bold text-base sm:text-lg leading-none mb-1">
                              {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                            </span>
                            {product.oldPrice > 0 && (
                              <span className="text-gray-400 text-[10px] sm:text-[11px] font-medium line-through">
                                {product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') : '0'} đ
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product, 1);
                            }}
                            className="w-full py-1.5 border border-emerald-500 text-emerald-600 text-xs sm:text-sm font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-colors flex items-center justify-center gap-1"
                          >
                            Thêm giỏ hàng
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-gray-500">
                  Không tìm thấy sách mới phù hợp với bộ lọc thể loại này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
