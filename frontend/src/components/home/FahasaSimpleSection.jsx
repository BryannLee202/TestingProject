import React from 'react';
import { Link } from 'react-router-dom';

export default function FahasaSimpleSection({ title, data = [], maxItems = 10 }) {
  if (!data || data.length === 0) return null;

  const displayData = data.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <h2 className="text-[16px] font-bold text-gray-800 uppercase mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayData.map((product, index) => {
          const discount = product.oldPrice && product.oldPrice > product.price 
            ? Math.round((1 - product.price / product.oldPrice) * 100) 
            : 0;

          return (
            <Link 
              key={product.id || index}
              to={`/book/${product.id}`}
              className="flex flex-col group cursor-pointer"
            >
              <div className="relative pt-[100%] mb-3">
                <img 
                  src={product.imageUrl || product.img || 'https://placehold.co/200'} 
                  alt={product.title} 
                  className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                />
                {discount > 0 && (
                  <div className="absolute top-0 right-0 bg-[#C92127] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm">
                    -{discount}%
                  </div>
                )}
              </div>
              <h3 className="text-[14px] text-gray-700 line-clamp-2 h-[40px] leading-[20px] mb-2 group-hover:text-[#C92127] transition-colors">
                {product.title}
              </h3>
              <div className="mt-auto flex items-center gap-2">
                <span className="text-[#C92127] font-bold text-[15px]">
                  {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                </span>
                {product.oldPrice > 0 && (
                  <span className="text-gray-400 text-[12px] line-through">
                    {product.oldPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
