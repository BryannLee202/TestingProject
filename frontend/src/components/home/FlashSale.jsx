import React, { useState, useEffect } from 'react';
import { FaBolt, FaChevronRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'swiper/css';
import 'swiper/css/navigation';
import { useCart } from '../../context/CartContext';

export default function FlashSale() {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 30 });
  const [flashSaleProducts, setFlashSaleProducts] = useState([
    { id: 1, title: 'Sách giáo khoa Toán lớp 1', price: 15000, oldPrice: 20000, discount: 25, soldPercent: 85, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg' },
    { id: 2, title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh (Tái Bản)', price: 75000, oldPrice: 105000, discount: 28, soldPercent: 50, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg' },
    { id: 3, title: 'Nhà Giả Kim - The Alchemist', price: 55000, oldPrice: 79000, discount: 30, soldPercent: 90, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg' },
    { id: 4, title: 'Đắc Nhân Tâm', price: 60000, oldPrice: 86000, discount: 30, soldPercent: 70, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg' },
  ]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

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
    <div className="bg-red-50 rounded-xl overflow-hidden shadow-sm border border-red-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-400 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
            <FaBolt className="text-yellow-300" /> Flash Sale
          </h2>
          <div className="flex items-center gap-1.5 text-red-600 font-mono text-sm sm:text-base font-bold">
            <span className="bg-white rounded px-2 py-1 shadow-sm">{formatTime(timeLeft.hours)}</span>
            <span className="text-white">:</span>
            <span className="bg-white rounded px-2 py-1 shadow-sm">{formatTime(timeLeft.minutes)}</span>
            <span className="text-white">:</span>
            <span className="bg-white rounded px-2 py-1 shadow-sm">{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>
        <Link to="/flash-sale" className="text-white hover:text-yellow-200 font-medium flex items-center gap-1 group text-sm">
          Xem tất cả <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Product Slider */}
      <div className="p-4 sm:p-5 bg-white">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2.2}
          navigation
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
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
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
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px] leading-tight group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                
                {/* Price */}
                <div className="mt-auto">
                  <div className="flex flex-col mb-3">
                    <span className="text-primary font-bold text-lg leading-none mb-1">
                      {product.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-gray-400 text-xs line-through">
                      {product.oldPrice.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative w-full h-[18px] bg-[#ffbda6] rounded-full overflow-hidden flex items-center justify-center mt-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff3300] to-[#ff7a00]" 
                      style={{ width: `${Math.max(5, product.soldPercent)}%` }}
                    ></div>
                    <span className="relative z-10 text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                      Đã bán {product.soldPercent}%
                    </span>
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
        </Swiper>
      </div>
    </div>
  );
}
