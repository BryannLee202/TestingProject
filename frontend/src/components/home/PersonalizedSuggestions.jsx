import React from 'react';
import { FaRobot, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';

export default function PersonalizedSuggestions({ data = [] }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-sm border border-indigo-100 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-indigo-200">
        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl shadow-md">
          <FaRobot />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-900">
          Gợi ý dành riêng cho bạn
        </h2>
      </div>

      {/* Product Slider */}
      <div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2.2}
          navigation
          breakpoints={{
            640: { slidesPerView: 3.2 },
            768: { slidesPerView: 4.2 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          className="w-full pb-2"
        >
          {data.map((product, index) => (
            <SwiperSlide key={product.id || index}>
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
                    src={product.image_url || product.img || 'https://via.placeholder.com/150'} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px] leading-snug group-hover:text-indigo-600 transition-colors">
                  {product.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`text-[10px] ${i < (product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                
                {/* Price */}
                <div className="mt-auto">
                  <div className="flex flex-col">
                    <span className="text-primary font-bold text-lg leading-none mb-1">
                      {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                    </span>
                    {product.original_price && (
                      <span className="text-gray-400 text-xs line-through">
                        {product.original_price.toLocaleString('vi-VN')} đ
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
