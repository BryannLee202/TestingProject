import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { showNotification } from '../utils/alert';
import { 
  FaRegUserCircle, FaMapMarkerAlt, FaLock, FaFileInvoice, FaGift, 
  FaClipboardList, FaTicketAlt, FaCoins, FaRegBell, FaHeart, 
  FaBookOpen, FaStar, FaCrown, FaTimes, FaBoxOpen, FaEye, 
  FaCalendarAlt, FaCreditCard, FaTruck, FaMoneyBillWave, FaCopy, FaCheck, FaChevronDown, FaRobot
} from 'react-icons/fa';
import Select from 'react-select';
import treeData from '../data/provinces.json';
import Orders from './Orders';

const provincesList = Object.values(treeData).sort((a,b) => a.name.localeCompare(b.name));

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#d1d5db' },
    padding: '2px', borderRadius: '0.25rem'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:active': { backgroundColor: '#3b82f6' }
  })
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Persist active tab via localStorage so F5 preserves the current tab
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('profileTab') || 'profile';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('profileTab', tab);
  };

  // If navigated here with location.state.tab (e.g. from Header menu), sync it
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.tab, location.pathname, navigate]);

  // ---- PROFILE STATE ----
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Nam');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);

  // ---- PASSWORD STATE ----
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPwd, setLoadingPwd] = useState(false);

  // ---- AI TRAINING STATE ----
  const [aiPreferences, setAiPreferences] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // ---- ADDRESS STATE ----
  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', ward: '', street: '', isDefault: false
  });
  const [addrWards, setAddrWards] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(false);

  const handleAddrCityChange = (selectedOption) => {
    const selectedCityName = selectedOption ? selectedOption.value : '';
    setAddrForm({...addrForm, city: selectedCityName, ward: ''});
    setAddrWards([]);
    
    if (selectedCityName) {
      const selectedProv = provincesList.find(p => p.name === selectedCityName || p.name_with_type === selectedCityName);
      if (selectedProv && selectedProv['xa-phuong']) {
        const wds = Object.values(selectedProv['xa-phuong']).sort((a,b) => a.name.localeCompare(b.name));
        setAddrWards(wds);
      }
    }
  };

  // ---- VAT INVOICE STATE ----
  const [vatForm, setVatForm] = useState({
    type: 'Cá nhân', companyName: '', companyAddress: '', taxCode: '', email: ''
  });
  const [loadingVat, setLoadingVat] = useState(false);

  // ---- WISHLIST & REVIEWS STATE ----
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);

  // ---- NOTIFICATIONS STATE ----
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  // ---- SERIES BOOKS STATE ----
  const [seriesBooks, setSeriesBooks] = useState([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  const [liveUser, setLiveUser] = useState(user);
  const [orderCount, setOrderCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);

  useEffect(() => {
    if (user) {
      if (user.fullName) {
        const parts = user.fullName.split(' ');
        if (parts.length > 1) {
          setFirstName(parts[parts.length - 1]);
          setLastName(parts.slice(0, parts.length - 1).join(' '));
        } else {
          setLastName('');
          setFirstName(user.fullName);
        }
      }
      setPhone(user.phone || user.phoneNumber || '');
      setEmail(user.email || '');
      setGender(user.gender || 'Nam');
      
      if (user.birthday) {
        const d = user.birthday.split('-');
        if (d.length === 3) {
          setYear(d[0]);
          setMonth(d[1]);
          setDay(d[2]);
        }
      }
      if (user.aiPreferences) {
        setAiPreferences(user.aiPreferences);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'address') fetchAddresses();
    if (user && activeTab === 'vat') fetchVat();
    if (user && activeTab === 'wishlist') fetchWishlist();
    if (user && activeTab === 'reviews') fetchReviews();
    if (user && activeTab === 'member') fetchMyOrders();
    if (user && activeTab === 'notifications') fetchNotifications();
    if (activeTab === 'series') fetchSeriesBooks();
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
          setLiveUser(res.data);
        } catch(e) { console.error(e); }
      };
      fetchProfile();

      const fetchVoucherCount = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_BASE_URL}/coupons/my-coupons`, { headers: { Authorization: `Bearer ${token}` } });
          setVoucherCount(Array.isArray(res.data) ? res.data.length : 0);
        } catch(e) { /* ignore */ }
      };
      fetchVoucherCount();
    }
  }, [user]);

  // ---- API CALLS ----
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/addresses/my-addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVat = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/vat-invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setVatForm({
          type: res.data.type || 'Cá nhân',
          companyName: res.data.companyName || '',
          companyAddress: res.data.companyAddress || '',
          taxCode: res.data.taxCode || '',
          email: res.data.email || ''
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/wishlists`, { 
          headers: { Authorization: `Bearer ${token}` },
          params: { t: new Date().getTime() }
        });
      setWishlist(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/reviews/my-reviews`, { headers: { Authorization: `Bearer ${token}` }});
      setReviews(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` }});
      setNotifications(res.data || []);
    } catch (error) { console.error(error); }
    finally { setNotifLoading(false); }
  };

  const markNotifRead = async (notifId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/notifications/${notifId}/read`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    } catch (error) { console.error(error); }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) { console.error(error); }
  };

  const fetchSeriesBooks = async () => {
    setSeriesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/books?size=20`);
      const all = res.data?.content || res.data || [];
      // Filter books that are in a series/combo category
      const series = all.filter(b => 
        b.category?.name?.toLowerCase().includes('combo') ||
        b.category?.name?.toLowerCase().includes('bộ') ||
        b.title?.toLowerCase().includes('bộ')
      );
      setSeriesBooks(series.slice(0, 20));
    } catch (error) { console.error(error); }
    finally { setSeriesLoading(false); }
  };

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` }});
      setOrderCount(res.data.length);
    } catch (error) { console.error(error); }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return showNotification('Lỗi', 'Vui lòng nhập đầy đủ Họ và Tên.', 'warning');
    setLoadingInfo(true);
    try {
      const token = localStorage.getItem('token');
      const fullName = `${lastName.trim()} ${firstName.trim()}`;
      let birthdayStr = '';
      if (year && month && day) birthdayStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const res = await axios.put(`${API_BASE_URL}/users/profile`, { 
        fullName, phone, gender, birthday: birthdayStr 
      }, { headers: { Authorization: `Bearer ${token}` }});
      updateProfile(res.data);
      showNotification('Thành công', 'Cập nhật hồ sơ cá nhân thành công!', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi khi cập nhật thông tin.';
      showNotification('Lỗi', msg, 'error');
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleUpdateAiPreferences = async (e) => {
    e.preventDefault();
    setLoadingAi(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/users/profile`, { 
        fullName: liveUser.fullName,
        phone: liveUser.phone,
        gender: liveUser.gender,
        birthday: liveUser.birthday,
        aiPreferences 
      }, { headers: { Authorization: `Bearer ${token}` }});
      updateProfile(res.data);
      showNotification('Thành công', 'Đã lưu thiết lập Huấn luyện AI!', 'success');
    } catch (error) {
      showNotification('Lỗi', 'Lỗi khi lưu cấu hình AI.', 'error');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) return showNotification('Lỗi', 'Vui lòng nhập đầy đủ.', 'warning');
    if (newPassword !== confirmPassword) return showNotification('Lỗi', 'Mật khẩu mới không khớp.', 'warning');
    setLoadingPwd(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/users/password`, { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Thành công', res.data.message || 'Đổi mật khẩu thành công!', 'success');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Lỗi khi đổi mật khẩu.', 'error');
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrForm.firstName || !addrForm.lastName || !addrForm.phone || !addrForm.city || !addrForm.ward || !addrForm.street) {
      return showNotification('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc (*)', 'warning');
    }
    setLoadingAddr(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/addresses`, {
        recipientName: `${addrForm.lastName.trim()} ${addrForm.firstName.trim()}`,
        phone: addrForm.phone,
        city: addrForm.city,
        ward: addrForm.ward,
        street: addrForm.street,
        isDefault: addrForm.isDefault
      }, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Thêm địa chỉ thành công!', 'success');
      setShowAddAddress(false);
      setAddrForm({ firstName: '', lastName: '', phone: '', city: '', ward: '', street: '', isDefault: false });
      fetchAddresses();
    } catch (error) {
      showNotification('Lỗi', 'Lỗi khi thêm địa chỉ', 'error');
    } finally {
      setLoadingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Đã xóa địa chỉ', 'success');
      fetchAddresses();
    } catch (error) {
      showNotification('Lỗi', 'Lỗi khi xóa địa chỉ', 'error');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/addresses/${id}/default`, {}, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Đã đặt làm địa chỉ mặc định', 'success');
      fetchAddresses();
    } catch (error) {
      showNotification('Lỗi', 'Lỗi khi cập nhật', 'error');
    }
  };

  const handleSaveVat = async (e) => {
    e.preventDefault();
    if (!vatForm.email) return showNotification('Lỗi', 'Email nhận hóa đơn là bắt buộc', 'warning');
    setLoadingVat(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/vat-invoices`, vatForm, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Lưu thông tin xuất hóa đơn thành công!', 'success');
    } catch (error) {
      showNotification('Lỗi', 'Lỗi khi lưu thông tin', 'error');
    } finally {
      setLoadingVat(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Vui lòng <Link to="/login" className="text-[#C92127] hover:underline mx-1 font-semibold">đăng nhập</Link> để xem thông tin.
      </div>
    );
  }

  const getRankDetails = (acc) => {
    if (user?.role === 'ADMIN' || acc >= 100000) return { name: 'Thành viên Kim Cương', color: 'bg-gray-800 text-yellow-500', iconColor: 'text-gray-800', id: 'kimcuong' };
    if (acc >= 30000) return { name: 'Thành viên Vàng', color: 'bg-yellow-400 text-white', iconColor: 'text-yellow-500', id: 'vang' };
    if (acc >= 5000) return { name: 'Thành viên Bạc', color: 'bg-gray-300 text-gray-700', iconColor: 'text-gray-400', id: 'bac' };
    return { name: 'Thành viên Đồng', color: 'bg-orange-100 text-orange-600', iconColor: 'text-orange-500', id: 'dong' };
  };

  const rank = getRankDetails(liveUser?.accumulatedPoints || 0);

  const getNextRankText = (acc) => {
    if (user?.role === 'ADMIN' || acc >= 100000) return 'Bạn đã đạt mức hạng cao nhất';
    if (acc >= 30000) return `Tích lũy thêm ${(100000 - acc).toLocaleString()} Y-Point để lên Kim Cương`;
    if (acc >= 5000) return `Tích lũy thêm ${(30000 - acc).toLocaleString()} Y-Point để lên Vàng`;
    return `Tích lũy thêm ${(5000 - acc).toLocaleString()} Y-Point để lên Bạc`;
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-6 pb-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 text-center">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-100 mx-auto overflow-hidden">
                <FaCrown className={`text-4xl ${rank.iconColor}`} />
              </div>
            </div>
            <div className={`${rank.color} text-xs font-bold px-3 py-1 rounded-full inline-block mb-2`}>{rank.name}</div>
            <div className="text-sm font-medium text-gray-700">Điểm hạng: {(liveUser?.accumulatedPoints || 0).toLocaleString()} Y</div>
            <div className="text-xs text-gray-500 mb-2">{getNextRankText(liveUser?.accumulatedPoints || 0)}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm py-2">
            <div className="text-[#C92127] font-bold text-sm px-4 py-3 flex items-center gap-3">
              <FaRegUserCircle className="text-lg" /> Thông tin tài khoản
            </div>
            <div className="pl-12 flex flex-col gap-1 mb-2 border-l-2 border-transparent relative">
              <button onClick={() => setActiveTab('profile')} className={`text-left text-sm py-1.5 transition-colors ${activeTab === 'profile' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>Hồ sơ cá nhân</button>
              <button onClick={() => setActiveTab('address')} className={`text-left text-sm py-1.5 transition-colors ${activeTab === 'address' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>Số địa chỉ</button>
              <button onClick={() => setActiveTab('password')} className={`text-left text-sm py-1.5 transition-colors ${activeTab === 'password' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>Đổi mật khẩu</button>
              <button onClick={() => setActiveTab('vat')} className={`text-left text-sm py-1.5 transition-colors ${activeTab === 'vat' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>Thông tin xuất hóa đơn GTGT</button>
              <button onClick={() => setActiveTab('ai_train')} className={`text-left text-sm py-1.5 transition-colors flex items-center gap-2 ${activeTab === 'ai_train' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>
                Huấn luyện AI <span className="bg-[#C92127] text-white text-[10px] px-1.5 rounded-full">New</span>
              </button>
              <button onClick={() => setActiveTab('member')} className={`text-left text-sm py-1.5 transition-colors ${activeTab === 'member' ? 'text-[#C92127] font-bold' : 'text-gray-600 hover:text-[#C92127]'}`}>Ưu đãi thành viên</button>
            </div>

            <div className="border-t border-gray-100 my-1"></div>
            
            <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'orders' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaClipboardList className="text-gray-400 text-lg" /> Đơn hàng của tôi
            </button>
            <button onClick={() => setActiveTab('vouchers')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 relative ${activeTab === 'vouchers' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaTicketAlt className="text-gray-400 text-lg" /> Ví voucher
              {voucherCount > 0 && (
                <span className="absolute right-4 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{voucherCount}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('ypoint')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'ypoint' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <div className="w-4 h-4 bg-yellow-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold">Y</div> Tài khoản Y-Point / Freeship
            </button>
            <button onClick={() => setActiveTab('notifications')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'notifications' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaRegBell className={activeTab === 'notifications' ? 'text-[#C92127] text-lg' : 'text-gray-400 text-lg'} /> Thông Báo
            </button>
            <button onClick={() => setActiveTab('wishlist')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'wishlist' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaHeart className={activeTab === 'wishlist' ? 'text-[#C92127] text-lg' : 'text-gray-400 text-lg'} /> Sản phẩm yêu thích
            </button>
            <button onClick={() => setActiveTab('series')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'series' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaBookOpen className={activeTab === 'series' ? 'text-[#C92127] text-lg' : 'text-gray-400 text-lg'} /> Sách theo bộ
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-3 ${activeTab === 'reviews' ? 'text-[#C92127] font-bold' : 'text-gray-700 hover:text-[#C92127]'}`}>
              <FaStar className={activeTab === 'reviews' ? 'text-[#C92127] text-lg' : 'text-gray-400 text-lg'} /> Nhận xét của tôi
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 min-h-[500px]">
            
            {/* HỒ SƠ CÁ NHÂN */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-8">Hồ sơ cá nhân</h2>
                <form onSubmit={handleUpdateInfo} className="max-w-2xl">
                  <div className="flex items-center mb-6">
                    <label className="w-32 text-sm text-gray-600">Họ<span className="text-red-500">*</span></label>
                    <div className="flex-1">
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded text-gray-800 outline-none focus:border-blue-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-32 text-sm text-gray-600">Tên<span className="text-red-500">*</span></label>
                    <div className="flex-1">
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded text-gray-800 outline-none focus:border-blue-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-32 text-sm text-gray-600">Số điện thoại</label>
                    <div className="flex-1 flex gap-4 items-center border border-gray-200 rounded px-4 py-2 focus-within:border-blue-400">
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Chưa có số điện thoại" className="flex-1 outline-none text-gray-800" />
                      <button type="button" className="text-blue-500 text-sm whitespace-nowrap hover:underline">Thay đổi</button>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-32 text-sm text-gray-600">Email</label>
                    <div className="flex-1 flex gap-4 items-center border border-gray-200 rounded px-4 py-2 focus-within:border-blue-400 bg-gray-50">
                      <input type="email" value={email} readOnly disabled placeholder="Chưa có email" className="flex-1 outline-none text-gray-500 bg-transparent" />
                      <button type="button" className="text-blue-500 text-sm whitespace-nowrap hover:underline">{email ? 'Thay đổi' : 'Thêm mới'}</button>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-32 text-sm text-gray-600">Giới tính<span className="text-red-500">*</span></label>
                    <div className="flex-1 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Nam" checked={gender === 'Nam'} onChange={(e) => setGender(e.target.value)} className="w-4 h-4 text-[#C92127] accent-[#C92127]" /><span className="text-sm text-gray-700">Nam</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="gender" value="Nữ" checked={gender === 'Nữ'} onChange={(e) => setGender(e.target.value)} className="w-4 h-4 text-[#C92127] accent-[#C92127]" /><span className="text-sm text-gray-700">Nữ</span></label>
                    </div>
                  </div>
                  <div className="flex items-center mb-8">
                    <label className="w-32 text-sm text-gray-600">Birthday<span className="text-red-500">*</span></label>
                    <div className="flex-1 flex items-center gap-2">
                      <input type="text" placeholder="DD" value={day} onChange={(e) => setDay(e.target.value)} className="w-full text-center px-2 py-2 border border-gray-200 rounded text-gray-800 outline-none focus:border-blue-400 placeholder-gray-300" maxLength="2" />
                      <input type="text" placeholder="MM" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full text-center px-2 py-2 border border-gray-200 rounded text-gray-800 outline-none focus:border-blue-400 placeholder-gray-300" maxLength="2" />
                      <input type="text" placeholder="YYYY" value={year} onChange={(e) => setYear(e.target.value)} className="w-full text-center px-2 py-2 border border-gray-200 rounded text-gray-800 outline-none focus:border-blue-400 placeholder-gray-300" maxLength="4" />
                    </div>
                  </div>
                  <div className="flex justify-center mt-8">
                    <button type="submit" disabled={loadingInfo} className="bg-[#C92127] text-white px-10 py-2.5 rounded-md font-bold hover:bg-red-800 transition-colors disabled:opacity-70 shadow-sm">{loadingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* SỐ ĐỊA CHỈ */}
            {activeTab === 'address' && (
              <div>
                {!showAddAddress ? (
                  <>
                    <h2 className="text-xl font-normal text-gray-800 mb-6">Số địa chỉ</h2>
                    <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center mb-6">
                      <button onClick={() => setShowAddAddress(true)} className="flex items-center gap-2 text-[#C92127] font-bold hover:text-red-800">
                        <span className="text-xl">+</span> Thêm địa chỉ mới
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-gray-800 uppercase">{addr.recipientName}</div>
                            <div className="flex gap-4 text-sm">
                              {!addr.default && (
                                <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-blue-500 hover:underline">Thiết lập mặc định</button>
                              )}
                              <button className="text-blue-500 hover:underline">Sửa</button>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:underline">Xóa</button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">Địa chỉ: {addr.street}, {addr.ward}, {addr.city}</div>
                          <div className="text-sm text-gray-600 mb-2">Điện thoại: {addr.phone}</div>
                          {addr.default && (
                            <span className="inline-block bg-[#C92127] text-white text-xs px-2 py-1 rounded">Mặc định</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-normal text-gray-800 mb-6">Thêm địa chỉ mới</h2>
                    <form onSubmit={handleSaveAddress} className="max-w-2xl">
                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Họ<span className="text-red-500">*</span></label>
                        <input type="text" value={addrForm.lastName} onChange={(e) => setAddrForm({...addrForm, lastName: e.target.value})} placeholder="Họ*" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                      </div>
                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Tên<span className="text-red-500">*</span></label>
                        <input type="text" value={addrForm.firstName} onChange={(e) => setAddrForm({...addrForm, firstName: e.target.value})} placeholder="Tên*" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                      </div>
                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Điện thoại<span className="text-red-500">*</span></label>
                        <input type="text" value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})} placeholder="Ex: 0972xxxx" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                      </div>
                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Tỉnh/Thành phố<span className="text-red-500">*</span></label>
                        <div className="flex-1">
                          <Select
                            options={provincesList.map(p => ({ value: p.name, label: p.name_with_type }))}
                            value={addrForm.city ? { value: addrForm.city, label: provincesList.find(p => p.name === addrForm.city)?.name_with_type } : null}
                            onChange={handleAddrCityChange}
                            placeholder="Vui lòng chọn Tỉnh/Thành phố"
                            styles={customSelectStyles}
                            isClearable
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Xã/Phường<span className="text-red-500">*</span></label>
                        <div className="flex-1">
                          <Select
                            options={addrWards.map(w => ({ value: w.name, label: w.name_with_type }))}
                            value={addrForm.ward ? { value: addrForm.ward, label: addrWards.find(w => w.name === addrForm.ward)?.name_with_type || addrForm.ward } : null}
                            onChange={(selectedOption) => setAddrForm({...addrForm, ward: selectedOption ? selectedOption.value : ''})}
                            placeholder="Vui lòng chọn Xã/Phường"
                            styles={customSelectStyles}
                            isDisabled={!addrForm.city}
                            isClearable
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <label className="w-32 text-sm text-gray-600">Địa chỉ chi tiết<span className="text-red-500">*</span></label>
                        <input type="text" value={addrForm.street} onChange={(e) => setAddrForm({...addrForm, street: e.target.value})} placeholder="Số nhà, đường..." className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                      </div>
                      
                      <div className="flex justify-between items-center mt-8">
                        <button type="button" onClick={() => setShowAddAddress(false)} className="text-blue-500 text-sm hover:underline">« Quay lại</button>
                        <button type="submit" disabled={loadingAddr} className="bg-[#C92127] text-white px-8 py-2.5 rounded-md font-bold hover:bg-red-800 transition-colors disabled:opacity-70 shadow-sm">
                          {loadingAddr ? 'Đang lưu...' : 'LƯU ĐỊA CHỈ'}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ĐỔI MẬT KHẨU */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-8">Đổi mật khẩu</h2>
                <form onSubmit={handleChangePassword} className="max-w-2xl">
                  <div className="flex items-center mb-6">
                    <label className="w-40 text-sm text-gray-600">Mật khẩu hiện tại<span className="text-red-500">*</span></label>
                    <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Mật khẩu hiện tại" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-40 text-sm text-gray-600">Mật khẩu mới<span className="text-red-500">*</span></label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mật khẩu mới" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center mb-8">
                    <label className="w-40 text-sm text-gray-600">Nhập lại mật khẩu mới<span className="text-red-500">*</span></label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex justify-center">
                    <button type="submit" disabled={loadingPwd} className="bg-[#C92127] text-white px-10 py-2.5 rounded-md font-bold hover:bg-red-800 transition-colors disabled:opacity-70 shadow-sm">{loadingPwd ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* THÔNG TIN XUẤT HÓA ĐƠN GTGT */}
            {activeTab === 'vat' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-8">Thông tin xuất hóa đơn GTGT</h2>
                <form onSubmit={handleSaveVat} className="max-w-2xl">
                  <div className="flex items-center gap-6 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vatType" value="Cá nhân" checked={vatForm.type === 'Cá nhân'} onChange={(e) => setVatForm({...vatForm, type: e.target.value})} className="w-4 h-4 text-[#C92127] accent-[#C92127]" />
                      <span className="text-sm text-gray-700">Cá nhân</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vatType" value="Doanh nghiệp" checked={vatForm.type === 'Doanh nghiệp'} onChange={(e) => setVatForm({...vatForm, type: e.target.value})} className="w-4 h-4 text-[#C92127] accent-[#C92127]" />
                      <span className="text-sm text-gray-700">Doanh nghiệp</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <label className="w-40 text-sm text-gray-600">Họ tên người mua hàng</label>
                    <input type="text" value={vatForm.companyName} onChange={(e) => setVatForm({...vatForm, companyName: e.target.value})} placeholder="Nhập họ tên người mua hàng" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="w-40 text-sm text-gray-600">Địa chỉ cá nhân</label>
                    <input type="text" value={vatForm.companyAddress} onChange={(e) => setVatForm({...vatForm, companyAddress: e.target.value})} placeholder="Nhập địa chỉ cá nhân" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="w-40 text-sm text-gray-600">Căn cước công dân</label>
                    <input type="text" value={vatForm.taxCode} onChange={(e) => setVatForm({...vatForm, taxCode: e.target.value})} placeholder="Nhập căn cước công dân" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  <div className="flex items-center mb-6">
                    <label className="w-40 text-sm text-gray-600">Email nhận hóa đơn <span className="text-red-500">*</span></label>
                    <input type="email" value={vatForm.email} onChange={(e) => setVatForm({...vatForm, email: e.target.value})} placeholder="Nhập email nhận hóa đơn" className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-blue-400" />
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <button type="submit" disabled={loadingVat} className="bg-[#C92127] text-white px-10 py-2.5 rounded-md font-bold hover:bg-red-800 transition-colors disabled:opacity-70 shadow-sm">{loadingVat ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                  </div>
                </form>
              </div>
            )}

            {/* HUẤN LUYỆN AI */}
            {activeTab === 'ai_train' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-2 flex items-center gap-2">
                  <FaRobot className="text-[#C92127]" /> Huấn luyện trợ lý AI cá nhân
                </h2>
                <p className="text-sm text-gray-500 mb-8">
                  Dạy Bot hiểu rõ sở thích của bạn. Những gì bạn ghi ở đây sẽ định hình "nhân cách" và "lời khuyên" của Bot khi trò chuyện với bạn.
                </p>
                
                <form onSubmit={handleUpdateAiPreferences} className="max-w-3xl">
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Lời dặn dò cho AI:</label>
                    <textarea 
                      rows={6}
                      value={aiPreferences} 
                      onChange={(e) => setAiPreferences(e.target.value)} 
                      placeholder="Ví dụ: Tôi là lập trình viên 25 tuổi. Hãy luôn tư vấn cho tôi bằng giọng điệu vui vẻ, xưng 'anh - em'. Ưu tiên giới thiệu các đầu sách khoa học công nghệ, tâm lý học và tiểu thuyết khoa học viễn tưởng. Đừng bao giờ giới thiệu ngôn tình..." 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-2 italic">*Hệ thống sẽ tự động tiêm thiết lập này vào bộ não của Bot ngay khi bạn lưu.</p>
                  </div>
                  
                  <div className="flex justify-start">
                    <button type="submit" disabled={loadingAi} className="bg-gradient-to-r from-[#C92127] to-[#ff4d4d] text-white px-8 py-2.5 rounded-md font-bold hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                      <FaRobot /> {loadingAi ? 'Đang huấn luyện...' : 'Lưu và Huấn luyện AI'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ƯU ĐÃI THÀNH VIÊN */}
            {activeTab === 'member' && (
              <MemberPrivileges liveUser={liveUser} orderCount={orderCount} />
            )}

            {/* TÀI KHOẢN Y-POINT */}
            {activeTab === 'ypoint' && (
              <YPointAccount liveUser={liveUser} setLiveUser={setLiveUser} updateProfile={updateProfile} />
            )}
            
            {/* ĐƠN HÀNG CỦA TÔI */}
            {activeTab === 'orders' && (
              <div className="-mx-6 md:-mx-8 -mt-6 md:-mt-8">
                <Orders embedded={true} />
              </div>
            )}

            {/* VÍ VOUCHER */}
            {activeTab === 'vouchers' && (
              <MyVouchersTab />
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-normal text-gray-800">Thông Báo</h2>
                  {notifications.some(n => !n.isRead) && (
                    <button onClick={markAllRead} className="text-sm text-[#C92127] font-medium hover:underline flex items-center gap-1">
                      <FaCheck className="text-xs" /> Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                {notifLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C92127]"></div></div>
                ) : notifications.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
                    <FaRegBell className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p>Bạn chưa có thông báo nào mới.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.isRead && markNotifRead(notif.id)}
                        className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          notif.isRead ? 'bg-white border-gray-100' : 'bg-red-50/60 border-red-100 hover:bg-red-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          notif.isRead ? 'bg-gray-100 text-gray-400' : 'bg-[#C92127]/10 text-[#C92127]'
                        }`}>
                          <FaRegBell className="text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight mb-1 ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">{notif.content}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 bg-[#C92127] rounded-full shrink-0 mt-2"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-6">Sản phẩm yêu thích</h2>
                {wishlist.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
                    <FaHeart className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p>Bạn chưa có sản phẩm yêu thích nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {wishlist.map(item => (
                      <div key={item.id} className="relative border border-gray-200 rounded-xl p-3 hover:shadow-md transition group">
                        <button
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem('token');
                              await axios.post(`${API_BASE_URL}/wishlists/book/${item.book.id}`, {}, { headers: { Authorization: `Bearer ${token}` }});
                              setWishlist(prev => prev.filter(w => w.id !== item.id));
                            } catch(e) { console.error(e); }
                          }}
                          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-400 hover:text-red-600 shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Bỏ thích"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                        <Link to={`/book/${item.book?.id}`}>
                          <img src={item.book?.imageUrl || 'https://via.placeholder.com/150'} alt={item.book?.title || 'Product'} className="w-full h-36 object-contain mb-2" />
                          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{item.book?.title || 'Sản phẩm'}</h3>
                          <p className="text-[#C92127] font-bold text-sm">{(item.book?.price || 0).toLocaleString()} đ</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SERIES */}
            {activeTab === 'series' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-6">Sách theo bộ</h2>
                {seriesLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C92127]"></div></div>
                ) : seriesBooks.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
                    <FaBookOpen className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p>Không có sách theo bộ nào phù hợp.</p>
                    <Link to="/" className="mt-4 inline-block text-sm text-[#C92127] font-medium hover:underline">Khám phá ngay →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {seriesBooks.map(book => (
                      <Link key={book.id} to={`/book/${book.id}`} className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition group">
                        <img src={book.imageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="w-full h-36 object-contain mb-2" />
                        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-[#C92127] transition-colors">{book.title}</h3>
                        <p className="text-[#C92127] font-bold text-sm">{book.price?.toLocaleString()} đ</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-xl font-normal text-gray-800 mb-6">Nhận xét của tôi</h2>
                {reviews.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
                    <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p>Bạn chưa viết nhận xét nào.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
                        <div className="flex gap-4">
                          <img
                            src={review.book?.imageUrl || 'https://via.placeholder.com/80'}
                            alt={review.book?.title}
                            className="w-16 h-20 object-contain rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link to={`/book/${review.book?.id}`} className="font-semibold text-gray-800 hover:text-[#C92127] transition-colors text-sm line-clamp-1">{review.book?.title}</Link>
                            <div className="flex items-center gap-0.5 text-yellow-400 text-xs my-1">
                              {[...Array(5)].map((_, i) => <FaStar key={i} color={i < review.rating ? '#ffc107' : '#e4e5e9'} />)}
                              <span className="text-gray-400 text-xs ml-2">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">👍 {review.likesCount || 0} lượt thích</span>
                              <span className="flex items-center gap-1">💬 {review.comments?.length || 0} phản hồi</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for Member Privileges to make file cleaner
function MemberPrivileges({ liveUser, orderCount }) {
  const userAcc = liveUser?.accumulatedPoints || 0;
  let initialRank = 'dong';
  if (liveUser?.role === 'ADMIN' || userAcc >= 100000) initialRank = 'kimcuong';
  else if (userAcc >= 30000) initialRank = 'vang';
  else if (userAcc >= 5000) initialRank = 'bac';

  const [activeRank, setActiveRank] = useState(initialRank);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    setActiveRank(initialRank);
  }, [initialRank]);
  
  const renderPrivileges = () => {
    switch (activeRank) {
      case 'dong':
        return (
          <>
            <p>- Ưu đãi giỏ hàng tự động: <strong>Không có</strong></p>
            <p>- Tỉ lệ tích luỹ Y-Point khi đặt hàng: <strong>0,5%</strong></p>
          </>
        );
      case 'bac':
        return (
          <>
            <p>- Ưu đãi giỏ hàng tự động: <strong className="text-red-500">Giảm 2%</strong></p>
            <p>- Tỉ lệ tích luỹ Y-Point khi đặt hàng: <strong>0,5%</strong></p>
          </>
        );
      case 'vang':
        return (
          <>
            <p>- Ưu đãi giỏ hàng tự động: <strong className="text-red-500">Giảm 5%</strong></p>
            <p>- Tỉ lệ tích luỹ Y-Point khi đặt hàng: <strong>1%</strong></p>
          </>
        );
      case 'kimcuong':
        return (
          <>
            <p>- Ưu đãi giỏ hàng tự động: <strong className="text-red-500">Giảm 10%</strong></p>
            <p>- Tỉ lệ tích luỹ Y-Point khi đặt hàng: <strong>2%</strong></p>
          </>
        );
      default: return null;
    }
  };

  const rankNames = {
    'dong': 'Đồng',
    'bac': 'Bạc',
    'vang': 'Vàng',
    'kimcuong': 'Kim Cương'
  };

  return (
    <div>
      <div className="bg-gray-100 rounded-lg p-8 mb-8 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-gray-200 mb-4 overflow-hidden relative shadow-sm">
          <FaCrown className={`text-5xl ${initialRank === 'kimcuong' ? 'text-gray-800' : initialRank === 'vang' ? 'text-yellow-500' : initialRank === 'bac' ? 'text-gray-400' : 'text-orange-400'}`} />
        </div>
        <button onClick={() => setShowRules(true)} className="bg-white text-gray-700 text-sm font-bold px-4 py-1.5 rounded-full inline-block shadow-sm hover:bg-gray-50 transition-colors">Thành viên {rankNames[initialRank]} {'>'}</button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="flex-1 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-700 mb-4 text-sm font-medium">Ưu đãi của bạn</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Y-Point hiện có</div>
              <div className="text-[#C92127] font-bold text-lg">{(liveUser?.yPoints || 0).toLocaleString()}</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Freeship hiện có</div>
              <div className="text-[#C92127] font-bold text-lg">{liveUser?.freeShipCoupons || 0} lần</div>
            </div>
          </div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-700 mb-4 text-sm font-medium">Thành tích năm 2025</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Số đơn hàng</div>
              <div className="text-[#C92127] font-bold text-lg">{orderCount} đơn hàng</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Điểm tích lũy</div>
              <div className="text-[#C92127] font-bold text-lg">{(liveUser?.accumulatedPoints || 0).toLocaleString()} Y</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Đã thanh toán</div>
              <div className="text-[#C92127] font-bold text-lg">{(liveUser?.totalSpent || 0).toLocaleString()} đ</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-gray-800 font-bold mb-4">Quyền lợi thành viên tại YiYi Book</h3>
      <div className="flex border-b border-gray-200 mb-4">
        <button onClick={() => setActiveRank('bac')} className={`px-6 py-2 font-medium rounded-t flex items-center gap-2 relative ${activeRank === 'bac' ? 'bg-white border border-b-0 border-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>
          <FaCrown className="text-gray-400" /> Hạng Bạc
          {activeRank === 'bac' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C92127]"></div>}
        </button>
        <button onClick={() => setActiveRank('vang')} className={`px-6 py-2 font-medium rounded-t flex items-center gap-2 relative ${activeRank === 'vang' ? 'bg-white border border-b-0 border-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>
          <FaCrown className="text-yellow-500" /> Hạng Vàng
          {activeRank === 'vang' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C92127]"></div>}
        </button>
        <button onClick={() => setActiveRank('kimcuong')} className={`px-6 py-2 font-medium rounded-t flex items-center gap-2 relative ${activeRank === 'kimcuong' ? 'bg-white border border-b-0 border-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'}`}>
          <FaCrown className="text-gray-800" /> Kim cương
          {activeRank === 'kimcuong' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-[#C92127]"></div>}
        </button>
      </div>
      <div className="bg-white border border-gray-100 rounded p-4 text-sm text-gray-700 leading-relaxed shadow-sm min-h-[100px]">
        {renderPrivileges()}
      </div>
      {showRules && <MemberRulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}

// Subcomponent for YPoint Account
function YPointAccount({ liveUser, setLiveUser, updateProfile }) {
  const [pointHistory, setPointHistory] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleHistoryLimit, setVisibleHistoryLimit] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/rewards/history`, { headers: { Authorization: `Bearer ${token}` }});
      setPointHistory(res.data);
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setLoading(true);
    setRedeemError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/rewards/redeem`, { code: voucherCode }, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Nạp điểm thành công!', 'success');
      setVoucherCode('');
      fetchHistory();
      
      const userRes = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setLiveUser(userRes.data);
      if (updateProfile) updateProfile(userRes.data);
    } catch (error) {
      setRedeemError(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleExchange = async (points, type) => {
    if (!window.confirm(`Bạn có chắc chắn muốn dùng ${points.toLocaleString()} điểm để đổi lấy ưu đãi này?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/rewards/exchange`, { points, type }, { headers: { Authorization: `Bearer ${token}` }});
      showNotification('Thành công', 'Đổi quà thành công! Hãy kiểm tra ưu đãi của bạn.', 'success');
      fetchHistory();
      const userRes = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setLiveUser(userRes.data);
      if (updateProfile) updateProfile(userRes.data);
    } catch (error) {
      showNotification('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-normal text-gray-800 mb-6">Tài khoản Y-Point / Freeship</h2>
      
      <div className="bg-white border border-gray-200 rounded p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6 border-b border-gray-100 pb-6">
          <div className="w-48 text-gray-600 text-sm">Y-Point hiện có</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">Y</div>
            <span className="text-[#C92127] font-bold text-xl">{(liveUser?.yPoints || 0).toLocaleString()} Y-Point</span>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-100 pb-6">
          <h3 className="text-gray-800 font-bold mb-4">Cửa hàng Đổi Quà</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between items-center bg-gray-50 hover:border-red-300 transition-colors">
              <div className="text-center mb-3">
                <div className="font-bold text-red-600 mb-1">Mã Freeship</div>
                <div className="text-xs text-gray-500">Giảm tối đa 30K phí vận chuyển</div>
              </div>
              <button 
                disabled={loading || (liveUser?.yPoints || 0) < 10000}
                onClick={() => handleExchange(10000, 'FREESHIP')}
                className="w-full bg-[#C92127] hover:bg-red-800 text-white font-bold py-1.5 px-4 rounded text-sm disabled:opacity-50"
              >
                Đổi 10.000 Điểm
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between items-center bg-gray-50 hover:border-red-300 transition-colors">
              <div className="text-center mb-3">
                <div className="font-bold text-red-600 mb-1">Mã Giảm 20K</div>
                <div className="text-xs text-gray-500">Cho mọi đơn hàng</div>
              </div>
              <button 
                disabled={loading || (liveUser?.yPoints || 0) < 20000}
                onClick={() => handleExchange(20000, 'DISCOUNT_20K')}
                className="w-full bg-[#C92127] hover:bg-red-800 text-white font-bold py-1.5 px-4 rounded text-sm disabled:opacity-50"
              >
                Đổi 20.000 Điểm
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between items-center bg-gray-50 hover:border-red-300 transition-colors">
              <div className="text-center mb-3">
                <div className="font-bold text-red-600 mb-1">Mã Giảm 50K</div>
                <div className="text-xs text-gray-500">Cho mọi đơn hàng</div>
              </div>
              <button 
                disabled={loading || (liveUser?.yPoints || 0) < 50000}
                onClick={() => handleExchange(50000, 'DISCOUNT_50K')}
                className="w-full bg-[#C92127] hover:bg-red-800 text-white font-bold py-1.5 px-4 rounded text-sm disabled:opacity-50"
              >
                Đổi 50.000 Điểm
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleRedeem} className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-48 text-gray-600 text-sm">Nạp điểm Y-Point / Freeship</div>
          <div className="flex-1 flex flex-col">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã của bạn..." 
                className="flex-1 px-4 py-2 border border-gray-200 rounded outline-none focus:border-red-400 uppercase text-gray-800 shadow-sm"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#C92127] hover:bg-red-800 text-white font-bold py-2 px-8 rounded transition disabled:opacity-70 shadow-sm whitespace-nowrap"
              >
                {loading ? 'Đang nạp...' : 'Nạp điểm'}
              </button>
            </div>
            {redeemError && <div className="text-[#C92127] text-sm mt-3 font-medium">Lỗi: {redeemError}</div>}
          </div>
        </form>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-sm border border-gray-100">
        <table className="w-full text-left text-sm text-gray-600">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <th className="p-4 font-medium w-40">Thời gian</th>
              <th className="p-4 font-medium min-w-[200px]">Hành động</th>
              <th className="p-4 font-medium text-right w-24">Số dư trước</th>
              <th className="p-4 font-medium text-center w-32">Giá trị giao dịch</th>
              <th className="p-4 font-medium text-right w-24">Số dư sau</th>
            </tr>
          </thead>
          <tbody>
            {pointHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500 bg-white">Chưa có giao dịch điểm nào</td>
              </tr>
            ) : (
              pointHistory.slice(0, visibleHistoryLimit).map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 bg-white transition-colors">
                  <td className="p-4 text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="p-4 font-medium text-gray-800">{tx.description}</td>
                  <td className="p-4 text-right">{tx.previousBalance?.toLocaleString() || 0}</td>
                  <td className={`p-4 text-center font-bold ${tx.transactionValue > 0 ? 'text-green-600' : 'text-[#C92127]'}`}>
                    {tx.transactionValue > 0 ? '+' : ''}{tx.transactionValue?.toLocaleString() || 0}
                  </td>
                  <td className="p-4 text-right font-medium">{tx.newBalance?.toLocaleString() || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pointHistory.length > visibleHistoryLimit && (
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => setVisibleHistoryLimit(prev => prev + 10)}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:text-[#C92127] transition-colors bg-white font-medium text-sm"
          >
            <span>Xem thêm</span>
            <FaChevronDown className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

function MemberRulesModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="bg-[#C92127] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold uppercase tracking-wide">Quy định & Chính sách Thành Viên</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-gray-700 text-sm leading-relaxed space-y-6">
          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">Cập nhật mới về cách tính khuyến mãi Y-Point tại YiYi Book từ ngày 01/07/2025</h3>
            <p className="mb-2">Kính gửi quý khách hàng,</p>
            <p className="mb-4">YiYi Book trân trọng thông báo về việc cập nhật cách tính chiết khấu bán hàng, giảm giá sản phẩm, nhằm tuân thủ Thông tư 39/2025/TT-BCT mới nhất từ Bộ Công Thương, có hiệu lực từ ngày 01 tháng 7 năm 2025. Việc điều chỉnh này được thực hiện dựa trên quy định tại Điều 3 của Thông tư 39/2025/TT-BCT về hạn mức tối đa về giá trị hàng hóa, dịch vụ dùng để khuyến mại, cụ thể như sau:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Hạn mức chiết khấu trên từng sản phẩm: Giá trị chiết khấu hoặc khuyến mại cho một đơn vị hàng hóa, dịch vụ không được vượt quá 50% giá bán ngay trước thời gian khuyến mại của sản phẩm đó.</li>
              <li>Hạn mức tổng giá trị chiết khấu trong chương trình: Tổng giá trị của hàng hóa, dịch vụ dùng để khuyến mại trong một chương trình không được vượt quá 50% tổng giá trị của hàng hóa, dịch vụ được khuyến mại.</li>
            </ul>
            <p className="font-semibold mb-2">Để Quý Khách hàng dễ hình dung, YiYi Book xin đưa ra một vài ví dụ minh họa:</p>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4 space-y-3">
              <div>
                <strong className="text-gray-800">Ví dụ 1:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Sản phẩm A có giá bìa 100.000 VNĐ, giá bán 50.000 VNĐ (tức đã giảm 50% so với giá bìa).</li>
                  <li>Trong trường hợp này, Quý khách không thể áp dụng thêm mã giảm giá hoặc Y-Point để giảm tiếp cho đơn hàng, vì sản phẩm đã đạt mức chiết khấu tối đa cho phép theo quy định.</li>
                </ul>
              </div>
              <div>
                <strong className="text-gray-800">Ví dụ 2:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Sản phẩm A có giá bìa 100.000 VNĐ, giá bán 51.000 VNĐ.</li>
                  <li>Sản phẩm B có giá bìa 100.000 VNĐ, giá bán 80.000 VNĐ.</li>
                  <li>Tổng giá bìa của 2 sản phẩm là 200.000 VNĐ.</li>
                  <li>Tổng giá trị giảm giá tối đa cho đơn hàng này là: 50% của 200.000 VNĐ = 100.000 VNĐ.</li>
                  <li>Tổng giá trị giảm giá thực tế của đơn hàng hiện tại là: (100.000 VNĐ - 51.000 VNĐ) + (100.000 VNĐ - 80.000 VNĐ) = 49.000 VNĐ + 20.000 VNĐ = 69.000 VNĐ.</li>
                  <li>Như vậy, Quý khách có thể sử dụng thêm tối đa 31.000 VNĐ (100.000 VNĐ - 69.000 VNĐ) cho mã giảm giá và Y-Point để áp dụng cho đơn hàng này.</li>
                </ul>
              </div>
            </div>
            
            <p className="mb-2">Những quy định trên nhằm đảm bảo sự minh bạch và công bằng trong các hoạt động khuyến mại, đồng thời bảo vệ quyền lợi của người tiêu dùng theo quy định của pháp luật.</p>
            <p className="mb-2">YiYi Book hiểu rằng sự thay đổi này có thể ảnh hưởng đến Quý Khách hàng, do đó chúng tôi sẽ chủ động rà soát và điều chỉnh các chính sách chiết khấu hiện hành để đảm bảo tuân thủ đầy đủ Thông tư mới. Chúng tôi cam kết sẽ tiếp tục mang đến những sản phẩm và dịch vụ chất lượng tốt nhất cùng với các chính sách ưu đãi phù hợp trong khuôn khổ pháp luật cho phép.</p>
            <p>Nếu Quý Khách hàng có bất kỳ thắc mắc nào về chính sách mới này, xin vui lòng liên hệ với bộ phận Chăm sóc Khách hàng hoặc qua Hotline 1900xxxx của YiYi Book để được hỗ trợ và giải đáp chi tiết.</p>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">CÁC QUI ĐỊNH CHUNG VỀ Y-POINT</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-[#C92127]">1/ CÁCH THỨC TÍNH ĐIỂM Y-POINT:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Y-Point được cập nhật chính thức sau khi đơn hàng được giao thành công.</li>
                  <li>Y-Point có thể được sử dụng tương đương như tiền để thanh toán khi mua hàng tại website/ứng dụng YiYi Book.</li>
                  <li>Y-Point được tính từ tổng số tiền thanh toán trên hóa đơn, với tỷ lệ quy đổi khác nhau theo từng hạng thành viên.</li>
                </ul>
                <div className="bg-gray-50 p-3 mt-2 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-800">Ví dụ:</span> Tài khoản mua hàng của khách hàng đã thanh toán hoàn tất là 100.000 đồng thì sẽ được quy đổi như sau:
                  <ul className="list-disc pl-5 mt-1 text-gray-600">
                    <li>Thành viên ĐỒNG: 0.5% x 100.000 đồng = 500 Y-Point</li>
                    <li>Thành viên BẠC: 0.5% x 100.000 đồng = 500 Y-Point</li>
                    <li>Thành viên VÀNG: 1.0% x 100.000 đồng = 1.000 Y-Point</li>
                    <li>Thành viên KIM CƯƠNG: 2.0% x 100.000 đồng = 2.000 Y-Point</li>
                  </ul>
                </div>
              </div>

              <div>
                <strong className="text-[#C92127]">2/ QUY TRÌNH NÂNG HẠNG THÀNH VIÊN DỰA THEO ĐIỂM Y-POINT:</strong>
                <p className="mt-1"><span className="font-semibold">ĐIỂM Y-POINT TÍCH LŨY:</span> Tổng số Y-Point khách hàng đã tích lũy trong năm thông qua việc mua sắm tại YiYi Book.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Hạng thành viên sẽ được YiYi Book xét duyệt dựa trên điểm Y-Point tích lũy được trong năm. Hạng thành viên có thể tăng/giảm/giữ nguyên dựa vào mức phát sinh tổng số điểm Y-Point Tích Lũy của khách hàng.</li>
                  <li>Thời gian chốt điểm tích lũy Y-Point để xét duyệt hạng thành viên là ngày 31.12 hàng năm.</li>
                  <li>Quá trình tích luỹ điểm Y-Point cho chu kỳ mới được tính bắt đầu từ ngày 01.01.</li>
                  <li>Hạng thành viên mới và các quyền lợi tương ứng sẽ được cập nhật và áp dụng từ ngày 15.01.</li>
                  <li>Quà tặng tháng sinh nhật của khách hàng hạng Vàng và Kim Cương sẽ được cộng vào tài khoản Y-Point vào đầu tháng sinh nhật của khách hàng.</li>
                  <li>Để duy trì hạng thành viên, khách hàng phải tích lũy mua hàng trong năm để đảm bảo điểm tích lũy Y-Point của bạn đạt đủ các mốc thành viên trước ngày nâng hạng thành viên là 31.12. Nếu không đạt được thì hạng thành viên sẽ được xét duyệt theo điểm tích lũy Y-Point thực tế của bạn trong năm đó.</li>
                  <li>Trong trường hợp khách hàng không duy trì được thứ hạng và bị giảm thứ hạng thành viên, khách hàng vẫn được nhận trọn ưu đãi của thứ hạng hiện tại khách hàng đang sở hữu.</li>
                </ul>
              </div>

              <div>
                <strong className="text-[#C92127]">3/ QUYỀN LỢI ƯU ĐÃI KHI ĐẶT HÀNG THÀNH CÔNG LẦN ĐẦU:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Tặng 20.000 Y-Point và 01 lần Freeship (Áp dụng từ ngày 27.10.2025)</li>
                </ul>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-900">
                <strong className="text-[#C92127]">* LƯU Ý:</strong>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Sau ngày 31.12 là ngày tổng kết điểm Y-Point, hệ thống sẽ cập nhật thông tin vào tài khoản của mỗi khách hàng trong thời gian từ 10 - 15 ngày làm việc. Khách hàng vẫn được sử dụng số Y-Point đã tích lũy trước khi được nâng hạng để mua hàng tại YiYi Book.</li>
                  <li>Việc tích lũy điểm không áp dụng khi mua mặt hàng phiếu quà tặng, sách Ngoại văn. Khách hàng mua Phiếu quà tặng cũng không được sử dụng Y-Point để thanh toán.</li>
                  <li>Từ ngày 15.01.2025, YiYi Book sẽ cập nhật cách quy đổi mới: Số lần Freeship = Voucher Freeship có thời hạn sử dụng.</li>
                  <li>Thời hạn sử dụng Voucher Freeship: trong vòng 1 năm tính từ ngày 15.01 hàng năm.</li>
                  <li>YiYi Book không chịu trách nhiệm giải quyết các quyền lợi của khách hàng nếu thông tin do khách hàng cung cấp không đầy đủ và không chính xác, hoặc nếu quá thời hạn nhận quyền lợi theo quy định tại thể lệ chương trình.</li>
                  <li>YiYi Book có quyền quyết định bất kỳ lúc nào về việc chỉnh sửa, xét duyệt nâng hạng hoặc chấm dứt chương trình khách hàng thành viên mà không cần báo trước.</li>
                  <li>YiYi Book là bên có quyền quyết định cuối cùng trong mọi vấn đề tranh chấp phát sinh.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-gray-900 mb-3 border-b pb-2">QUY ĐỊNH VỀ TÀI KHOẢN THÀNH VIÊN YIYI BOOK</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-gray-800">1. Số điện thoại tạo lập tài khoản thành viên:</strong>
                <p className="mt-1">Số điện thoại là thông tin quan trọng trong việc quản lý tài khoản thành viên.</p>
                <p>YiYi Book vẫn hỗ trợ thay đổi số điện thoại, tuy nhiên Quý khách cần xác thực OTP từ số điện thoại tạo lập ban đầu để đảm bảo tính bảo mật. Mỗi số điện thoại chính chủ chỉ có thể dùng để tạo một tài khoản thành viên.</p>
              </div>

              <div>
                <strong className="text-gray-800">2. Xác minh chính chủ khi hỗ trợ tài khoản:</strong>
                <p className="mt-1">Nếu gặp bất kỳ vấn đề về tài khoản, Quý khách vui lòng liên hệ bộ phận CSKH của YiYi Book, cung cấp số điện thoại hoặc email để được hỗ trợ.</p>
                <p>Trong trường hợp Quý khách không thể cung cấp số điện thoại hoặc email chính chủ, YiYi Book không thể hỗ trợ khôi phục mật khẩu, vì việc xác minh chính chủ là bắt buộc nhằm bảo vệ an toàn cho tài khoản.</p>
              </div>

              <div>
                <strong className="text-gray-800">3. Quy định về tham gia trò chơi và nhận Y-Point:</strong>
                <p className="mt-1">Đối với các chương trình Game trên App/Web, nếu YiYi Book phát hiện tài khoản có dấu hiệu gian lận (cheating), YiYi Book có quyền áp dụng các biện pháp giới hạn tài khoản, bao gồm nhưng không giới hạn ở: thu hồi Y-Point phát sinh từ hành vi vi phạm, giới hạn tham gia chương trình, hoặc các giới hạn khác theo điều khoản sử dụng của YiYi Book.</p>
              </div>

              <div>
                <strong className="text-gray-800">4. Xử lý tài khoản vi phạm chính sách:</strong>
                <p className="mt-1">Nếu hệ thống hoặc bộ phận kiểm duyệt của YiYi Book xác định tài khoản có dấu hiệu vi phạm chính sách thành viên, bao gồm nhưng không giới hạn ở: gian lận, tạo nhiều tài khoản bằng thông tin không chính chủ, sử dụng phần mềm can thiệp vào hệ thống, lợi dụng chương trình khuyến mãi, hoặc hành vi gây ảnh hưởng đến sự công bằng của hệ thống, YiYi Book có quyền áp dụng các biện pháp giới hạn tài khoản hoặc khóa vĩnh viễn theo mức độ vi phạm.</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-[#C92127] text-white font-bold rounded-lg hover:bg-red-800 transition-colors shadow-sm">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for My Orders


// Subcomponent for My Vouchers
function MyVouchersTab() {
  const [coupons, setCoupons] = useState([]);
  const [partnerCouponsList, setPartnerCouponsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [voucherTab, setVoucherTab] = useState('mine');
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/coupons`);
        const allCoupons = res.data || [];
        
        // Filter only saved coupons
        const saved = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
        
        // Separating into myCoupons (not partner) and partnerCoupons
        const myCoupons = allCoupons.filter(c => saved.includes(c.code) && !c.isPartner);
        const partnerCoupons = allCoupons.filter(c => saved.includes(c.code) && c.isPartner);
        
        setCoupons(myCoupons);
        setPartnerCouponsList(partnerCoupons);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showNotification('Đã sao chép!', `Mã giảm giá "${code}" đã được lưu.`, 'success');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Vô thời hạn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-normal text-gray-800 mb-6">Ví voucher</h2>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setVoucherTab('mine')}
          className={`pb-2 text-sm font-medium transition-colors ${voucherTab === 'mine' ? 'text-[#C92127] border-b-2 border-[#C92127]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Voucher của tôi
        </button>
        <button 
          onClick={() => setVoucherTab('partner')}
          className={`pb-2 text-sm font-medium transition-colors ${voucherTab === 'partner' ? 'text-[#C92127] border-b-2 border-[#C92127]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Voucher đối tác
        </button>
      </div>

      {voucherTab === 'mine' ? (
        coupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex relative shadow-sm hover:shadow-md transition-shadow min-h-[130px]">
                {/* Left Side: Green Background */}
                <div className="w-[100px] bg-[#28a745] text-white flex items-center justify-center shrink-0">
                  <FaTicketAlt className="text-3xl" />
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 p-3 flex flex-col justify-between relative">
                  <div className="pr-16">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `Giảm ${coupon.discountValue}% đơn hàng`
                        : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')} đ`
                      }
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                      Đơn tối thiểu {coupon.minOrderAmount.toLocaleString('vi-VN')} đ. Không bao gồm giá trị của các sản phẩm sau Manga, Ngoại Văn, Phiếu Quà Tặng,...
                    </p>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <div className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded flex items-center gap-1 w-fit">
                      <FaCopy className="text-[10px]" /> {coupon.code}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xs text-[#2489F4]">HSD: {formatDate(coupon.expirationDate)}</span>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`text-white text-xs font-bold px-4 py-1.5 rounded transition-colors ${
                        copiedCode === coupon.code ? 'bg-green-500' : 'bg-[#2489F4] hover:bg-blue-600'
                      }`}
                    >
                      {copiedCode === coupon.code ? 'Đã copy' : 'Copy mã'}
                    </button>
                  </div>

                  {/* Chi tiết link */}
                  <button 
                    onClick={() => setSelectedCoupon(coupon)}
                    className="absolute top-3 right-3 text-[#2489F4] text-xs font-medium hover:underline"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
            Hiện tại bạn chưa có voucher nào.
          </div>
        )
      ) : (
        partnerCouponsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerCouponsList.map((coupon) => (
              <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex relative shadow-sm hover:shadow-md transition-shadow min-h-[130px]">
                {/* Left Side: Orange Background for Partner */}
                <div className="w-[100px] bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <FaTicketAlt className="text-3xl" />
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 p-3 flex flex-col justify-between relative">
                  <div className="pr-16">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-1">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `Giảm ${coupon.discountValue}% đơn hàng`
                        : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')} đ`
                      }
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                      Đơn tối thiểu {coupon.minOrderAmount.toLocaleString('vi-VN')} đ. Không bao gồm giá trị của các sản phẩm sau Manga, Ngoại Văn, Phiếu Quà Tặng,...
                    </p>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <div className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded flex items-center gap-1 w-fit">
                      <FaCopy className="text-[10px]" /> {coupon.code}
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-1">
                    <span className="text-xs text-[#2489F4]">HSD: {formatDate(coupon.expirationDate)}</span>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      className={`text-white text-xs font-bold px-4 py-1.5 rounded transition-colors ${
                        copiedCode === coupon.code ? 'bg-orange-600' : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                    >
                      {copiedCode === coupon.code ? 'Đã copy' : 'Copy mã'}
                    </button>
                  </div>

                  {/* Chi tiết link */}
                  <button 
                    onClick={() => setSelectedCoupon(coupon)}
                    className="absolute top-3 right-3 text-[#2489F4] text-xs font-medium hover:underline"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500 border border-gray-100">
            Hiện tại chưa có voucher đối tác nào được lưu.
          </div>
        )
      )}

      {/* Detail Modal */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCoupon(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Chi tiết Voucher</h3>
              <button 
                onClick={() => setSelectedCoupon(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-gray-600">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Mã Voucher:</span>
                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{selectedCoupon.code}</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Phân loại:</span>
                <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${selectedCoupon.isPartner ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedCoupon.isPartner ? 'Voucher Đối Tác' : 'Voucher Hệ Thống (Tất cả)'}
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Mức ưu đãi:</span>
                <span className="font-bold text-green-600 text-right">
                  {selectedCoupon.discountType === 'PERCENTAGE' 
                    ? `Giảm ${selectedCoupon.discountValue}% (Tối đa ${selectedCoupon.maxDiscountAmount ? selectedCoupon.maxDiscountAmount.toLocaleString('vi-VN') + ' đ' : 'Không giới hạn'})`
                    : `Giảm ${selectedCoupon.discountValue.toLocaleString('vi-VN')} đ`
                  }
                </span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Đơn tối thiểu:</span>
                <span className="font-semibold text-gray-800">{selectedCoupon.minOrderAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <span className="font-medium text-gray-500">Hạn sử dụng:</span>
                <span className="font-semibold text-gray-800">{formatDate(selectedCoupon.expirationDate)}</span>
              </div>

              <div className="pt-2">
                <span className="font-bold text-gray-800 block mb-1">Cách sử dụng:</span>
                <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
                  <li>Mã này đã được thêm vào <b>Ví Voucher</b> của bạn.</li>
                  <li>Mã sẽ được tự động áp dụng (nếu có giá trị cao nhất) ở bước <b>Giỏ hàng</b> hoặc <b>Thanh toán</b>.</li>
                  <li>Bạn cũng có thể copy mã <span className="font-mono bg-gray-100 px-1 rounded">{selectedCoupon.code}</span> để tự nhập thủ công.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedCoupon(null)}
                className="px-5 py-2 bg-[#C92127] text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
