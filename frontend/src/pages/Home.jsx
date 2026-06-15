import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeroBanner from '../components/home/HeroBanner';
import QuickLinks from '../components/home/QuickLinks';
import FlashSale from '../components/home/FlashSale';
import TrendingCategories from '../components/home/TrendingCategories';
import ProductSection from '../components/home/ProductSection';
import PartnerBrands from '../components/home/PartnerBrands';
import BestSellerRank from '../components/home/BestSellerRank';
import ComboTrending from '../components/home/ComboTrending';
import PersonalizedSuggestions from '../components/home/PersonalizedSuggestions';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [activeSectionTab, setActiveSectionTab] = useState('Mới Nhất');
  const [sectionProducts, setSectionProducts] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const userId = user ? user.id : 0; // use 0 or null for guest

        const [bestsellerRes, comboRes, recommendRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/books/bestsellers`),
          axios.get(`${API_BASE_URL}/books/combos`),
          axios.get(`${API_BASE_URL}/books/recommendations/${userId}`)
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
    const fetchSectionProducts = async () => {
      setSectionLoading(true);
      try {
        let endpoint = '/books/latest';
        if (activeSectionTab === 'Bán Chạy') {
          endpoint = '/books/bestsellers';
        } else if (activeSectionTab === 'Giảm Giá') {
          endpoint = '/books/discounted';
        }
        const res = await axios.get(`${API_BASE_URL}${endpoint}`);
        setSectionProducts(res.data);
      } catch (error) {
        console.error('Error fetching section products:', error);
      } finally {
        setSectionLoading(false);
      }
    };

    fetchSectionProducts();
  }, [activeSectionTab]);

  return (
    <div className="bg-gray-100 pb-10 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col gap-6">
        <HeroBanner />
        <QuickLinks />
        <FlashSale />
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {recommendations.length > 0 && <PersonalizedSuggestions data={recommendations} />}
            {bestSellers.length > 0 && <BestSellerRank data={bestSellers} />}
            {combos.length > 0 && <ComboTrending data={combos} />}
          </>
        )}

        <TrendingCategories />
        
        <ProductSection 
          title="Sách Mới Nổi Bật" 
          tabs={['Mới Nhất', 'Bán Chạy', 'Giảm Giá']} 
          products={sectionProducts}
          activeTab={activeSectionTab}
          onTabChange={setActiveSectionTab}
          loading={sectionLoading}
        />
        
        <PartnerBrands />
      </div>
    </div>
  );
}
