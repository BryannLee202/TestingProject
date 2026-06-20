import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFire, FaShoppingCart, FaUser, FaBuilding } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function BestSellersByCategory() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setCategories([{ id: 'all', name: 'Tất cả' }, ...res.data]);
        setActiveCategory({ id: 'all', name: 'Tất cả' });
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooksByCategory = async () => {
      if (!activeCategory) return;
      try {
        setLoading(true);
        let res;
        if (activeCategory.id === 'all') {
          res = await axios.get(`${API_BASE_URL}/books/bestsellers`);
        } else {
          res = await axios.get(`${API_BASE_URL}/books/category/${activeCategory.id}`);
        }
        
        // Giả lập sort theo lượt bán nếu API chưa sort
        const sortedBooks = (res.data || []).sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5);
        setBooks(sortedBooks);
        if (sortedBooks.length > 0) {
          setSelectedBook(sortedBooks[0]);
          setExpandedDesc(false);
        } else {
          setSelectedBook(null);
          setExpandedDesc(false);
        }
      } catch (error) {
        console.error('Error fetching books by category:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooksByCategory();
  }, [activeCategory]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-4">
        <FaFire className="text-red-500 text-2xl" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Best Sellers</h2>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-6 border-b border-gray-100 pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap font-medium pb-2 border-b-2 transition-colors ${
              activeCategory?.id === cat.id
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-red-500'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6 min-h-[400px]">
        {/* Left Panel: Top List */}
        <div className="w-full md:w-5/12 flex flex-col border-r border-gray-100 pr-0 md:pr-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          ) : books.length > 0 ? (
            books.map((book, index) => {
              const isSelected = selectedBook?.id === book.id;
              const rankColor = index < 3 ? 'text-red-500' : 'text-gray-400';

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    setSelectedBook(book);
                    setExpandedDesc(false);
                  }}
                  className={`flex items-center gap-4 p-3 mb-2 cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                >
                  {/* Rank Number */}
                  <span className={`text-2xl font-bold w-6 text-center ${rankColor}`}>
                    {index + 1}
                  </span>
                  
                  {/* Small Image */}
                  <div className="w-16 h-20 shrink-0 bg-white border border-gray-100 rounded-md p-1">
                    <img 
                      src={book.imageUrl || book.image_url || 'https://placehold.co/60x80'} 
                      alt={book.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <FaFire className="text-red-500 text-[10px]" />
                      <span className="text-[10px] text-red-500 font-bold">Top {index + 1}</span>
                    </div>
                    <h4 className={`text-sm font-semibold line-clamp-2 mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                      {book.title}
                    </h4>
                    <span className="text-[11px] text-gray-400">
                      Đã bán {book.salesCount || 0}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-gray-400 text-sm py-10 text-center">Chưa có sản phẩm nào</div>
          )}
        </div>

        {/* Right Panel: Detail View */}
        <div className="w-full md:w-7/12 pl-0 md:pl-2">
          {selectedBook ? (
            <div className="flex flex-col h-full animate__animated animate__fadeIn">
              <div className="flex flex-col sm:flex-row gap-6 mb-6">
                {/* Large Image */}
                <Link to={`/book/${selectedBook.id}`} className="w-full sm:w-48 h-64 shrink-0 bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center hover:shadow-md transition-shadow">
                  <img 
                    src={selectedBook.imageUrl || selectedBook.image_url || 'https://placehold.co/200x300'} 
                    alt={selectedBook.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1">
                  <Link to={`/book/${selectedBook.id}`} className="text-xl font-bold text-gray-800 hover:text-red-600 transition-colors line-clamp-2 mb-2">
                    {selectedBook.title}
                  </Link>
                  <div className="text-xs text-gray-400 mb-4">
                    Đã bán {selectedBook.salesCount || 0}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><FaUser className="text-gray-400"/> Tác giả: <span className="font-semibold text-gray-800">{selectedBook.author || 'Đang cập nhật'}</span></span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1"><FaBuilding className="text-gray-400"/> NXB: <span className="font-semibold text-gray-800">{selectedBook.publisher || 'Đang cập nhật'}</span></span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl font-bold text-red-600">
                      {selectedBook.price?.toLocaleString('vi-VN')} đ
                    </span>
                    {selectedBook.oldPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {selectedBook.oldPrice.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                    {(selectedBook.discount > 0 || (selectedBook.oldPrice && selectedBook.oldPrice > selectedBook.price)) && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{selectedBook.discount || Math.round((selectedBook.oldPrice - selectedBook.price)/selectedBook.oldPrice*100)}%
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => addToCart(selectedBook, 1)}
                    className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                  >
                    <FaShoppingCart /> Thêm vào giỏ hàng
                  </button>
                </div>
              </div>

              {/* Description preview */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-gray-800 mb-2">Mô tả sản phẩm</h3>
                <div className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap ${expandedDesc ? '' : 'line-clamp-3'}`}>
                  {selectedBook.description || 'Chưa có mô tả cho sản phẩm này.'}
                </div>
                {selectedBook.description && selectedBook.description.length > 150 && (
                  <button 
                    onClick={() => setExpandedDesc(!expandedDesc)}
                    className="text-blue-600 text-sm mt-1 hover:underline font-medium"
                  >
                    {expandedDesc ? 'Rút gọn' : 'Xem thêm'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              {loading ? 'Đang tải...' : 'Vui lòng chọn một danh mục'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
