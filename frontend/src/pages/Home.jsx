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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [bestSellers, setBestSellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

        if (bestsellerRes.data.success) setBestSellers(bestsellerRes.data.data);
        if (comboRes.data.success) setCombos(comboRes.data.data);
        if (recommendRes.data.success) setRecommendations(recommendRes.data.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [user]);

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
          products={[
            { id: 1, title: 'Đắc Nhân Tâm', price: 68000, oldPrice: 80000, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg', rating: 5 },
            { id: 2, title: 'Nhà Giả Kim', price: 55000, oldPrice: 79000, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg', rating: 4 },
            { id: 3, title: 'Hành Trình Về Phương Đông', price: 90000, oldPrice: 120000, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg', rating: 5 },
            { id: 4, title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', price: 75000, oldPrice: 95000, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg', rating: 5 },
            { id: 5, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', price: 60000, oldPrice: 85000, img: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_3609.jpg', rating: 4 },
          ]}
        />
        
        <PartnerBrands />
      </div>
    </div>
  );
}
