import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useWebSocket } from '../../context/WebSocketContext';
import SwiperNavButtons from '../common/SwiperNavButtons';
import 'swiper/css';
import 'swiper/css/pagination';

export default function HeroBanner() {
  const [mainBanners, setMainBanners] = useState([]);
  const [topSideBanners, setTopSideBanners] = useState([]);
  const [bottomSideBanners, setBottomSideBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
  const { lastUpdate } = useWebSocket();

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE_URL}/banners?t=${new Date().getTime()}`);
      if (res.data) {
        const main = res.data.filter(b => b.position === 'MAIN');
        const topSide = res.data.filter(b => b.position === 'SIDE_TOP');
        const bottomSide = res.data.filter(b => b.position === 'SIDE_BOTTOM');
        
        const oldSide = res.data.filter(b => b.position === 'SIDE');
        if (oldSide.length > 0) {
          oldSide.forEach((b, idx) => {
            if (idx % 2 === 0) topSide.push(b);
            else bottomSide.push(b);
          });
        }

        setMainBanners(main);
        setTopSideBanners(topSide);
        setBottomSideBanners(bottomSide);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBanners();
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WebSocket Listener
  useEffect(() => {
    if (lastUpdate && lastUpdate.entity === 'BANNER') {
      fetchBanners();
    }
    // fetchBanners is stable for this component's lifetime; only re-run on lastUpdate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdate]);

  const renderBannerImage = (banner, className) => {
    const img = (
      <img 
        src={banner.imageUrl} 
        alt={banner.title || 'Banner'} 
        className={className} 
      />
    );

    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http://') || banner.linkUrl.startsWith('https://')) {
        return (
          <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            {img}
          </a>
        );
      } else {
        return (
          <Link to={banner.linkUrl} className="block w-full h-full">
            {img}
          </Link>
        );
      }
    }
    return img;
  };

  return (
    <>
      {isLoading ? (
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[440px]">
          <div className="w-full lg:w-[70%] h-64 sm:h-80 lg:h-full rounded-xl overflow-hidden shadow-sm bg-gray-200 animate-pulse relative"></div>
          <div className="w-full lg:w-[30%] flex flex-row lg:flex-col gap-4 h-32 sm:h-44 lg:h-full">
            <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-gray-200 animate-pulse relative h-full"></div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-gray-200 animate-pulse relative h-full"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[440px]">
      <div className="w-full lg:w-[70%] h-64 sm:h-80 lg:h-full rounded-xl overflow-hidden shadow-sm bg-white relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {mainBanners.map((banner, index) => (
            <SwiperSlide key={index}>
              {renderBannerImage(banner, "w-full h-full object-cover")}
            </SwiperSlide>
          ))}
          <SwiperNavButtons />
        </Swiper>
      </div>

      <div className="w-full lg:w-[30%] flex flex-row lg:flex-col gap-4 h-32 sm:h-44 lg:h-full">
        {/* Banner phụ ô trên (Tự động chuyển động với delay 5s) */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-white relative h-full">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {topSideBanners.map((banner, index) => (
              <SwiperSlide key={index} className="h-full">
                {renderBannerImage(banner, "w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer")}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Banner phụ ô dưới (Tự động chuyển động với delay 6s lệch pha để đẹp mắt) */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm bg-white relative h-full">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            className="w-full h-full"
          >
            {bottomSideBanners.map((banner, index) => (
              <SwiperSlide key={index} className="h-full">
                {renderBannerImage(banner, "w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer")}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      </div>
      )}
    </>
  );
}
