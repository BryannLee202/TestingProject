import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaBaby, FaFlask, FaBook, FaBox, FaGlobe, FaChevronRight } from 'react-icons/fa';

export default function TrendingCategories() {
  const [categories, setCategories] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(res.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryTheme = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('thiếu nhi') || lowerName.includes('trẻ em')) {
      return { icon: <FaBaby />, bg: 'bg-orange-100 text-orange-600 border-orange-200' };
    } else if (lowerName.includes('tiểu thuyết') || lowerName.includes('văn học')) {
      return { icon: <FaBook />, bg: 'bg-purple-100 text-purple-600 border-purple-200' };
    } else if (lowerName.includes('khoa học') || lowerName.includes('công nghệ') || lowerName.includes('lập trình')) {
      return { icon: <FaFlask />, bg: 'bg-blue-100 text-blue-600 border-blue-200' };
    } else if (lowerName.includes('combo')) {
      return { icon: <FaBox />, bg: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
    } else {
      return { icon: <FaGlobe />, bg: 'bg-gray-100 text-gray-600 border-gray-200' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Danh Mục Nổi Bật</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat.name);
          return (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0 border ${theme.bg}`}>
                {theme.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block font-bold text-sm text-gray-800 group-hover:text-primary truncate transition-colors">
                  {cat.name}
                </span>
                <span className="block text-xs text-gray-400 truncate mt-0.5">
                  {cat.description || 'Khám phá ngay'}
                </span>
              </div>
              <FaChevronRight className="text-xs text-gray-300 group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
