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

  const renderProduct = (product) => {
    const discount = product.oldPrice && product.oldPrice > product.price 
      ? Math.round((1 - product.price / product.oldPrice) * 100) 
      : 0;

    return (
      <Link 
        to={`/book/${product.id}`}
        className="flex flex-col h-full bg-white p-2 rounded-lg hover:shadow-lg transition-shadow cursor-pointer group"
      >
        {/* Image & Tag */}
        <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-white">
          <img 
            src={product.imageUrl || product.img || 'https://placehold.co/150'} 
            alt={product.title} 
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
          />
          {discount > 0 && (
            <div className="absolute top-0 right-0 bg-[#C92127] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm z-10">
              -{discount}%
            </div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-[14px] text-gray-700 line-clamp-2 mb-2 h-[40px] leading-[20px] group-hover:text-[#C92127] transition-colors">
          {product.title}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
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
            <span className="text-[#C92127] font-bold text-[15px] leading-none mb-1">
              {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
            </span>
            {product.oldPrice > 0 && (
              <span className="text-gray-400 text-[12px] line-through">
                {product.oldPrice.toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[16px] font-bold text-gray-800 uppercase">
          Gợi ý cho bạn
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
          className="px-8 py-2 border border-[#C92127] text-[#C92127] font-medium rounded-md hover:bg-[#C92127] hover:text-white transition-colors inline-block"
        >
          Xem Thêm
        </Link>
      </div>
    </div>
  );
}
