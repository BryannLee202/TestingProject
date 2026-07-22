import React, { useState, useEffect } from 'react';
import { FaBolt, FaChevronRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'swiper/css';
import { useCart } from '../../context/CartContext';
import SwiperNavButtons from '../common/SwiperNavButtons';

export default function FlashSale() {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 30 });
  const [flashSaleProducts, setFlashSaleProducts] = useState([
    { id: 1, title: 'Sách Giảm Giá Đặc Biệt', price: 15000, oldPrice: 20000, discount: 25, soldPercent: 85, img: 'https://placehold.co/150x200?text=Book+1' },
    { id: 2, title: 'Tiểu Thuyết Bán Chạy', price: 75000, oldPrice: 105000, discount: 28, soldPercent: 50, img: 'https://placehold.co/150x200?text=Book+2' },
    { id: 3, title: 'Kỹ Năng Sống Mới', price: 55000, oldPrice: 79000, discount: 30, soldPercent: 90, img: 'https://placehold.co/150x200?text=Book+3' },
    { id: 4, title: 'Sách Kinh Tế Hot', price: 60000, oldPrice: 86000, discount: 30, soldPercent: 70, img: 'https://placehold.co/150x200?text=Book+4' },
  ]);
  const [flashSaleTitle, setFlashSaleTitle] = useState('Flash Sale');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data) {
          if (res.data.flashSaleTitle) {
            setFlashSaleTitle(res.data.flashSaleTitle);
          }
          if (res.data.flashSaleEndTime) {
            setTimeLeft({ hours: parseInt(res.data.flashSaleEndTime), minutes: 0, seconds: 0 });
          }
        }
      } catch (error) {
        console.error('Error fetching settings for FlashSale:', error);
      }
    };
    fetchSettings();
  }, []);

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

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/books/discounted`);
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map(b => {
            const salesCount = b.salesCount || 0;
            const stockQuantity = b.stockQuantity || 0;
            const total = salesCount + stockQuantity;
            const soldPercent = total > 0 ? Math.floor((salesCount / total) * 100) : 0;
            return {
              id: b.id,
              title: b.title,
              price: b.price,
              oldPrice: b.oldPrice || b.price * 1.3,
              discount: b.discount || 15,
              soldPercent,
              salesCount,
              stockQuantity,
              img: b.imageUrl || 'https://placehold.co/150'
            };
          });
          setFlashSaleProducts(mapped);
        }
      } catch (error) {
        console.error('Error fetching flash sale products:', error);
      }
    };
    fetchFlashSales();
  }, []);

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C92127] via-[#8B0000] to-[#1a1a1a] p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-50px] left-[-50px] w-[150px] h-[150px] bg-red-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-50px] right-20 w-[150px] h-[150px] bg-red-500/20 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <FaBolt className="text-yellow-400 text-3xl animate-pulse drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
            <h2 className="text-2xl sm:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 uppercase tracking-wider drop-shadow-sm">
              {flashSaleTitle}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-base sm:text-xl font-bold">
            <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg px-2.5 py-1.5 shadow-inner leading-none">{formatTime(timeLeft.hours)}</span>
            <span className="text-white/80 font-black animate-pulse pb-1">:</span>
            <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg px-2.5 py-1.5 shadow-inner leading-none">{formatTime(timeLeft.minutes)}</span>
            <span className="text-white/80 font-black animate-pulse pb-1">:</span>
            <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-lg px-2.5 py-1.5 shadow-inner leading-none">{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>
        <Link to="/flash-sale" className="text-white/90 hover:text-white font-semibold flex items-center gap-1.5 group text-sm relative z-10 bg-white/10 hover:bg-white/25 px-4 py-2 rounded-full transition-all backdrop-blur-sm border border-white/10">
          Xem tất cả <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Product Slider */}
      <div className="p-4 sm:p-5 bg-white relative">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          slidesPerView={2.2}
          loop={flashSaleProducts.length > 6}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 3.2 },
            768: { slidesPerView: 4.2 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          className="w-full pb-2"
        >
          {flashSaleProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <Link 
                to={`/book/${product.id}`}
                className="flex flex-col h-full bg-white p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative group"
              >
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-[#C92127] to-red-600 text-white text-xs font-black px-2.5 py-1 rounded-tl-lg rounded-br-lg shadow-md border border-red-400/30 tracking-wide">
                    -{product.discount}%
                  </div>
                )}
                
                {/* Image */}
                <div className="relative pt-[100%] mb-3 overflow-hidden rounded-md bg-gray-50">
                  <img 
                    src={product.img} 
                    alt={product.title} 
                    className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                
                {/* Title */}
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-[40px] leading-[20px] group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                
                {/* Price & Progress */}
                <div className="mt-auto">
                  <div className="flex flex-col mb-3">
                    <span className="text-[#C92127] font-bold text-lg leading-none mb-1">
                      {product.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-gray-400 text-[11px] line-through font-medium">
                      {product.oldPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  
                  {/* Modern Progress Bar */}
                  <div className="relative w-full h-[18px] bg-[#ffe0e0] rounded-full overflow-hidden flex items-center mt-2 border border-[#ffb3b3]">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff6b6b] to-[#C92127] transition-all duration-1000 ease-out" 
                      style={{ width: `${product.soldPercent === 0 ? 0 : Math.max(8, product.soldPercent)}%` }}
                    ></div>

                    {/* Fire icon and text over the progress bar */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 z-10">
                      {product.soldPercent >= 80 ? (
                        <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] flex items-center gap-1 tracking-wider uppercase">
                          🔥 Sắp cháy hàng
                        </span>
                      ) : (
                        <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] tracking-wide uppercase">
                          Đã bán {product.soldPercent}%
                        </span>
                      )}
                    </div>
                  </div>
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
            </SwiperSlide>
          ))}
          <SwiperNavButtons />
        </Swiper>
      </div>
    </div>
  );
}
