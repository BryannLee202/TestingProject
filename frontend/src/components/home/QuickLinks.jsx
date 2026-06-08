import React from 'react';
import { Link } from 'react-router-dom';
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
  FaShoppingBag
} from 'react-icons/fa';

export default function QuickLinks() {
  const links = [
    { icon: <FaBolt className="text-[#FBA617]" />, label: 'Flash Sale', path: '/category/flash-sale' },
    { icon: <FaTicketAlt className="text-[#F04438]" />, label: 'Mã Giảm Giá', path: '/category/coupons' },
    { icon: <FaFire className="text-[#FF7020]" />, label: 'Sách Bán Chạy', path: '/category/bestsellers' },
    { icon: <FaPencilAlt className="text-[#1C64F2]" />, label: 'Văn Phòng Phẩm', path: '/category/1' },
    { icon: <FaGamepad className="text-[#16BD6D]" />, label: 'Đồ Chơi', path: '/category/2' },
    { icon: <FaBookOpen className="text-[#AC4BEE]" />, label: 'Manga - Comic', path: '/category/3' },
    { icon: <FaBaby className="text-[#F02F93]" />, label: 'Thiếu Nhi', path: '/category/4' },
    { icon: <FaGlobeAmericas className="text-[#0E9F6E]" />, label: 'Sách Ngoại Văn', path: '/category/5' },
    { icon: <FaGift className="text-[#F93A57]" />, label: 'Quà Lưu Niệm', path: '/category/6' },
    { icon: <FaShoppingBag className="text-[#5A63EC]" />, label: 'Bách Hóa', path: '/category/7' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 overflow-hidden">
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-2 md:gap-4 md:grid md:grid-cols-10 md:overflow-visible">
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
