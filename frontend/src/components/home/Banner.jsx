import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Banner() {
  const banners = [
    'https: //cdn0.fahasa.com/media/magentothem/banner7/Banner-Manga-thang-05_840x320.jpg',
    'https://cdn0.fahasa.com/media/magentothem/banner7/Ngoai-Van-T5-Slide_840x320.jpg',
    'https://cdn0.fahasa.com/media/magentothem/banner7/Trang-Do-choi-Slide_840x320.jpg',
  ];

  return (
    <section className="mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-xl overflow-hidden shadow-sm">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full h-auto aspect-[21/8]"
        >
          {banners.map((src, index) => (
            <SwiperSlide key={index}>
              <img src={src} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
