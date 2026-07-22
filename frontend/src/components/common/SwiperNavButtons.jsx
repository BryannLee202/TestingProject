import React from 'react';
import { useSwiper } from 'swiper/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function SwiperNavButtons() {
  const swiper = useSwiper();

  return (
    <>
      <div 
        className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/10 backdrop-blur-sm border border-white/80 flex items-center justify-center hover:bg-white hover:border-white hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        onClick={() => swiper.slidePrev()}
      >
        <LuChevronLeft 
          strokeWidth={2.5} 
          className="text-white group-hover:text-[#0F172A] text-[18px] md:text-[20px] group-hover:-translate-x-0.5 transition-all duration-200 drop-shadow-sm group-hover:drop-shadow-none" 
        />
      </div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-30 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/10 backdrop-blur-sm border border-white/80 flex items-center justify-center hover:bg-white hover:border-white hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer group"
        onClick={() => swiper.slideNext()}
      >
        <LuChevronRight 
          strokeWidth={2.5} 
          className="text-white group-hover:text-[#0F172A] text-[18px] md:text-[20px] group-hover:translate-x-0.5 transition-all duration-200 drop-shadow-sm group-hover:drop-shadow-none" 
        />
      </div>
    </>
  );
}
