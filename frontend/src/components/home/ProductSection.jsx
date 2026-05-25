import React, { useState } from 'react';

export default function ProductSection() {
  const [sortBy, setSortBy] = useState('newest');

  return (
    <section className="flex-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-red-500 text-2xl">🔥</span> Xu Hướng Mua Sắm
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Sắp xếp:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Placeholder for product grid */}
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(item => (
          <div key={item} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="relative pt-[100%] mb-3 overflow-hidden">
              <img src={`https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg`} alt="Book" className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">Sách xu hướng {item}</h3>
            <div className="flex flex-col">
              <span className="text-primary font-bold text-lg">80.000 đ</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
