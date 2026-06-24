import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-28 right-6 p-3 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-gray-50 hover:text-primary hover:-translate-y-1 hover:shadow-xl transition-all duration-300 z-50 group flex items-center justify-center w-12 h-12"
      aria-label="Scroll to top"
    >
      <FaArrowUp className="text-xl group-hover:scale-110 transition-transform" />
    </button>
  );
}
