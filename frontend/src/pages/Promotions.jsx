import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FaTicketAlt, FaPercent, FaBookmark, FaCopy, FaCheck, FaStar } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Promotions() {
  const [combos, setCombos] = useState([]);
  const [discounted, setDiscounted] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('all'); // all, combos, discounts, coupons
  const [copiedCode, setCopiedCode] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [combosRes, discountedRes, couponsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/books/combos`),
          axios.get(`${API_BASE_URL}/books/discounted`),
          axios.get(`${API_BASE_URL}/coupons`, { headers }).catch(() => ({ data: [] }))
        ]);

        const fetchedCombos = Array.isArray(combosRes.data) 
          ? combosRes.data 
          : (combosRes.data?.success ? combosRes.data.data : (combosRes.data?.content || []));
          
        const fetchedDiscounted = Array.isArray(discountedRes.data) 
          ? discountedRes.data 
          : (discountedRes.data?.success ? discountedRes.data.data : (discountedRes.data?.content || []));

        const fetchedCoupons = Array.isArray(couponsRes.data) 
          ? couponsRes.data 
          : (couponsRes.data?.success ? couponsRes.data.data : (couponsRes.data?.content || []));

        setCombos(fetchedCombos);
        setDiscounted(fetchedDiscounted);
        setCoupons(fetchedCoupons);
      } catch (error) {
        console.error('Error fetching promotion data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    localStorage.setItem('autoApplyCoupon', code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-12 pt-6">
      <Helmet>
        <title>Chương Trình Khuyến Mãi & Combo | YiYi Book</title>
        <meta name="description" content="Tổng hợp tất cả các chương trình khuyến mãi sách, combo sách giá rẻ, mã giảm giá và voucher quà tặng từ YiYi Book." />
      </Helmet>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Khuyến mãi & Combo</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-700 to-red-950 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-[-50px] right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[70px]"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/20">
              🎁
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
                Khuyến Mãi & Combo Đặc Biệt
              </h1>
              <p className="text-pink-100 text-sm mt-1">Săn deal sách tốt, tối ưu chi phí cùng ngập tràn quà tặng voucher</p>
            </div>
          </div>
          
          <div className="flex gap-3 relative z-10 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm">
            <span className="font-semibold text-gray-200">Giảm giá lên đến 50%</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white p-2 rounded-xl shadow-sm gap-2">
          {[
            { label: 'Tất cả ưu đãi', value: 'all' },
            { label: 'Combo sách hot', value: 'combos' },
            { label: 'Sách giảm giá', value: 'discounts' },
            { label: 'Mã giảm giá (Voucher)', value: 'coupons' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveSubTab(tab.value)}
              className={`py-2.5 px-5 rounded-lg text-sm font-bold transition-all ${activeSubTab === tab.value ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* 1. Coupons/Vouchers Section */}
            {(activeSubTab === 'all' || activeSubTab === 'coupons') && coupons.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <FaTicketAlt className="text-primary text-2xl" />
                  <h2 className="text-2xl font-black text-gray-800">Mã giảm giá cực sốc</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white rounded-2xl shadow-sm border border-red-100 flex overflow-hidden hover:shadow-md transition-shadow relative">
                      {/* Left dotted decoration */}
                      <div className="w-6 bg-gradient-to-b from-red-500 to-primary flex flex-col justify-between items-center py-4 text-white relative">
                        <div className="absolute top-1/2 left-[-6px] transform -translate-y-1/2 w-3 h-3 bg-gray-100 rounded-full"></div>
                        <div className="absolute top-1/2 right-[-6px] transform -translate-y-1/2 w-3 h-3 bg-gray-100 rounded-full"></div>
                        <FaPercent className="text-xs" />
                      </div>
                      
                      {/* Right info */}
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <span className="bg-red-50 text-primary text-[10px] font-black px-2 py-0.5 rounded">
                            {coupon.discountType === 'PERCENT' ? `Giảm ${coupon.discountValue}%` : `Giảm ${(coupon.discountValue || 0).toLocaleString('vi-VN')} đ`}
                          </span>
                          <h3 className="font-bold text-gray-800 text-base mt-2">{coupon.name || coupon.code}</h3>
                          <p className="text-gray-400 text-xs mt-1">Đơn tối thiểu: {(coupon.minOrderAmount || 0).toLocaleString('vi-VN')} đ</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                          <code className="text-sm font-mono font-bold text-primary bg-red-50 px-2 py-1 rounded">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="flex items-center gap-1.5 py-1 px-3 bg-primary text-white text-xs font-bold rounded hover:bg-red-700 transition"
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <FaCheck /> Đã sao chép
                              </>
                            ) : (
                              <>
                                <FaCopy /> Sao chép mã
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Combos Section */}
            {(activeSubTab === 'all' || activeSubTab === 'combos') && combos.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <FaBookmark className="text-[#C92127] text-2xl" />
                  <h2 className="text-2xl font-black text-gray-800">Combo Sách Mua Nhiều</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {combos.map((product) => (
                    <Link 
                      key={product.id}
                      to={`/book/${product.id}`}
                      className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative cursor-pointer"
                    >
                      <div className="absolute top-2 left-2 z-10 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-[10px] font-black px-2.5 py-1 rounded-tl-lg rounded-br-lg shadow-md border border-orange-400/30">
                        COMBO TIẾT KIỆM
                      </div>
                      
                      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-lg bg-gray-50">
                        <img 
                          src={product.imageUrl || 'https://placehold.co/150'} 
                          alt={product.title} 
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2" 
                        />
                      </div>
                      
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 h-[40px] leading-[20px] group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-[10px] ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount || 0})</span>
                      </div>

                      <div className="mt-auto pt-2 flex flex-col">
                        <span className="text-primary font-bold text-base sm:text-lg leading-none">
                          {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                        </span>
                        {product.oldPrice > 0 && (
                          <span className="text-gray-400 text-[10px] sm:text-[11px] font-medium line-through mt-1">
                            {product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') : '0'} đ
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, 1);
                          }}
                          className="w-full mt-3 py-1.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-red-700 transition"
                        >
                          Thêm giỏ hàng
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Discounted Section */}
            {(activeSubTab === 'all' || activeSubTab === 'discounts') && discounted.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <FaPercent className="text-rose-600 text-2xl" />
                  <h2 className="text-2xl font-black text-gray-800">Sách giảm giá cực mạnh</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {discounted.slice(0, 12).map((product) => (
                    <Link 
                      key={product.id}
                      to={`/book/${product.id}`}
                      className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative cursor-pointer"
                    >
                      <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-tl-lg rounded-br-lg shadow-md border border-red-400/30">
                        Giảm {product.discount}%
                      </div>
                      
                      <div className="relative pt-[100%] mb-3 overflow-hidden rounded-lg bg-gray-50">
                        <img 
                          src={product.imageUrl || 'https://placehold.co/150'} 
                          alt={product.title} 
                          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2" 
                        />
                      </div>
                      
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 mb-1 h-[40px] leading-[20px] group-hover:text-primary transition-colors">
                        {product.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={`text-[10px] ${i < Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount || 0})</span>
                      </div>

                      <div className="mt-auto pt-2 flex flex-col">
                        <span className="text-primary font-bold text-base sm:text-lg leading-none">
                          {product.price ? product.price.toLocaleString('vi-VN') : '0'} đ
                        </span>
                        {product.oldPrice > 0 && (
                          <span className="text-gray-400 text-[10px] sm:text-[11px] font-medium line-through mt-1">
                            {product.oldPrice ? product.oldPrice.toLocaleString('vi-VN') : '0'} đ
                          </span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product, 1);
                          }}
                          className="w-full mt-3 py-1.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-red-700 transition"
                        >
                          Thêm giỏ hàng
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
