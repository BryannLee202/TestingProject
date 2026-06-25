import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaBook, FaBookOpen, FaBookmark } from 'react-icons/fa';

export default function Intro({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if user already saw intro in this session
    const hasSeenIntro = sessionStorage.getItem('yiyi_intro_seen');
    if (hasSeenIntro) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }
    
    // Prevent scrolling when intro is visible
    document.body.style.overflow = 'hidden';

    // 10 seconds loading for the bottom progress bar
    const loadingDuration = 10000; 
    const intervalTime = 50;
    const steps = loadingDuration / intervalTime;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(progressInterval);
        handleEnter();
      }
    }, intervalTime);

    return () => {
      clearInterval(progressInterval);
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
      <style>{`
        @keyframes expandLine {
          0% { width: 0; opacity: 0; }
          100% { width: 4rem; opacity: 1; }
        }
        .animate-expand-line {
          animation: expandLine 1.5s cubic-bezier(0.7,0,0.3,1) forwards;
        }
        @keyframes expandLineDelayed {
          0% { width: 0; opacity: 0; }
          100% { width: 4rem; opacity: 1; }
        }
        .animate-expand-line-delayed {
          animation: expandLineDelayed 1.5s cubic-bezier(0.7,0,0.3,1) 1s forwards;
        }
      `}</style>

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

      <div className="relative z-10 flex flex-col items-center justify-center w-full mt-[-10vh]">
        
        {/* Top small text with lines */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-[1px] bg-gray-500/50 w-0 animate-expand-line"></div>
          <div className="text-gray-400 text-[10px] md:text-xs tracking-[0.4em] uppercase font-light opacity-0 animate-[fadeInDown_1s_ease-out_0.5s_forwards]">
            Y I Y I · B O O K S T O R E
          </div>
        </div>

        {/* Main Logo (Serif font) */}
        <div className="mt-8 mb-6 flex items-center opacity-0 animate-[fadeInUp_1.2s_ease-out_0.3s_forwards]">
          <span className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gray-100 tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">YiYi</span>
          <span className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-[#C92127] tracking-wider drop-shadow-[0_0_25px_rgba(201,33,39,0.6)] ml-3">Book</span>
        </div>

        {/* Subtitles */}
        <div className="flex flex-col items-center gap-3 opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
          <div className="text-gray-300 tracking-[0.2em] font-medium text-sm md:text-base uppercase text-center">
            Nhà sách & Văn phòng phẩm
          </div>
          <div className="text-gray-500 tracking-widest font-light text-xs md:text-sm text-center">
            Đọc để yêu thương
          </div>
          <div className="h-[1px] bg-gray-500/50 mt-4 w-0 animate-expand-line-delayed"></div>
        </div>
      </div>

      {/* Enter Site Section with Button */}
      <div className="absolute bottom-16 flex flex-col items-center justify-center opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards] z-20">
        {/* Vertical animated line */}
        <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#C92127] to-transparent mb-6 animate-pulse"></div>
        
        {/* Circle Button */}
        <button 
          onClick={handleEnter}
          translate="no"
          className="notranslate group flex flex-col items-center justify-center gap-4 hover:scale-110 transition-transform duration-300 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full border border-[#C92127]/40 bg-[#C92127]/10 flex items-center justify-center text-[#C92127] group-hover:border-[#C92127] group-hover:bg-[#C92127]/30 transition-all shadow-[0_0_15px_rgba(201,33,39,0.3)] animate-bounce">
            <FaChevronDown className="mt-1 text-sm" />
          </div>
          <span className="text-[#C92127] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">ENTER SITE</span>
        </button>
      </div>

      {/* Full-width Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 z-30">
        <div 
          className="h-full bg-gradient-to-r from-[#C92127] to-red-500 transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(201,33,39,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
