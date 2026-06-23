import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeroBanner from '../components/home/HeroBanner';
import FeaturedBooksSection from '../components/home/FeaturedBooksSection';
import QuickLinks from '../components/home/QuickLinks';
import FlashSale from '../components/home/FlashSale';
import BestSellersByCategory from '../components/home/BestSellersByCategory';
import ProductSection from '../components/home/ProductSection';
import PartnerBrands from '../components/home/PartnerBrands';
import ComboTrending from '../components/home/ComboTrending';
import PersonalizedSuggestions from '../components/home/PersonalizedSuggestions';
import FahasaSimpleSection from '../components/home/FahasaSimpleSection';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [activeBookTab, setActiveBookTab] = useState('Tất cả');
  const [bookProducts, setBookProducts] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);

  const [activeOtherTab, setActiveOtherTab] = useState('Tất cả');
  const [otherProducts, setOtherProducts] = useState([]);
  const [otherLoading, setOtherLoading] = useState(false);

  const nonBookCategories = ['Văn phòng phẩm', 'Đồ chơi', 'Quà lưu niệm', 'Bách hóa'];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const userId = user ? user.id : 0; // use 0 or null for guest
        const lastCategoryId = localStorage.getItem('lastViewedCategoryId');
        const recommendUrl = lastCategoryId 
            ? `${API_BASE_URL}/books/recommendations/${userId}?categoryId=${lastCategoryId}`
            : `${API_BASE_URL}/books/recommendations/${userId}`;

        const [bestsellerRes, comboRes, recommendRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/books/bestsellers`),
          axios.get(`${API_BASE_URL}/books/combos`),
          axios.get(recommendUrl)
        ]);

        if (Array.isArray(bestsellerRes.data)) {
          setBestSellers(bestsellerRes.data);
        } else if (bestsellerRes.data?.success) {
          setBestSellers(bestsellerRes.data.data);
        }

        if (Array.isArray(comboRes.data)) {
          setCombos(comboRes.data);
        } else if (comboRes.data?.success) {
          setCombos(comboRes.data.data);
        }

        if (Array.isArray(recommendRes.data)) {
          setRecommendations(recommendRes.data);
        } else if (recommendRes.data?.success) {
          setRecommendations(recommendRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [user]);

  useEffect(() => {
    const fetchBookProducts = async () => {
      setBookLoading(true);
      try {
        let endpoint = '/books/latest';
        if (activeBookTab === 'Bán Chạy') {
          endpoint = '/books/bestsellers';
        } else if (activeBookTab === 'Giảm Giá') {
          endpoint = '/books/discounted';
        }
        const res = await axios.get(`${API_BASE_URL}${endpoint}`);
        let finalData = res.data;
        if (activeBookTab === 'Tất cả') {
          // Shuffle only for the 'Tất cả' tab to keep other lists correctly ordered
          finalData = [...res.data].sort(() => 0.5 - Math.random());
        }
        setBookProducts(finalData.filter(p => !nonBookCategories.includes(p.category?.name)).slice(0, 50));
      } catch (error) {
        console.error('Error fetching book products:', error);
      } finally {
        setBookLoading(false);
      }
    };

    fetchBookProducts();
  }, [activeBookTab]);

  useEffect(() => {
    const fetchOtherProducts = async () => {
      setOtherLoading(true);
      try {
        let endpoint = '/books/latest';
        if (activeOtherTab === 'Bán Chạy') {
          endpoint = '/books/bestsellers';
        } else if (activeOtherTab === 'Giảm Giá') {
          endpoint = '/books/discounted';
        }
        const res = await axios.get(`${API_BASE_URL}${endpoint}`);
        let finalData = res.data;
        if (activeOtherTab === 'Tất cả') {
          // Shuffle only for the 'Tất cả' tab to keep other lists correctly ordered
          finalData = [...res.data].sort(() => 0.5 - Math.random());
        }
        setOtherProducts(finalData.filter(p => nonBookCategories.includes(p.category?.name)).slice(0, 50));
      } catch (error) {
        console.error('Error fetching other products:', error);
      } finally {
        setOtherLoading(false);
      }
    };

    fetchOtherProducts();
  }, [activeOtherTab]);

  return (
    <div className="bg-gray-100 pb-10 min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col gap-6">
        <HeroBanner />
        <QuickLinks />
        <FeaturedBooksSection />
        <FlashSale />
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {recommendations.length > 0 && <PersonalizedSuggestions data={recommendations} maxRows={1} />}
            {combos.length > 0 && <ComboTrending data={combos} />}
          </>
        )}

        <BestSellersByCategory />
        
        <ProductSection 
          title="Khám Phá Sách" 
          tabs={['Tất cả', 'Mới Nhất', 'Bán Chạy', 'Giảm Giá']} 
          products={bookProducts}
          activeTab={activeBookTab}
          onTabChange={setActiveBookTab}
          loading={bookLoading}
        />

        {otherProducts.length > 0 && (
          <ProductSection 
            title="Khám Phá Sản Phẩm Khác" 
            tabs={['Tất cả', 'Mới Nhất', 'Bán Chạy', 'Giảm Giá']} 
            products={otherProducts}
            activeTab={activeOtherTab}
            onTabChange={setActiveOtherTab}
            loading={otherLoading}
          />
        )}
        
        <FahasaSimpleSection 
          title="GỢI Ý CHO BẠN" 
          data={otherProducts} 
          maxItems={10} 
        />
        
        <FahasaSimpleSection 
          title="XU HƯỚNG TÌM KIẾM" 
          data={bookProducts} 
          maxItems={10} 
        />
        
        <PartnerBrands />
      </div>
    </div>
  );
}
