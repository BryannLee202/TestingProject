import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { FaSun, FaBookOpen } from 'react-icons/fa';
import SwiperNavButtons from '../common/SwiperNavButtons';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function FeaturedBooksSection() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/books/featured`);
        setFeaturedBooks(res.data);
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
    // Run once on mount only; API_BASE_URL is a module-level constant, not reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || featuredBooks.length === 0) return null;

  const renderBookItem = (book) => (
    <Link 
      key={book.id} 
      to={`/book/${book.id}`}
      className="bg-[#fdf9f1] rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#f0e6d2] p-4 flex flex-col hover:-translate-y-1 transition-transform duration-300 h-full w-full group relative"
    >
      <div className="relative pt-[130%] mb-4 bg-white rounded-md overflow-hidden">
        <img 
          src={book.imageUrl || 'https://placehold.co/300x450'} 
          alt={book.title}
          className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />
        {book.discount > 0 && (
          <div 
            className="absolute top-2 right-2 bg-[#8b3a3d] text-white text-sm font-bold flex items-center justify-center shadow-md px-2 py-1"
            style={{ borderRadius: '0 12px 12px 12px', minWidth: '42px', height: '32px' }}
          >
            -{book.discount}%
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="text-gray-800 font-medium text-sm line-clamp-2 mb-2 group-hover:text-[#8b3a3d] transition-colors">
          {book.title}
        </h3>
        <div className="mt-auto">
          <div className="text-[#8b3a3d] font-bold text-lg">
            {book.price.toLocaleString('vi-VN')} đ
          </div>
          {book.oldPrice > 0 && book.oldPrice > book.price && (
            <div className="text-gray-400 line-through text-xs">
              {book.oldPrice.toLocaleString('vi-VN')} đ
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-[#fcebe9] rounded-2xl shadow-inner border border-[#f2d8d8] p-6 sm:p-8 my-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 relative z-10 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[#c79a52] text-2xl sm:text-3xl"><FaSun /></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#8b3a3d] uppercase tracking-wide">
            SẢN PHẨM ĐỀ CỬ
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#c79a52] text-3xl hidden md:block opacity-70"><FaBookOpen /></span>
          <Link to="/search?sort=featured" className="bg-[#fdf9f1] border border-[#d2b48c] text-[#8b3a3d] hover:bg-[#8b3a3d] hover:text-white px-6 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            Xem tất cả
          </Link>
        </div>
      </div>

      <style>{`
        .featured-swiper .swiper-pagination-bullet-active {
          background-color: #8b3a3d;
        }
      `}</style>

      {featuredBooks.length > 4 ? (
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          className="featured-swiper !pb-10 [&_.swiper-wrapper]:items-stretch px-2 sm:px-4"
        >
          {featuredBooks.map(book => (
            <SwiperSlide key={book.id} className="!h-auto flex py-2">
              {renderBookItem(book)}
            </SwiperSlide>
          ))}
          <SwiperNavButtons />
        </Swiper>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featuredBooks.map(book => renderBookItem(book))}
        </div>
      )}
    </div>
  );
}
