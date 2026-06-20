import React, { useState } from 'react';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function ProductSection({ title, tabs = [], products = [], activeTab, onTabChange, loading }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          {title}
        </h2>
        
        {tabs.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => onTabChange && onTabChange(tab)}
                className={`text-sm sm:text-base font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-600 hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid or Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white p-3 rounded-lg border border-gray-100 min-h-[300px]">
              <div className="bg-gray-200 pt-[100%] rounded-md mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <Link 
              key={product.id} 
              to={`/book/${product.id}`}
              className="flex flex-col bg-white p-3 rounded-lg border border-transparent hover:border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50">
                <img 
                  src={product.imageUrl || product.img} 
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
                    className={`text-[10px] ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} 
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">({product.reviewCount || 0})</span>
              </div>
              
              {/* Price */}
              <div className="mt-auto flex flex-col">
                <span className="text-primary font-bold text-lg leading-none">
                  {product.price.toLocaleString('vi-VN')} đ
                </span>
                {product.oldPrice && (
                  <span className="text-gray-400 text-xs line-through mt-1">
                    {product.oldPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>
              
              {/* Sales Count */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min((product.salesCount / 100) * 100, 100) || 0}%` }}
                  ></div>
                </div>
                <span>Đã bán {product.salesCount || 0}</span>
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
          ))}
        </div>
      )}
      
      {/* View more button */}
      <div className="mt-6 text-center">
        <button className="px-8 py-2 border border-primary text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors">
          Xem Thêm
        </button>
      </div>
    </div>
  );
}
