import React from 'react';
import Banner from '../components/home/Banner';
import PromoGrid from '../components/home/PromoGrid';
import UtilityIcons from '../components/home/UtilityIcons';
import FlashSale from '../components/home/FlashSale';
import DailySuggestions from '../components/home/DailySuggestions';
import Sidebar from '../components/Sidebar';
import ProductSection from '../components/home/ProductSection';

export default function Home() {
  return (
    <div className="pb-16">
      <Banner />
      <PromoGrid />
      <UtilityIcons />
      <FlashSale />
      <DailySuggestions />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-12 border-t border-gray-200">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <ProductSection />
        </div>
      </div>
    </div>
  );
}
