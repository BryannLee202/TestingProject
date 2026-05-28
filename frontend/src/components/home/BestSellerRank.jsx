import React from 'react';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function BestSellerRank({ data = [] }) {
  const getBadgeStyle = (index) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white shadow-yellow-500/50';
      case 1:
        return 'bg-gradient-to-br from-gray-200 to-gray-400 text-white shadow-gray-500/50';
      case 2:
        return 'bg-gradient-to-br from-orange-300 to-amber-700 text-white shadow-orange-500/50';
      default:
        return 'bg-gray-800 text-white shadow-gray-900/50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 border-b border-gray-100 pb-4">
        Bảng Xếp Hạng Bán Chạy
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((product, index) => (
          <Link 
            key={product.id || index} 
            to={`/book/${product.id}`}
            className="flex flex-col bg-white p-3 rounded-lg border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
          >
            {/* Rank Badge */}
            <div className={`absolute top-0 left-0 z-10 w-8 h-10 flex items-center justify-center font-bold text-lg rounded-tl-lg rounded-br-xl shadow-md ${getBadgeStyle(index)}`}>
              {index + 1}
            </div>
            
            {/* Image */}
            <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50 mt-2">
              <img 
                src={product.image_url || product.img || 'https://via.placeholder.com/150'} 
                alt={product.title} 
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
            
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 min-h-[40px] leading-snug group-hover:text-primary transition-colors">
              {product.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`text-[10px] ${i < (product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            
            {/* Price */}
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
    </div>
  );
}
