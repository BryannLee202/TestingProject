import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaTicketAlt, FaInfoCircle, FaTruck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { showNotification } from '../utils/alert';
import PersonalizedSuggestions from '../components/home/PersonalizedSuggestions';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  // On mount or when cart changes, initialize selected items
  useEffect(() => {
    // If we want to auto-select all by default:
    // setSelectedItems(cart.map(i => i.id));
    
    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/coupons`, {
          headers: localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
        });
        const fetchedCoupons = res.data || [];
        setCoupons(fetchedCoupons);
        
        // Auto apply coupon if navigated from Coupons page
        const savedCouponCode = localStorage.getItem('autoApplyCoupon');
        if (savedCouponCode) {
          const couponToApply = fetchedCoupons.find(c => c.code === savedCouponCode);
          if (couponToApply) {
            setAppliedCoupon(couponToApply);
            showNotification('Thành công', `Đã áp dụng mã "${savedCouponCode}".`, 'success');
          }
          localStorage.removeItem('autoApplyCoupon');
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    fetchCoupons();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = user ? user.id : 0;
        const lastCategoryId = localStorage.getItem('lastViewedCategoryId');
        const recommendUrl = lastCategoryId 
            ? `${API_BASE_URL}/books/recommendations/${userId}?categoryId=${lastCategoryId}`
            : `${API_BASE_URL}/books/recommendations/${userId}`;
            
        const res = await axios.get(recommendUrl);
        if (Array.isArray(res.data)) {
          setRecommendations(res.data);
        } else if (res.data?.success) {
          setRecommendations(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    fetchRecommendations();
  }, [user, API_BASE_URL]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      showNotification('Thông báo', 'Vui lòng chọn sản phẩm cần xóa', 'warning');
      return;
    }
    
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Bạn có chắc chắn muốn xóa ${selectedItems.length === cart.length ? 'tất cả' : selectedItems.length} sản phẩm đã chọn khỏi giỏ hàng?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C92127',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Có, xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      if (selectedItems.length === cart.length) {
        await clearCart();
      } else {
        // Delete one by one since context doesn't have a bulk delete
        for (const id of selectedItems) {
          await removeFromCart(id);
        }
      }
      setSelectedItems([]);
      showNotification('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng', 'success');
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectedCart = cart.filter(item => selectedItems.includes(item.id));
  const total = selectedCart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  const totalOldPrice = selectedCart.reduce((acc, item) => acc + ((item.oldPrice || item.price) * item.quantity), 0);
  const maxAllowedDiscount = totalOldPrice * 0.5;
  const currentProductDiscount = totalOldPrice - total;
  let remainingMaxDiscount = Math.max(0, maxAllowedDiscount - currentProductDiscount);

  const userAcc = user?.accumulatedPoints || 0;
  let vipDiscountRate = 0;
  if (userAcc >= 100000) vipDiscountRate = 0.10;
  else if (userAcc >= 30000) vipDiscountRate = 0.05;
  else if (userAcc >= 5000) vipDiscountRate = 0.02;

  let vipDiscountAmount = total * vipDiscountRate;
  if (vipDiscountAmount > remainingMaxDiscount) {
    vipDiscountAmount = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
  }
  remainingMaxDiscount -= vipDiscountAmount;

  // Auto-remove coupon if conditions are no longer met
  if (appliedCoupon && total < appliedCoupon.minOrderAmount) {
    setAppliedCoupon(null);
  }

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      couponDiscountAmount = total * (appliedCoupon.discountValue / 100);
      if (appliedCoupon.maxDiscountAmount > 0 && couponDiscountAmount > appliedCoupon.maxDiscountAmount) {
        couponDiscountAmount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      couponDiscountAmount = appliedCoupon.discountValue;
    }
  }

  let actualCouponDiscount = couponDiscountAmount;
  if (actualCouponDiscount > remainingMaxDiscount) {
    actualCouponDiscount = remainingMaxDiscount > 0 ? remainingMaxDiscount : 0;
  }
  
  const finalTotal = total - vipDiscountAmount - actualCouponDiscount;

  const handleApplyCoupon = (coupon) => {
    if (appliedCoupon?.id === coupon.id) {
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(coupon);
      showNotification('Thành công', `Đã áp dụng mã "${coupon.code}".`, 'success');
    }
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn sản phẩm',
        text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán.',
        confirmButtonColor: '#C92127'
      });
    }
    
    if (!user) {
      return Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu đăng nhập',
        text: 'Vui lòng đăng nhập để tiến hành thanh toán.',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Đóng',
        confirmButtonColor: '#C92127'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
    }

    // Pass the selected item IDs and applied coupon to Checkout
    navigate('/checkout', { state: { selectedItems, appliedCoupon } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 pb-10 pt-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaShoppingCart className="text-6xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn còn trống</h2>
            <p className="text-gray-500 mb-6 text-center">Hãy chọn thêm sản phẩm và quay lại đây nhé!</p>
            <Link 
              to="/" 
              className="bg-[#C92127] text-white font-bold py-3 px-8 rounded-lg hover:bg-red-800 transition-colors"
            >
              TIẾP TỤC MUA SẮM
            </Link>
          </div>
          
          {recommendations.length > 0 && (
            <div className="mt-8">
              <PersonalizedSuggestions data={recommendations} maxRows={2} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 pt-6 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">GIỎ HÀNG <span className="text-lg font-normal normal-case text-gray-500">({cart.length} sản phẩm)</span></h1>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left: Cart Items */}
          <div className="w-full lg:w-[70%]">
            
            {/* Header Row */}
            <div className="bg-white rounded-xl shadow-sm mb-4 px-4 py-3 flex items-center text-sm font-semibold text-gray-700">
              <div className="flex items-center flex-1">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#C92127] border-gray-300 rounded focus:ring-[#C92127] cursor-pointer"
                  checked={selectedItems.length === cart.length && cart.length > 0}
                  onChange={handleSelectAll}
                />
                <span className="ml-3">Chọn tất cả ({cart.length} sản phẩm)</span>
              </div>
              <div className="w-24 text-center hidden md:block text-gray-500">Số lượng</div>
              <div className="w-32 text-right hidden md:block text-gray-500">Thành tiền</div>
              <div className="w-10 flex justify-center">
                <button 
                  onClick={handleDeleteSelected}
                  title="Xóa sản phẩm đã chọn"
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors">
                  
                  {/* Left part: Checkbox + Image + Info */}
                  <div className="flex flex-1 items-start gap-3">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 mt-3 text-[#C92127] border-gray-300 rounded focus:ring-[#C92127] cursor-pointer"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    <Link to={`/book/${item.id}`} className="shrink-0 block border border-gray-200 rounded p-1 bg-white">
                      <img 
                        src={item.image_url || item.img || 'https://placehold.co/100'} 
                        alt={item.title} 
                        className="w-20 h-24 object-contain"
                      />
                    </Link>
                    <div className="flex flex-col flex-1 pt-1">
                      <Link to={`/book/${item.id}`} className="text-sm font-medium text-gray-800 hover:text-[#C92127] line-clamp-2 leading-snug">
                        {item.title}
                      </Link>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-gray-800">{item.price ? item.price.toLocaleString('vi-VN') : '0'} đ</span>
                        {item.oldPrice > 0 && item.oldPrice > item.price && (
                          <span className="text-xs text-gray-400 line-through">{item.oldPrice.toLocaleString('vi-VN')} đ</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right part: Quantity, Subtotal, Delete */}
                  <div className="flex items-center justify-between md:justify-end gap-6 ml-7 md:ml-0">
                    
                    {/* Quantity Control */}
                    <div className="w-24 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded bg-white w-full h-8">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 flex justify-center items-center text-gray-500 hover:bg-gray-100 h-full transition-colors"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <input 
                          type="text" 
                          value={item.quantity}
                          readOnly
                          className="w-8 text-center text-sm font-semibold border-x border-gray-300 h-full focus:outline-none"
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 flex justify-center items-center text-gray-500 hover:bg-gray-100 h-full transition-colors"
                        >
                          <FaPlus className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="w-32 text-right hidden md:block font-bold text-[#C92127]">
                      {item.price ? (item.price * item.quantity).toLocaleString('vi-VN') : '0'} đ
                    </div>

                    {/* Delete Icon */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 flex justify-center items-center text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                      title="Xóa sản phẩm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  {/* Subtotal for Mobile */}
                  <div className="md:hidden flex justify-between items-center ml-7 mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Thành tiền:</span>
                    <span className="font-bold text-[#C92127]">{item.price ? (item.price * item.quantity).toLocaleString('vi-VN') : '0'} đ</span>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-24 space-y-4">
              
              {/* Promotions / Vouchers */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 text-[#2489F4] font-semibold text-sm">
                    <FaTicketAlt /> <span>KHUYẾN MÃI</span>
                  </div>
                  <Link to="/coupons" className="text-xs text-gray-500 hover:text-[#2489F4] transition-colors">Xem thêm &gt;</Link>
                </div>
                
                {coupons.slice(0, 2).map((coupon) => {
                  const isEligible = total >= coupon.minOrderAmount;
                  const shortfall = coupon.minOrderAmount - total;
                  const title = coupon.discountType === 'PERCENTAGE' 
                    ? `GIẢM ${coupon.discountValue}% TOÀN SÀN` 
                    : `GIẢM ${(coupon.discountValue/1000)}K TOÀN SÀN`;
                  
                  return (
                    <div key={coupon.id} className="border border-dashed border-[#b6d4f6] rounded-lg p-3 flex gap-3 relative mb-3 overflow-hidden">
                      <div className="w-[52px] h-[52px] bg-[#f2f4f5] rounded flex items-center justify-center text-gray-400 text-xl font-bold shrink-0">
                        %
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{title}</h4>
                          <FaInfoCircle className="text-[#2489F4] shrink-0 text-xs mt-0.5 cursor-pointer" title={coupon.code} />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                          Đơn hàng từ {(coupon.minOrderAmount/1000)}k{coupon.maxDiscountAmount > 0 ? ` - Giảm tối đa ${(coupon.maxDiscountAmount/1000)}k` : ''}
                        </p>
                        
                        <div className="flex justify-between items-end mt-2.5">
                          <span className="text-[11px] text-gray-400">
                            HSD: {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                          </span>
                          
                          {isEligible ? (
                            <button 
                              onClick={() => handleApplyCoupon(coupon)}
                              className={`text-white text-[11px] font-bold px-3 py-1.5 rounded transition-colors ${appliedCoupon?.id === coupon.id ? 'bg-[#C92127]' : 'bg-[#2489F4] hover:bg-blue-600'}`}
                            >
                              {appliedCoupon?.id === coupon.id ? 'Bỏ chọn' : 'Áp dụng'}
                            </button>
                          ) : (
                            <Link to="/" className="bg-[#2489F4] text-white text-[11px] font-bold px-3 py-1.5 rounded hover:bg-blue-600 transition-colors">
                              Mua thêm
                            </Link>
                          )}
                        </div>
                        
                        {/* Mua thêm text under the button area (similar to image) */}
                        {!isEligible && (
                          <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-[#2489F4]">Mua thêm {shortfall.toLocaleString('vi-VN')} đ</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-5 bg-white rounded-r-full border-r border-y border-dashed border-[#b6d4f6]"></div>
                      <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-5 bg-white rounded-l-full border-l border-y border-dashed border-[#b6d4f6]"></div>
                    </div>
                  );
                })}

                {coupons.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-2">Chưa có mã giảm giá</div>
                )}

                <Link to="/coupons" className="bg-[#eaf3fe] text-[#2489F4] text-sm font-semibold p-2.5 rounded flex justify-between items-center hover:bg-[#d5e6fd] transition-colors mt-1">
                  <span>Xem tất cả khuyến mãi đủ điều kiện</span>
                  <span>&gt;</span>
                </Link>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  <span>Hướng dẫn sử dụng Gift Card</span>
                  <FaInfoCircle className="text-gray-400" />
                </div>
              </div>

              {/* Free Shipping Notice */}
              <div className="bg-[#e8f7ec] border border-[#a6e0b7] rounded-xl p-3 flex gap-2 items-center text-sm">
                <FaTruck className="text-[#28a745] text-lg shrink-0" />
                <div className="text-gray-700 text-xs">
                  <span className="font-semibold text-[#28a745]">Miễn phí giao hàng</span> cho đơn từ <span className="font-bold">500k</span> trở lên! <Link to="#" className="text-blue-500 hover:underline">Chi tiết</Link>
                </div>
              </div>

              {/* Subtotal & Checkout */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                  <span>Thành tiền</span>
                  <span className="font-medium text-gray-800">{total.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {vipDiscountAmount > 0 && (
                  <div className="flex justify-between items-center mb-3 text-sm text-orange-600 font-medium">
                    <span>Ưu đãi VIP</span>
                    <span>-{vipDiscountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {actualCouponDiscount > 0 && (
                  <div className="flex justify-between items-center mb-3 text-sm text-[#2489F4] font-medium">
                    <span>Khuyến mãi</span>
                    <span>-{actualCouponDiscount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                
                {remainingMaxDiscount <= 0 && currentProductDiscount > 0 && (
                   <div className="mb-4 text-[11px] text-red-500 bg-red-50 p-2 rounded border border-red-100">
                     Đơn hàng đã đạt mức chiết khấu tối đa.
                   </div>
                )}

                <div className="flex justify-between items-center py-4 border-t border-gray-100 mb-2">
                  <span className="font-bold text-gray-800">Tổng Số Tiền (gồm VAT)</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-[22px] text-[#C92127] leading-none">{finalTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

                {user && (
                  <div className="flex justify-end items-center gap-1.5 mb-4 text-xs text-orange-600 font-medium bg-orange-50/50 p-2 rounded-lg border border-orange-100/50">
                    <div className="w-4 h-4 bg-yellow-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">Y</div>
                    <span>Nhận <strong className="text-sm">+{Math.floor(finalTotal * (userAcc >= 100000 ? 0.02 : userAcc >= 30000 ? 0.01 : 0.005)).toLocaleString('vi-VN')}</strong> Y-Point từ đơn hàng này</span>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  disabled={loading}
                  className={`w-full bg-[#C92127] text-white font-bold py-3.5 rounded-lg hover:bg-red-800 transition-colors text-center shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'ĐANG CHUYỂN TRANG...' : 'THANH TOÁN'}
                </button>
                <div className="text-center text-[11px] text-[#C92127] mt-2">
                  (Giảm giá trên web chỉ áp dụng cho bán lẻ)
                </div>
              </div>

            </div>
          </div>

        </div>
        
        {recommendations.length > 0 && (
          <div className="mt-8">
            <PersonalizedSuggestions data={recommendations} maxRows={2} />
          </div>
        )}
      </div>
    </div>
  );
}
