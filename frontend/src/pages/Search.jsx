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
  const [sortOption, setSortOption] = useState('bestseller');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/categories`)
      .then(res => setAllCategories(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const endpoint = query 
          ? `${API_BASE_URL}/books/search?keyword=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/books`;
        const res = await axios.get(endpoint);
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

  const filteredResults = results.filter(book => {
    let priceMatch = selectedPrices.length === 0;
    if (!priceMatch) {
      const price = book.price || 0;
      if (selectedPrices.includes('under50') && price < 50000) priceMatch = true;
      if (selectedPrices.includes('50to150') && price >= 50000 && price <= 150000) priceMatch = true;
      if (selectedPrices.includes('over150') && price > 150000) priceMatch = true;
    }

    let ratingMatch = selectedRatings.length === 0;
    if (!ratingMatch) {
      const rating = book.averageRating || 0;
      if (selectedRatings.some(r => rating >= r)) ratingMatch = true;
    }

    return priceMatch && ratingMatch;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortOption) {
      case 'price_asc': return (a.price || 0) - (b.price || 0);
      case 'price_desc': return (b.price || 0) - (a.price || 0);
      case 'bestseller': 
      default:
        return (b.salesCount || 0) - (a.salesCount || 0);
    }
  });

  const displayedResults = sortedResults.slice(0, itemsPerPage);

  const handlePriceChange = (value) => {
    setSelectedPrices(prev => 
      prev.includes(value) ? prev.filter(p => p !== value) : [...prev, value]
    );
  };

  const handleRatingChange = (value) => {
    setSelectedRatings(prev => 
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 font-medium">Tìm kiếm</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Filters (Static UI) */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
              <h3 className="font-bold text-gray-800 uppercase mb-4 pb-2 border-b">Bộ lọc tìm kiếm</h3>
              
              <div className="mb-6">
                <h4 className="font-bold text-gray-800 uppercase mb-3">Nhóm sản phẩm</h4>
                <div className="space-y-1 text-sm max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <Link 
                    to="/category/all" 
                    className="block py-1.5 text-orange-500 font-medium hover:text-orange-600 transition-colors"
                  >
                    Tất Cả Nhóm Sản Phẩm
                  </Link>
                  {allCategories.map(cat => (
                    <Link 
                      key={cat.id} 
                      to={`/category/${cat.id}`}
                      className="block py-1.5 pl-4 border-l-2 border-transparent text-gray-600 hover:text-orange-500"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="border-b border-gray-100 mb-6"></div>

              <div className="mb-6">
                <h4 className="font-bold text-gray-800 uppercase mb-3">Giá</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPrices.includes('under50')} onChange={() => handlePriceChange('under50')} className="rounded text-primary focus:ring-primary" /> Dưới 50.000đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPrices.includes('50to150')} onChange={() => handlePriceChange('50to150')} className="rounded text-primary focus:ring-primary" /> Từ 50.000đ - 150.000đ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedPrices.includes('over150')} onChange={() => handlePriceChange('over150')} className="rounded text-primary focus:ring-primary" /> Trên 150.000đ
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 uppercase mb-3">Đánh giá</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {[5, 4, 3].map(star => (
                    <label key={star} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedRatings.includes(star)} onChange={() => handleRatingChange(star)} className="rounded text-primary focus:ring-primary" /> 
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
              <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {query ? (
                      <>Kết quả tìm kiếm cho: <span className="text-primary">"{query}"</span></>
                    ) : (
                      <>Tất cả sản phẩm</>
                    )}
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">Tìm thấy {filteredResults.length} kết quả phù hợp</p>
                </div>
        
        {results.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-4 text-sm">
            <span className="text-gray-700 font-medium whitespace-nowrap">Sắp xếp theo :</span>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 min-w-[140px]"
            >
              <option value="bestseller">Bán Chạy Tuần</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
            </select>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 hidden sm:block min-w-[120px]"
            >
              <option value={12}>12 sản phẩm</option>
              <option value={24}>24 sản phẩm</option>
              <option value={48}>48 sản phẩm</option>
              <option value={10000}>Tất cả sản phẩm</option>
            </select>
          </div>
        )}
              </div>

              {filteredResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayedResults.map((book) => (
                    <Link 
                      key={book.id}
                      to={`/book/${book.id}`}
                      className="flex flex-col bg-white p-3 rounded-lg border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50">
                        <img 
                          src={book.imageUrl || book.image_url || 'https://placehold.co/150'} 
                          alt={book.title} 
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                        />
                        {book.discount > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -{book.discount}%
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 h-[40px] leading-[20px] group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      
                      <div className="text-xs text-gray-500 mb-2 truncate">{book.author}</div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400 text-[10px]">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < Math.round(book.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">Đã bán {book.salesCount || 0}</span>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <div className="flex flex-wrap items-baseline gap-2 mb-2">
                          <span className="text-primary font-bold text-sm sm:text-base">{formatPrice(book.price)}</span>
                          {book.oldPrice > 0 && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(book.oldPrice)}</span>
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(book, 1);
                          }}
                          className="w-full py-1.5 border border-primary text-primary text-xs sm:text-sm font-medium rounded hover:bg-primary hover:text-white transition-colors"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                  <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png" alt="No results" className="w-32 sm:w-48 mx-auto opacity-50 mb-4" />
                  <h3 className="text-lg font-bold text-gray-700">Không tìm thấy sản phẩm nào</h3>
                  <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
                  <button 
                    onClick={() => {
                      setSelectedPrices([]);
                      setSelectedRatings([]);
                    }} 
                    className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded font-medium hover:bg-primary-light transition-colors text-sm"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
