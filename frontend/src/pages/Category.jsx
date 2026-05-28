import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Category() {
  const { categoryId } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/books/category/${categoryId}`);
        if (res.data.success) {
          setBooks(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching category books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryBooks();
  }, [categoryId]);

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">Danh mục {categoryId}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Filters (Static UI) */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <h3 className="font-bold text-gray-800 uppercase mb-4 pb-2 border-b">Bộ lọc tìm kiếm</h3>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Giá</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" /> Dưới 50.000đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" /> Từ 50.000đ - 150.000đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary" /> Trên 150.000đ
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Đánh giá</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {[5, 4, 3].map(star => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded text-primary focus:ring-primary" /> 
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(star)].map((_, i) => <FaStar key={i} />)}
                        {[...Array(5 - star)].map((_, i) => <FaStar key={i} className="text-gray-200" />)}
                      </div>
                      <span>từ {star} sao</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Grid */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Kết quả tìm kiếm</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : books.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {books.map((product) => (
                    <Link 
                      key={product.id}
                      to={`/book/${product.id}`}
                      className="flex flex-col bg-white p-3 rounded-lg border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50">
                        <img 
                          src={product.image_url || product.img || 'https://via.placeholder.com/150'} 
                          alt={product.title} 
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 min-h-[40px] leading-snug group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-[10px] ${i < (product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <div className="mt-auto flex flex-col">
                        <span className="text-primary font-bold text-lg leading-none">
                          {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                        </span>
                        {product.original_price && (
                          <span className="text-gray-400 text-xs line-through mt-1">
                            {product.original_price.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  Không tìm thấy sản phẩm nào trong danh mục này.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
