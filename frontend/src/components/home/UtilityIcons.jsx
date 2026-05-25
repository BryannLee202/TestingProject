import React from 'react';
import { FaBolt, FaGift, FaTags, FaBookOpen } from 'react-icons/fa';

export default function UtilityIcons() {
  const utilities = [
    { icon: <FaBolt />, label: 'Flash Sale', color: 'text-yellow-500' },
    { icon: <FaGift />, label: 'Gift Card', color: 'text-red-500' },
    { icon: <FaTags />, label: 'Mã Giảm Giá', color: 'text-blue-500' },
    { icon: <FaBookOpen />, label: 'Sách Mới', color: 'text-green-500' },
  ];

  return (
    <section className="mt-8 mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-wrap justify-around items-center gap-4">
        {utilities.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-3 cursor-pointer group">
            <div className={`w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-2xl ${item.color} group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm`}>
              {item.icon}
            </div>
            <span className="font-medium text-gray-700 text-sm group-hover:text-primary transition-colors">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
