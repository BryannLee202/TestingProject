import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBolt, 
  FaTicketAlt, 
  FaFire, 
  FaPencilAlt, 
  FaGamepad, 
  FaBookOpen, 
  FaBaby, 
  FaGlobeAmericas,
  FaGift,
  FaShoppingBag,
  FaPlus,
  FaRecycle
} from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function QuickLinks() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        setCategories(res.data || []);
      } catch (error) {
        console.error('Error fetching categories in QuickLinks:', error);
      }
    };
    fetchCategories();
  }, []);

  const getCategoryPath = (keyword, fallbackId) => {
    const found = categories.find(c => c.name.toLowerCase().includes(keyword.toLowerCase()));
    return found ? `/category/${found.id}` : `/category/${fallbackId}`;
  };

  const links = [
    { icon: <FaBolt className="text-[#FBA617]" />, label: 'Flash Sale', path: '/flash-sale' },
    { icon: <FaTicketAlt className="text-[#F04438]" />, label: 'Mã Giảm Giá', path: '/coupons' },
    { icon: <FaPlus className="text-[#10B981]" />, label: 'Sách Mới', path: '/new-books' },
    { icon: <FaRecycle className="text-[#D97706]" />, label: 'Sách Cũ', path: '/used-books' },
    { icon: <FaGift className="text-[#EF4444]" />, label: 'Khuyến Mãi', path: '/promotions' },
    { icon: <FaFire className="text-[#FF7020]" />, label: 'Sách Bán Chạy', path: '/search?tab=bestsellers' },
    { icon: <FaPencilAlt className="text-[#1C64F2]" />, label: 'Văn Phòng Phầm', path: getCategoryPath('văn phòng', 1) },
    { icon: <FaGamepad className="text-[#16BD6D]" />, label: 'Đồ Chơi', path: getCategoryPath('đồ chơi', 2) },
    { icon: <FaBookOpen className="text-[#AC4BEE]" />, label: 'Manga - Comic', path: getCategoryPath('manga', 3) },
    { icon: <FaBaby className="text-[#F02F93]" />, label: 'Thiếu Nhi', path: getCategoryPath('thiếu nhi', 4) },
    { icon: <FaGlobeAmericas className="text-[#0E9F6E]" />, label: 'Sách Ngoại Văn', path: getCategoryPath('ngoại văn', 5) },
    { icon: <FaShoppingBag className="text-[#5A63EC]" />, label: 'Bách Hóa', path: getCategoryPath('bách hóa', 7) },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 overflow-hidden">
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-2 md:gap-4 md:grid md:grid-cols-12 md:overflow-visible">
        {links.map((item, index) => (
          <Link 
            key={index} 
            to={item.path}
            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[76px] sm:min-w-[85px] md:min-w-0 snap-start"
          >
            <div className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-[#f8f9fa] flex items-center justify-center text-xl sm:text-2xl group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
              {item.icon}
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-[#4a4f63] text-center leading-tight group-hover:text-primary transition-colors px-1">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
