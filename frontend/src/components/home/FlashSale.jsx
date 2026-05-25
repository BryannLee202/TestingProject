import React, { useState, useEffect } from 'react';
import { FaBolt, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 10 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <section className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-red-600">
              <FaBolt /> FLASH SALE
            </h2>
            <div className="flex items-center gap-1.5 text-white font-mono text-lg font-bold">
              <span className="bg-gray-800 rounded px-2.5 py-1">{formatTime(timeLeft.hours)}</span>
              <span className="text-gray-800">:</span>
              <span className="bg-gray-800 rounded px-2.5 py-1">{formatTime(timeLeft.minutes)}</span>
              <span className="text-gray-800">:</span>
              <span className="bg-gray-800 rounded px-2.5 py-1">{formatTime(timeLeft.seconds)}</span>
            </div>
          </div>
          <Link to="/flash-sale" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 group">
            Xem tất cả <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Placeholder items */}
          {[1,2,3,4,5].map(item => (
            <div key={item} className="bg-white p-3 rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="relative pt-[100%] mb-3">
                <img src={`https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg`} alt="Book" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">-50%</div>
              </div>
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">Sách placeholder {item}</h3>
              <div className="flex flex-col">
                <span className="text-red-600 font-bold">50.000 đ</span>
                <span className="text-gray-400 text-xs line-through">100.000 đ</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
