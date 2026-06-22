import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import axios from 'axios';
import SwiperNavButtons from '../common/SwiperNavButtons';
import 'swiper/css';
import 'swiper/css/pagination';

export default function HeroBanner() {
  const [mainBanners, setMainBanners] = useState([
    'https://placehold.co/840x320/007bff/ffffff?text=Banner+Chinh+1',
    'https://placehold.co/840x320/28a745/ffffff?text=Banner+Chinh+2',
    'https://placehold.co/840x320/dc3545/ffffff?text=Banner+Chinh+3',
  ]);

  const [sideBanners, setSideBanners] = useState([
    'https://placehold.co/392x156/ffc107/000000?text=Banner+Phu+1',
    'https://placehold.co/392x156/17a2b8/ffffff?text=Banner+Phu+2',
  ]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/banners`);
        if (res.data && res.data.length > 0) {
          const main = res.data.filter(b => b.position === 'MAIN').map(b => b.imageUrl);
          const side = res.data.filter(b => b.position === 'SIDE').map(b => b.imageUrl);
          if (main.length > 0) setMainBanners(main);
          if (side.length > 0) setSideBanners(side);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };
    fetchBanners();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-80">
      <div className="w-full lg:w-[70%] h-48 sm:h-64 lg:h-full rounded-xl overflow-hidden shadow-sm bg-white relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {mainBanners.map((src, index) => (
            <SwiperSlide key={index}>
              <img src={src} alt={`Main Banner ${index + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
          <SwiperNavButtons />
        </Swiper>
      </div>

      <div className="w-full lg:w-[30%] flex flex-row lg:flex-col gap-4 h-24 sm:h-32 lg:h-full">
        {sideBanners.map((src, index) => (
          <div key={index} className="flex-1 rounded-xl overflow-hidden shadow-sm bg-white">
            <img src={src} alt={`Side Banner ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}
