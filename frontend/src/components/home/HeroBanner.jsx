import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroBanner() {
  const mainBanners = [
    'https://cdn0.fahasa.com/media/magentothem/banner7/Banner-Manga-thang-05_840x320.jpg',
    'https://cdn0.fahasa.com/media/magentothem/banner7/Ngoai-Van-T5-Slide_840x320.jpg',
    'https://cdn0.fahasa.com/media/magentothem/banner7/Trang-Do-choi-Slide_840x320.jpg',
  ];

  const sideBanners = [
    'https://cdn0.fahasa.com/media/magentothem/banner7/Fahasa_deal_392x156.jpg',
    'https://cdn0.fahasa.com/media/magentothem/banner7/VNPAY_392x156.jpg',
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-80">
      <div className="w-full lg:w-[70%] h-48 sm:h-64 lg:h-full rounded-xl overflow-hidden shadow-sm bg-white">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {mainBanners.map((src, index) => (
            <SwiperSlide key={index}>
              <img src={src} alt={`Main Banner ${index + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
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
