import React, { useState } from 'react';
import { FaHandHoldingHeart, FaJournalWhills, FaPenNib, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function DailySuggestions() {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', icon: <FaHandHoldingHeart />, label: 'Dành cho bạn' },
    { id: 'hot', icon: <img src="https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/ico_deal_hot.png" className="w-5 h-5 inline-block mr-1" alt="hot"/>, label: 'Sách Hot' },
    { id: 'manga', icon: <FaJournalWhills />, label: 'Manga' },
    { id: 'vanhoc', icon: <FaPenNib />, label: 'Văn Học' },
  ];

  return (
    <section className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <span className="text-orange-500 text-2xl">✨</span> GỢI Ý HÔM NAY
          </h2>
          <div className="flex flex-wrap gap-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 border-primary text-primary' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {typeof tab.icon === 'string' ? null : tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Placeholder grid for books */}
          {[1,2,3,4,5,6,7,8,9,10].map(item => (
            <div key={item} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="relative pt-[100%] mb-3 overflow-hidden">
                <img src={`https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg`} alt="Book" className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">Sách gợi ý {item} - {activeTab}</h3>
              <div className="flex flex-col">
                <span className="text-primary font-bold text-lg">75.000 đ</span>
                <span className="text-gray-400 text-xs line-through">120.000 đ</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/daily-suggestions" className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors">
            Xem tất cả <FaChevronRight className="text-sm" />
          </Link>
        </div>
      </div>
    </section>
  );
}
