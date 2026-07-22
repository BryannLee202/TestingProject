import React from 'react';
import { FaRobot, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import SwiperNavButtons from '../common/SwiperNavButtons';
import { useCart } from '../../context/CartContext';

export default function PersonalizedSuggestions({ data = [], maxRows = 0 }) {
  const { addToCart } = useCart();
  
  const getVisibilityClass = (idx) => {
    if (!maxRows) return '';
    let cls = [];
    
    if (idx >= 2 * maxRows) cls.push('hidden');
    
    if (idx >= 3 * maxRows) cls.push('sm:hidden');
    else if (idx >= 2 * maxRows) cls.push('sm:block');
    
    if (idx >= 4 * maxRows) cls.push('md:hidden');
    else if (idx >= 3 * maxRows) cls.push('md:block');
    
    if (idx >= 5 * maxRows) cls.push('lg:hidden');
    else if (idx >= 4 * maxRows) cls.push('lg:block');

    return cls.join(' ');
  };

  const renderProduct = (product) => (
    <Link 
      to={`/book/${product.id}`}
      className="flex flex-col h-full bg-white p-3 rounded-lg border border-transparent hover:border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
    >
      
      {/* AI Label */}
      <div className="absolute top-2 right-2 z-10 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
        Phù hợp
      </div>
      
      {/* Image */}
      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50 mt-4">
        <img 
          src={product.imageUrl || product.img || 'https://placehold.co/150'} 
          alt={product.title} 
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-[40px] leading-[20px] group-hover:text-indigo-600 transition-colors">
        {product.title}
      </h3>
      
      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`text-[10px] ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} 
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
      </div>
      
      {/* Price */}
      <div className="mt-auto">
        <div className="flex flex-col">
          <span className="text-primary font-bold text-lg leading-none mb-1">
            {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
          </span>
          {product.oldPrice > 0 && (
            <span className="text-gray-400 text-xs line-through">
              {product.oldPrice.toLocaleString('vi-VN')} đ
            </span>
          )}
        </div>
      </div>
      
      {/* Add to Cart Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          addToCart(product, 1);
        }}
        className="w-full mt-3 py-1.5 border border-primary text-primary text-sm font-semibold rounded hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        Thêm giỏ hàng
      </button>
    </Link>
  );

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-sm border border-indigo-100 p-4 sm:p-5 relative group/section">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-indigo-200">
        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl shadow-md">
          <FaRobot />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-900">
          Gợi ý dành riêng cho bạn
        </h2>
      </div>

      {/* Product List */}
      {maxRows === 1 ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={2.2}
          loop={data.length > 5}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3.2 },
            768: { slidesPerView: 4.2 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 5 },
          }}
          className="w-full pb-2"
        >
          {data.map((product, index) => (
            <SwiperSlide key={product.id || index} className="h-auto">
              {renderProduct(product)}
            </SwiperSlide>
          ))}
          <SwiperNavButtons />
        </Swiper>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
          {data.map((product, index) => (
            <div key={product.id || index} className={getVisibilityClass(index)}>
              {renderProduct(product)}
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="mt-5 text-center">
        <Link 
          to="/search"
          className="px-8 py-2 border border-indigo-500 text-indigo-600 font-medium rounded-md hover:bg-indigo-500 hover:text-white transition-colors inline-block"
        >
          Xem Tất Cả
        </Link>
      </div>
    </div>
  );
}
