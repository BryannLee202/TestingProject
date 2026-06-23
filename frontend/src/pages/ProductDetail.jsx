import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaChevronRight, FaRegThumbsUp, FaThumbsUp, FaExclamationCircle, FaHeart, FaRegHeart, FaComment, FaRegComment, FaImage, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { showNotification } from '../utils/alert';
import Swal from 'sweetalert2';
import AddressModal from '../components/checkout/AddressModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const fileInputRef = useRef(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('Hà Nội');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(() => {
    // Read cached wishlist state for this book from localStorage
    try {
      const cached = JSON.parse(localStorage.getItem('wishlistCache') || '{}');
      return !!cached[id];
    } catch { return false; }
  });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewLikes, setReviewLikes] = useState({});
  const [openCommentId, setOpenCommentId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [canReview, setCanReview] = useState(false);
  const [ineligibleReason, setIneligibleReason] = useState('');
  const [isFirstReview, setIsFirstReview] = useState(true);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/addresses/my-addresses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data);
      const defaultAddr = res.data.find(a => a.default) || res.data[0];
      if (defaultAddr) {
        setDeliveryAddress(`${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.city}`);
      } else if (user?.address) {
        setDeliveryAddress(user.address);
      }
    } catch (err) {
      console.error(err);
      if (user?.address) setDeliveryAddress(user.address);
    }
  };

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/books/${id}`);
        if (res.data && res.data.id) {
          setBook(res.data);
          if (res.data.category && res.data.category.id) {
            localStorage.setItem('lastViewedCategoryId', res.data.category.id);
          }
          setSelectedImage(0);
          // Fetch related books based on category or just latest
          const relatedRes = await axios.get(`${API_BASE_URL}/books/latest`);
          setRelatedBooks(relatedRes.data.filter(b => b.id !== res.data.id).slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/reviews/book/${id}`);
        setReviews(res.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchCoupons = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/coupons`);
        setAvailableCoupons(res.data || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchBookDetail();
    fetchReviews();
    fetchCoupons();
    
    // Handle scrolling to hash after data loads
    setTimeout(() => {
      if (location.hash) {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);
  }, [id, location.hash]);

  useEffect(() => {
    if (user) {
      const checkWishlist = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/wishlists`, { 
            headers: { Authorization: `Bearer ${token}` },
            params: { t: new Date().getTime() }
          });
          const inList = (res.data || []).some(w => String(w.book?.id) === String(id));
          setIsWishlisted(inList);
          // Update cache
          try {
            const cached = JSON.parse(localStorage.getItem('wishlistCache') || '{}');
            if (inList) cached[id] = true;
            else delete cached[id];
            localStorage.setItem('wishlistCache', JSON.stringify(cached));
          } catch {}
        } catch (e) { console.error(e); }
      };
      const checkEligibility = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/reviews/check-eligibility/${id}`, { headers: { Authorization: `Bearer ${token}` }});
          setCanReview(res.data?.eligible || false);
          setIneligibleReason(res.data?.reason || '');
          setIsFirstReview(res.data?.firstReview ?? true);
        } catch (e) { console.error(e); }
      };
      checkWishlist();
      checkEligibility();
    } else {
      setCanReview(false);
      setIneligibleReason('NOT_LOGGED_IN');
    }
  }, [user, id]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setDeliveryAddress('Hà Nội');
    }
  }, [user]);

  const getExpectedDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return `${days[today.getDay()]} - ${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleChangeAddress = async () => {
    if (!user) {
      Swal.fire('Vui lòng đăng nhập', 'Bạn cần đăng nhập để quản lý địa chỉ giao hàng.', 'warning');
      return;
    }
    setShowAddressModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire('Vui lòng đăng nhập', 'Bạn cần đăng nhập để viết đánh giá.', 'warning');
      return;
    }
    setSubmittingReview(true);
    let uploadedImageUrl = null;

    try {
      if (reviewImage) {
        const formData = new FormData();
        formData.append('file', reviewImage);
        const uploadRes = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = uploadRes.data.url;
      }

      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/reviews/book/${id}`, {
        rating: newRating,
        comment: newComment,
        imageUrl: uploadedImageUrl
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data && res.data.id) {
        setReviews(prev => [res.data, ...prev]);
        setIsReviewModalOpen(false);
        setNewComment('');
        setNewRating(5);
        setReviewImage(null);
        setReviewImagePreview(null);
        Swal.fire('Thành công', 'Đánh giá của bạn đã được ghi nhận!', 'success');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.';
      Swal.fire('Lỗi', msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setReviewImage(null);
    setReviewImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const getStarPercentage = (star) => {
    if (totalReviewsCount === 0) return '0%';
    const count = reviews.filter(r => r.rating === star).length;
    return `${Math.round(count * 100 / totalReviewsCount)}%`;
  };

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, quantity);
    }
  };

  const handleBuyNow = () => {
    if (book) {
      addToCart(book, quantity);
      navigate('/cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      Swal.fire('Vui lòng đăng nhập', 'Bạn cần đăng nhập để lưu sản phẩm yêu thích.', 'warning');
      return;
    }

    // If already wishlisted, confirm removal
    if (isWishlisted) {
      const result = await Swal.fire({
        title: 'Xóa khỏi yêu thích?',
        text: 'Bạn có muốn xóa sản phẩm này khỏi danh sách yêu thích không?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#C92127',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đồng ý xóa',
        cancelButtonText: 'Không'
      });
      if (!result.isConfirmed) return;
    } else {
      // Confirm adding
      const result = await Swal.fire({
        title: 'Thêm vào yêu thích?',
        text: 'Bạn có muốn thêm sản phẩm này vào danh sách yêu thích không?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#C92127',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Không'
      });
      if (!result.isConfirmed) return;
    }

    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/wishlists/book/${id}`, {}, { headers: { Authorization: `Bearer ${token}` }});
      const liked = res.data?.isLiked;
      setIsWishlisted(liked);
      // Update localStorage cache
      try {
        const cached = JSON.parse(localStorage.getItem('wishlistCache') || '{}');
        if (liked) cached[id] = true;
        else delete cached[id];
        localStorage.setItem('wishlistCache', JSON.stringify(cached));
      } catch {}
      if (liked) {
        showNotification('Thành công', 'Đã thêm vào danh sách yêu thích!', 'success');
      } else {
        showNotification('Thành công', 'Đã xóa khỏi danh sách yêu thích!', 'success');
      }
    } catch (e) {
      console.error(e);
      showNotification('Lỗi', 'Không thể thực hiện thao tác', 'error');
    }
    finally { setWishlistLoading(false); }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      Swal.fire('Vui lòng đăng nhập', 'Bạn cần đăng nhập để thích đánh giá này.', 'warning');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewLikes(prev => ({ ...prev, [reviewId]: res.data.likesCount }));
    } catch (e) { 
      console.error(e);
      const msg = e.response?.data?.message || 'Không thể thực hiện thao tác này.';
      Swal.fire('Lỗi', msg, 'error');
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!user) {
      Swal.fire('Vui lòng đăng nhập', 'Bạn cần đăng nhập để báo cáo đánh giá này.', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: 'Báo cáo nhận xét?',
      text: 'Bạn có chắc chắn nhận xét này chứa nội dung không phù hợp hoặc vi phạm?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C92127',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Gửi Báo Cáo'
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/reviews/${reviewId}/report`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Thành công', 'Cảm ơn bạn! Báo cáo của bạn đã được gửi cho Quản trị viên xử lý.', 'success');
    } catch (e) {
      console.error(e);
      Swal.fire('Lỗi', 'Không thể gửi báo cáo lúc này.', 'error');
    }
  };

  const handleSubmitComment = async (reviewId) => {
    const content = commentInputs[reviewId]?.trim();
    if (!content || !user) return;
    setSubmittingComment(prev => ({ ...prev, [reviewId]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` }});
      setReviewComments(prev => ({ ...prev, [reviewId]: [...(prev[reviewId] || []), res.data] }));
      setCommentInputs(prev => ({ ...prev, [reviewId]: '' }));
    } catch (e) { console.error(e); }
    finally { setSubmittingComment(prev => ({ ...prev, [reviewId]: false })); }
  };

  const toggleCommentSection = async (reviewId) => {
    if (openCommentId === reviewId) {
      setOpenCommentId(null);
      return;
    }
    setOpenCommentId(reviewId);
    if (!reviewComments[reviewId]) {
      try {
        const res = await axios.get(`${API_BASE_URL}/reviews/${reviewId}/comments`);
        setReviewComments(prev => ({ ...prev, [reviewId]: res.data || [] }));
      } catch (e) { console.error(e); }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sách</h2>
        <Link to="/" className="text-primary hover:underline">Quay về trang chủ</Link>
      </div>
    );
  }

  const allImages = book ? [book.imageUrl || book.image_url, ...(book.additionalImages || [])].filter(Boolean) : [];

  return (
    <div className="bg-[#f0f0f0] min-h-screen pb-10 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 pt-4">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 uppercase flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link> <FaChevronRight className="text-[10px]" />
          <Link to={`/category/${book.category?.id || ''}`} className="hover:text-primary">{book.category?.name || 'Danh mục'}</Link> <FaChevronRight className="text-[10px]" />
          <span className="text-gray-800 truncate">{book.title}</span>
        </div>

        {/* Top Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 flex flex-col md:flex-row gap-6">
          
          {/* Left: Images & Actions */}
          <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col">
            <div className="border border-gray-100 rounded-lg p-2 mb-4 flex items-center justify-center relative">
              <img 
                src={allImages[selectedImage] || 'https://placehold.co/400'} 
                alt={book.title} 
                className="w-full h-auto object-contain max-h-[350px]"
              />
            </div>
            
            {/* Thumbnails */}
            {allImages.length > 0 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
                {allImages.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedImage(i)}
                    className={`border ${i === selectedImage ? 'border-primary' : 'border-gray-200'} rounded p-1 w-1/4 min-w-[70px] cursor-pointer hover:border-primary transition-colors`}
                  >
                    <img src={img} alt="thumb" className="w-full aspect-square object-contain" />
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-auto pt-4">
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-primary border border-primary hover:bg-red-50 hover:shadow-sm font-semibold py-2.5 px-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  <FaShoppingCart className="text-base" /> Thêm vào giỏ hàng
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 bg-primary text-white hover:bg-primary-light hover:shadow-sm font-semibold py-2.5 px-3 rounded-lg transition-all text-sm whitespace-nowrap"
                >
                  Mua ngay
                </button>
              </div>
              <button
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-400'
                }`}
              >
                {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                {isWishlisted ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-[60%] lg:w-[65%]">
            <h1 className="text-[22px] font-medium text-gray-800 mb-2 leading-tight">
              {book.title}
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-3">
              <div>Nhà cung cấp: <span className="font-medium text-blue-600">Nhã Nam</span></div>
              <div>Tác giả: <span className="font-medium text-gray-800">{book.author || 'Đang cập nhật'}</span></div>
              <div>Nhà xuất bản: <span className="font-medium text-gray-800">Hội Nhà Văn</span></div>
              <div>Hình thức bìa: <span className="font-medium text-gray-800">Bìa Mềm</span></div>
            </div>

            <div className="flex items-center gap-3 text-sm mb-4">
              <div className="flex items-center text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-200'} />)}
              </div>
              <span className="text-yellow-500 font-medium">({totalReviewsCount} đánh giá)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">Đã bán {book.salesCount || 0}</span>
            </div>

            {/* Price Block */}
            <div className="mb-4">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(book.price || 0)}
                </span>
                {book.oldPrice > 0 && (
                  <span className="text-gray-400 line-through text-sm mb-1">
                    {formatPrice(book.oldPrice)}
                  </span>
                )}
                {book.discount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded mb-1.5">
                    -{book.discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 text-blue-600 text-sm py-2 px-4 rounded-lg mb-6 border border-blue-100 font-medium">
              45 nhà sách còn hàng
            </div>

            {/* Delivery Info */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Thông tin vận chuyển</h3>
              <div className="text-sm text-gray-600 mb-2 flex justify-between gap-4">
                <span className="flex-1 truncate">Giao hàng đến <span className="font-bold text-gray-800">{deliveryAddress}</span></span>
                <button onClick={handleChangeAddress} className="text-blue-600 hover:underline shrink-0">Thay đổi</button>
              </div>
              <div className="flex gap-2 items-start mt-3">
                <div className="mt-1 text-green-600">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Giao hàng tiêu chuẩn</div>
                  <div className="text-sm text-gray-600">Dự kiến giao <span className="font-bold text-green-700">{getExpectedDeliveryDate()}</span></div>
                </div>
              </div>
            </div>

            {/* Promotions */}
            {availableCoupons.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Ưu đãi liên quan</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                  {availableCoupons.map(coupon => (
                    <div 
                      key={coupon.id}
                      onClick={() => {
                        navigator.clipboard.writeText(coupon.code);
                        showNotification('Đã sao chép!', `Mã giảm giá ${coupon.code} đã được lưu vào bộ nhớ tạm.`, 'success');
                      }}
                      className="border border-green-200 bg-green-50 rounded flex items-center gap-2 p-1.5 px-3 whitespace-nowrap text-sm cursor-pointer shadow-sm hover:border-green-400 hover:bg-green-100 transition-colors"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded text-white flex items-center justify-center font-bold text-xs">%</div>
                      <span className="font-medium text-green-700">Mã {coupon.code}: giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `${coupon.discountValue / 1000}k`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-6 mt-4">
              <span className="font-bold text-gray-800">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-50 transition-colors bg-white"
                >
                  <FaMinus className="text-xs" />
                </button>
                <input 
                  type="text" 
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val > 0) setQuantity(val);
                  }}
                  className="w-10 text-center text-sm font-medium border-x border-gray-300 py-1 focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-50 transition-colors bg-white"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase">Mô tả sản phẩm</h2>
          <div className={`text-sm text-gray-700 leading-relaxed overflow-hidden relative ${expandedDesc ? '' : 'max-h-40'}`}>
            <div className="whitespace-pre-wrap">{book.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}</div>
            
            {!expandedDesc && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            )}
          </div>
          <div className="text-center mt-2">
            <button 
              onClick={() => setExpandedDesc(!expandedDesc)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              {expandedDesc ? 'Rút gọn' : 'Xem thêm'}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="bg-white rounded-lg shadow-sm p-6 mb-4 scroll-mt-24">
          <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase">Đánh giá sản phẩm</h2>
          
          <div className="flex flex-col md:flex-row gap-8 mb-8 border-b border-gray-100 pb-8">
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-800 mb-1">{averageRating}<span className="text-3xl text-gray-400">/5</span></div>
                <div className="flex items-center justify-center gap-1 text-yellow-400 text-lg mb-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-200'} />
                  ))}
                </div>
                <div className="text-gray-500 text-sm">({totalReviewsCount} đánh giá)</div>
              </div>
              
              <div className="flex-1 max-w-[250px] space-y-1">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-8">{star} sao</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: getStarPercentage(star) }}></div>
                    </div>
                    <span className="w-8 text-right">{getStarPercentage(star)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0">
              {user ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Chia sẻ nhận xét của bạn về sản phẩm này</p>
                  {canReview ? (
                    <>
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="bg-white border border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-6 rounded transition-colors text-sm cursor-pointer"
                      >
                        Viết đánh giá
                      </button>
                      {isFirstReview && (
                        <p className="text-xs text-green-600 mt-2 font-medium">Đánh giá sản phẩm để nhận ngay 400 điểm</p>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 py-2 px-4 rounded-lg border border-amber-100 inline-block">
                      {ineligibleReason === 'ALREADY_REVIEWED' 
                        ? 'Bạn đã đánh giá sản phẩm này rồi.' 
                        : 'Bạn cần mua và nhận hàng thành công để viết đánh giá.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-600">
                  Chỉ có thành viên mới có thể viết nhận xét. Vui lòng <Link to="/login" className="text-blue-600 hover:underline">đăng nhập</Link> hoặc <Link to="/register" className="text-blue-600 hover:underline">đăng ký</Link>.
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-6 border-b border-gray-200 mb-6 text-sm font-medium">
            <button className="text-primary border-b-2 border-primary pb-2">Mới nhất</button>
            <button className="text-gray-500 hover:text-gray-800 pb-2">Yêu thích nhất</button>
          </div>

          {/* Review Items */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C92127] to-red-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {rev.user?.fullName ? rev.user.fullName.trim().split(' ').pop()[0].toUpperCase() : 'G'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">{rev.user?.fullName || 'Ẩn danh'}</span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-[11px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-yellow-400 text-xs mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < rev.rating ? 'text-yellow-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed mb-3">{rev.comment}</div>
                      
                      {/* Review Image */}
                      {rev.imageUrl && (
                        <div className="mb-3">
                          <img 
                            src={rev.imageUrl.startsWith('http') ? rev.imageUrl : `${API_BASE_URL.replace('/api', '')}${rev.imageUrl}`} 
                            alt="Review Attachment" 
                            className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(rev.imageUrl.startsWith('http') ? rev.imageUrl : `${API_BASE_URL.replace('/api', '')}${rev.imageUrl}`, '_blank')}
                          />
                        </div>
                      )}

                      {/* Action bar: Like + Comment */}
                      <div className="flex gap-4 text-xs text-gray-400 font-medium">
                        <button
                          onClick={() => handleLikeReview(rev.id)}
                          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                        >
                          <FaRegThumbsUp />
                          <span>{(reviewLikes[rev.id] ?? rev.likesCount) || 0} Thích</span>
                        </button>
                        <button
                          onClick={() => toggleCommentSection(rev.id)}
                          className="flex items-center gap-1.5 hover:text-[#C92127] transition-colors"
                        >
                          <FaRegComment />
                          <span>Phản hồi{(reviewComments[rev.id]?.length || rev.comments?.length) ? ` (${reviewComments[rev.id]?.length ?? rev.comments?.length})` : ''}</span>
                        </button>
                        <button
                          onClick={() => handleReportReview(rev.id)}
                          className="flex items-center gap-1.5 hover:text-red-600 transition-colors ml-auto"
                          title="Báo cáo vi phạm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a15.26 15.26 0 0 1 9.14 0l3.172.793c.39.098.808-.027 1.096-.33.288-.302.422-.723.364-1.14l-1.02-7.14c-.04-.28-.158-.544-.336-.762a1.8 1.8 0 0 0-1.06-.66L14.46 4.192a15.26 15.26 0 0 0-9.14 0L3 4.5M3 15V4.5" />
                          </svg>
                          <span>Báo cáo</span>
                        </button>
                      </div>

                      {/* Comments section */}
                      {openCommentId === rev.id && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                          {(reviewComments[rev.id] || []).map(c => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                                {c.user?.fullName ? c.user.fullName.trim().split(' ').pop()[0].toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                                <span className="font-semibold text-xs text-gray-800 mr-2">{c.user?.fullName || 'Người dùng'}</span>
                                <span className="text-xs text-gray-600">{c.content}</span>
                                <p className="text-[10px] text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString('vi-VN')}</p>
                              </div>
                            </div>
                          ))}
                          {user ? (
                            <div className="flex gap-2 mt-3">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#C92127] to-red-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {user.fullName ? user.fullName.trim().split(' ').pop()[0].toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={commentInputs[rev.id] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [rev.id]: e.target.value }))}
                                  onKeyDown={e => e.key === 'Enter' && handleSubmitComment(rev.id)}
                                  placeholder="Viết phản hồi..."
                                  className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 outline-none focus:border-[#C92127] transition-colors"
                                />
                                <button
                                  onClick={() => handleSubmitComment(rev.id)}
                                  disabled={submittingComment[rev.id] || !commentInputs[rev.id]?.trim()}
                                  className="text-xs bg-[#C92127] text-white px-4 py-1.5 rounded-full hover:bg-red-800 transition-colors disabled:opacity-50"
                                >
                                  {submittingComment[rev.id] ? '...' : 'Gửi'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 mt-2"><Link to="/login" className="text-[#C92127] hover:underline">Đăng nhập</Link> để phản hồi</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-sm text-gray-500">
                Chưa có đánh giá nào cho sách này. Hãy là người đầu tiên đánh giá!
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Viết đánh giá sản phẩm</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn mức đánh giá *</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={32}
                        className={`cursor-pointer transition-colors ${star <= newRating ? 'text-yellow-400' : 'text-gray-200'}`}
                        onClick={() => setNewRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[100px]"
                  />
                </div>
                
                {/* Image Upload Area */}
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange} 
                  />
                  {!reviewImagePreview ? (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 hover:border-[#C92127] hover:text-[#C92127] transition-all w-full justify-center"
                    >
                      <FaImage className="text-lg" /> Thêm ảnh đính kèm (Tùy chọn)
                    </button>
                  ) : (
                    <div className="relative inline-block border border-gray-200 rounded-lg p-1 bg-gray-50">
                      <img src={reviewImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded" />
                      <button 
                        type="button" 
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-50 transition-colors border border-gray-100"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="px-5 py-2 bg-primary text-white hover:bg-primary-light rounded-lg text-sm font-bold shadow-sm cursor-pointer"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Related Books Slider */}
        {relatedBooks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase">Gợi ý cho bạn</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedBooks.map(item => (
                <Link key={item.id} to={`/book/${item.id}`} className="block group">
                  <div className="relative mb-2">
                    <img src={item.imageUrl || item.image_url || 'https://placehold.co/200'} alt={item.title} className="w-full aspect-[3/4] object-cover rounded shadow-sm group-hover:shadow-md transition-shadow" />
                    {item.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{item.discount}%
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-[40px] leading-[20px] group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-primary font-bold text-sm">{formatPrice(item.price)}</span>
                    {item.oldPrice > 0 && <span className="text-xs text-gray-400 line-through mb-0.5">{formatPrice(item.oldPrice)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <AddressModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          addresses={addresses}
          onSelect={(addr) => {
            setDeliveryAddress(`${addr.ward}, ${addr.district}, ${addr.city}`);
            setShowAddressModal(false);
          }}
          onAddAddress={(newAddr) => {
            setAddresses([...addresses, newAddr]);
            if (addresses.length === 0 || newAddr.isDefault) {
              setDeliveryAddress(`${newAddr.ward}, ${newAddr.district}, ${newAddr.city}`);
            }
          }}
          onDeleteAddress={async (id) => {
            if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
            try {
              await axios.delete(`${API_BASE_URL}/addresses/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              setAddresses(addresses.filter(a => a.id !== id));
            } catch (e) {
              showNotification('Lỗi', 'Không thể xóa địa chỉ', 'error');
            }
          }}
          onSetDefaultAddress={async (id) => {
            try {
              await axios.put(`${API_BASE_URL}/addresses/${id}/default`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              });
              fetchAddresses();
            } catch (e) {
              showNotification('Lỗi', 'Không thể đặt mặc định', 'error');
            }
          }}
          API_BASE_URL={API_BASE_URL}
        />

      </div>
    </div>
  );
}
