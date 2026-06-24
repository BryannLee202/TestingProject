import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaBook, FaBookOpen, FaBookmark } from 'react-icons/fa';

export default function Intro({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if user already saw intro in this session
    const hasSeenIntro = sessionStorage.getItem('yiyi_intro_seen');
    if (hasSeenIntro) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }
    
    // Auto remove after 10s as a fallback
    const timer = setTimeout(() => {
      handleEnter();
    }, 10000);
    
    // Prevent scrolling when intro is visible
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleEnter = () => {
    setIsAnimatingOut(true);
    sessionStorage.setItem('yiyi_intro_seen', 'true');
    setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
      if (onComplete) onComplete();
    }, 1000); // Wait for slide-up animation to finish
  };

  if (!isVisible) return null;

  const backgroundBooks = [
    { Icon: FaBook, size: 140, top: '10%', left: '5%', rotate: -15, opacity: 0.12 },
    { Icon: FaBookOpen, size: 250, top: '15%', left: '75%', rotate: 25, opacity: 0.08 },
    { Icon: FaBookmark, size: 100, top: '65%', left: '12%', rotate: -10, opacity: 0.15 },
    { Icon: FaBook, size: 180, top: '75%', left: '70%', rotate: 10, opacity: 0.12 },
    { Icon: FaBookOpen, size: 200, top: '-5%', left: '35%', rotate: 5, opacity: 0.10 },
    { Icon: FaBook, size: 300, top: '40%', left: '-10%', rotate: 45, opacity: 0.06 },
    { Icon: FaBookmark, size: 120, top: '85%', left: '45%', rotate: -20, opacity: 0.14 },
    { Icon: FaBookOpen, size: 350, top: '45%', left: '85%', rotate: -15, opacity: 0.05 },
    { Icon: FaBook, size: 160, top: '30%', left: '20%', rotate: 30, opacity: 0.09 },
    { Icon: FaBookOpen, size: 120, top: '55%', left: '60%', rotate: -25, opacity: 0.12 },
  ];

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#080202] flex flex-col items-center justify-center transition-transform duration-1000 ease-[cubic-bezier(0.7,0,0.3,1)] ${isAnimatingOut ? '-translate-y-full' : 'translate-y-0'}`}
    >
      {/* Background pattern / subtle glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow in the center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C92127]/20 rounded-full blur-[100px]"></div>
        
        {/* Books Background Pattern */}
        {backgroundBooks.map((el, index) => (
          <el.Icon 
            key={index}
            className="absolute text-[#C92127]"
            style={{
              fontSize: el.size,
              top: el.top,
              left: el.left,
              transform: `rotate(${el.rotate}deg)`,
              opacity: el.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center mt-[-10vh]">
        {/* Main Logo */}
        <div className="flex items-center gap-2 mb-4 animate-[fadeInUp_1s_ease-out_forwards]">
          <span className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-100 tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">YiYi</span>
          <span className="text-5xl md:text-7xl lg:text-8xl font-black text-[#C92127] tracking-tight drop-shadow-[0_0_25px_rgba(201,33,39,0.6)]">Book</span>
        </div>

        {/* Subtitle / Slogan */}
        <div className="text-gray-400 tracking-[0.4em] font-light text-xs md:text-lg uppercase opacity-0 animate-[fadeInUp_1.2s_ease-out_0.5s_forwards]">
          Đọc để Yêu thương
        </div>
      </div>

      {/* Enter Site Section */}
      <div className="absolute bottom-16 flex flex-col items-center justify-center opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
        {/* Vertical animated line */}
        <div className="h-20 w-[1px] bg-gradient-to-b from-transparent via-[#C92127] to-transparent mb-6 animate-pulse"></div>
        
        {/* Circle Button */}
        <button 
          onClick={handleEnter}
          translate="no"
          className="notranslate group flex flex-col items-center justify-center gap-4 hover:scale-110 transition-transform duration-300"
        >
          <div className="w-12 h-12 rounded-full border border-[#C92127]/40 bg-[#C92127]/10 flex items-center justify-center text-[#C92127] group-hover:border-[#C92127] group-hover:bg-[#C92127]/30 transition-all shadow-[0_0_15px_rgba(201,33,39,0.3)]">
            <FaChevronDown className="animate-bounce mt-1 text-sm" />
          </div>
          <span className="text-[#C92127] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">ENTER SITE</span>
        </button>
      </div>
    </div>
  );
}
