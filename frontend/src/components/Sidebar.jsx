import React from 'react';
import { FaFilter } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-20">
        <h3 className="flex items-center gap-2 font-bold text-gray-800 text-lg mb-6 pb-4 border-b border-gray-100">
          <FaFilter className="text-primary" />
          BỘ LỌC TÌM KIẾM
        </h3>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Khoảng giá</h4>
          <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow">
            <option value="">Tất cả mức giá</option>
            <option value="0-50000">Dưới 50.000đ</option>
            <option value="50000-150000">50.000đ - 150.000đ</option>
            <option value="150000-300000">150.000đ - 300.000đ</option>
            <option value="300000-9999999">Trên 300.000đ</option>
          </select>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">Thể loại</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {/* Placeholder categories */}
            {['Văn học', 'Kinh tế', 'Tâm lý - Kỹ năng', 'Manga - Comic', 'Thiếu nhi', 'Tiểu sử - Hồi ký'].map((cat, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-gray-600 text-sm group-hover:text-primary transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2.5 rounded-lg transition-colors">
          Áp dụng
        </button>
      </div>
    </aside>
  );
}
