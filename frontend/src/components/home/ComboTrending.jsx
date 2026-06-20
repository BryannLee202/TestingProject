import React from 'react';
import { FaStar, FaLayerGroup } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function ComboTrending({ data = [] }) {
  const { addToCart } = useCart();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 border-b border-gray-100 pb-4">
        Combo Sách Tiết Kiệm
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.map((product, index) => {
          // Tính % tiết kiệm (giả lập hoặc dùng thật nếu có)
          const discountPercent = product.original_price && product.price 
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100) 
            : 20; // default 20% if missing

          return (
            <Link 
              key={product.id || index} 
              to={`/book/${product.id}`}
              className="flex flex-col bg-white p-3 rounded-lg border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative"
            >
              {/* Discount Label */}
              <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm flex items-center">
                Tiết kiệm {discountPercent}%
              </div>
              
              {/* Image */}
              <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50 mt-4">
                <img 
                  src={product.image_url || product.img || 'https://placehold.co/150'} 
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
                    className={`text-[10px] ${i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              
              {/* Price */}
              <div className="mt-auto flex flex-col">
                <span className="text-primary font-bold text-lg leading-none">
                  {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                </span>
                {(product.original_price || product.oldPrice) && (
                  <span className="text-gray-400 text-xs line-through mt-1">
                    {(product.original_price || product.oldPrice).toLocaleString('vi-VN')} đ
                  </span>
                )}
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
        })}
      </div>
    </div>
  );
}
