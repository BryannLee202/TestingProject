import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import axios from 'axios';
import { showNotification } from '../utils/alert';
import { QRCodeCanvas } from 'qrcode.react';
import { FaCreditCard, FaMoneyBillWave, FaMapMarkerAlt, FaTruck, FaTags, FaClipboardList, FaTimes, FaShippingFast, FaCcVisa, FaCcMastercard, FaRegCreditCard } from 'react-icons/fa';
import treeData from '../data/provinces.json';
import AddressModal from '../components/checkout/AddressModal';
import Select from 'react-select';

const provincesList = Object.values(treeData).sort((a,b) => a.name.localeCompare(b.name));

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px #dbeafe' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db'
    },
    padding: '6px',
    borderRadius: '0.75rem',
    backgroundColor: state.isDisabled ? '#f9fafb' : 'white'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:active': {
      backgroundColor: '#3b82f6'
    }
  })
};

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const cartTotal = getCartTotal();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Việt Nam');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');

  const [provinces] = useState(provincesList);
  const [wards, setWards] = useState([]);
  
  const [hasNote, setHasNote] = useState(false);
  const [note, setNote] = useState('');
  const [requireInvoice, setRequireInvoice] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingMethod, setShippingMethod] = useState('STANDARD');
  const [shippingFee, setShippingFee] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [useYPoints, setUseYPoints] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Modal Khuyến mãi
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/addresses/my-addresses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAddresses(res.data);
      const defaultAddr = res.data.find(a => a.default) || res.data[0];
      if (defaultAddr) {
        setName(defaultAddr.recipientName);
        setPhone(defaultAddr.phone);
        setCity(defaultAddr.city);
        setWard(defaultAddr.ward);
        setAddress(defaultAddr.street);
      } else if (user) {
        setName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phoneNumber || '');
      }
    } catch (err) {
      console.error(err);
      if (user) {
        setName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phoneNumber || '');
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
    // Lấy danh sách mã khuyến mãi
    axios.get(`${API_BASE_URL}/coupons`)
      .then(res => setAvailableCoupons(res.data))
      .catch(err => console.error(err));
  }, [user, navigate, API_BASE_URL]);

  const handleCityChange = (selectedOption) => {
    const selectedCityName = selectedOption ? selectedOption.value : '';
    setCity(selectedCityName);
    setWard('');
    setWards([]);
    
    if (selectedCityName) {
      const selectedProv = provincesList.find(p => p.name === selectedCityName || p.name_with_type === selectedCityName);
      if (selectedProv && selectedProv['xa-phuong']) {
        const wds = Object.values(selectedProv['xa-phuong']).sort((a,b) => a.name.localeCompare(b.name));
        setWards(wds);
      }
    }
  };



  useEffect(() => {
    if (city && ward) {
      let isHcm = city === 'Hồ Chí Minh';
      let isHaNoiOrDaNang = city === 'Hà Nội' || city === 'Đà Nẵng';
      
      if (!isHcm && shippingMethod === 'FAST') {
        setShippingMethod('EXPRESS');
      }

      let baseFee = 0;
      if (shippingMethod === 'STANDARD') {
        baseFee = isHcm ? 15000 : (isHaNoiOrDaNang ? 30000 : 35000);
      } else if (shippingMethod === 'EXPRESS') {
        baseFee = isHcm ? 25000 : (isHaNoiOrDaNang ? 45000 : 50000);
      } else if (shippingMethod === 'FAST') {
        baseFee = isHcm ? 40000 : 0; 
      }
      setShippingFee(baseFee);
    } else {
      setShippingFee(0);
    }
  }, [city, ward, shippingMethod]);

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    const code = typeof codeToApply === 'string' ? codeToApply : couponCode;
    if (!code.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await axios.get(`${API_BASE_URL}/coupons/validate`, {
        params: { code: code.trim(), amount: cartTotal }
      });
      if (res.data.valid) {
        setAppliedCoupon(res.data.coupon);
        setDiscountAmount(res.data.discountAmount);
        setCouponCode(res.data.coupon.code);
        setShowCouponModal(false);
        showNotification('Áp dụng thành công!', `Bạn được giảm ${res.data.discountAmount.toLocaleString('vi-VN')} đ`, 'success');
      } else {
        setCouponError(res.data.message || 'Mã giảm giá không hợp lệ.');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Lỗi kiểm tra mã giảm giá.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponError('');
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      const fullAddress = `${address}, ${ward}, ${city}, ${country}`;
      const finalNote = hasNote ? note : '';
      const items = cart.map(item => ({
        bookId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderBody = {
        items,
        shippingAddress: fullAddress,
        phoneNumber: phone,
        paymentMethod,
        shippingFee,
        shippingMethod,
        customerNote: finalNote,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        spentPoints: useYPoints ? Math.min(user?.yPoints || 0, cartTotal + shippingFee - discountAmount) : 0
      };

      const res = await axios.post(`${API_BASE_URL}/orders`, orderBody, {
        headers: user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });

      if (res.status === 200 || res.status === 201) {
        clearCart();
        if (refreshUser) refreshUser();
        setShowPaymentModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          text: 'Cảm ơn bạn đã mua sắm tại YiYi Book.',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          navigate(`/order-success/${res.data.id}`);
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.';
      showNotification('Lỗi', errorMsg, 'error');
    } finally {
      setLoading(false);
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !ward) {
      return showNotification('Thiếu thông tin', 'Vui lòng điền đầy đủ Địa chỉ giao hàng.', 'warning');
    }

    if (paymentMethod !== 'COD') {
      setShowPaymentModal(true);
      return;
    }

    submitOrder();
  };

  const subtotalAfterCoupon = cartTotal + shippingFee - discountAmount;
  const maxUsablePoints = Math.min(user?.yPoints || 0, subtotalAfterCoupon);
  const pointsDiscount = useYPoints ? maxUsablePoints : 0;
  const totalAmount = subtotalAfterCoupon - pointsDiscount;

  const paymentMethodsDetails = [
    { id: 'ZALOPAY', label: 'Ví ZaloPay', icon: <img src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_zalopayapp.svg" alt="ZaloPay" className="h-6 object-contain" /> },
    { id: 'VNPAY', label: 'VNPAY', icon: <img src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_vnpay.svg" alt="VNPAY" className="h-6 object-contain" /> },
    { id: 'SHOPEEPAY', label: 'Ví ShopeePay', icon: <img src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_airpay.svg" alt="ShopeePay" className="h-6 object-contain" /> },
    { id: 'MOMO', label: 'Ví Momo', icon: <img src="https://cdn0.fahasa.com/skin/frontend/base/default/images/payment_icon/ico_momopay.svg" alt="Momo" className="h-6 object-contain" /> },
    { id: 'ATM', label: 'ATM / Internet Banking', icon: <FaRegCreditCard className="text-gray-700 text-2xl" /> },
    { id: 'VISA', label: 'Visa / Master / JCB', icon: <div className="flex gap-1.5"><FaCcVisa className="text-[#1a1f71] text-2xl"/><FaCcMastercard className="text-[#eb001b] text-2xl"/></div> },
    { id: 'COD', label: 'Thanh toán tiền mặt khi nhận hàng (COD)', icon: <FaMoneyBillWave className="text-green-600 text-2xl" /> }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight uppercase">Thanh toán an toàn</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                    <FaMapMarkerAlt />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Thông tin vận chuyển</h2>
                </div>
                {user && (
                  <button type="button" onClick={() => setShowAddressModal(true)} className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors border border-blue-600 hover:bg-blue-50 rounded px-4 py-1.5">
                    Thay đổi
                  </button>
                )}
              </div>
              <div className="p-6">
                {(user && addresses.length > 0) ? (
                  <div className="space-y-2">
                    <p className="text-gray-500">Giao hàng đến <span className="font-semibold text-gray-800">{address ? `${address}, ${ward}, ${city}` : ''}</span></p>
                    <p className="text-gray-500">Người nhận: <span className="font-semibold text-gray-800">{name} - {phone}</span></p>
                  </div>
                ) : (user && addresses.length === 0) ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Bạn chưa thiết lập địa chỉ giao hàng.</p>
                    <button type="button" onClick={() => setShowAddressModal(true)} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                      Thêm địa chỉ giao hàng
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên người nhận *</label>
                      <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nhập họ và tên" className="border border-gray-200 rounded-xl px-4 py-3.5 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập email (Tùy chọn)" className="border border-gray-200 rounded-xl px-4 py-3.5 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ví dụ: 0912345678" className="border border-gray-200 rounded-xl px-4 py-3.5 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                      <Select
                        options={provinces.map(p => ({ value: p.name, label: p.name_with_type }))}
                        value={city ? { value: city, label: provinces.find(p => p.name === city)?.name_with_type } : null}
                        onChange={handleCityChange}
                        placeholder="Chọn Tỉnh/Thành phố"
                        styles={customSelectStyles}
                        isClearable
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phường/Xã *</label>
                      <Select
                        options={wards.map(w => ({ value: w.name, label: w.name_with_type }))}
                        value={ward ? { value: ward, label: wards.find(w => w.name === ward)?.name_with_type || ward } : null}
                        onChange={(selectedOption) => setWard(selectedOption ? selectedOption.value : '')}
                        placeholder="Chọn Phường/Xã"
                        styles={customSelectStyles}
                        isDisabled={!city}
                        isClearable
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
                      <input required type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ví dụ: 123 Lê Lợi" className="border border-gray-200 rounded-xl px-4 py-3.5 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
                  <FaTruck />
                </div>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Phương thức vận chuyển</h2>
              </div>
              <div className="p-6">
                {city && ward && address ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex flex-col justify-between cursor-pointer border-2 rounded-xl p-4 transition-all ${shippingMethod === 'STANDARD' ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input type="radio" name="shippingMethod" value="STANDARD" checked={shippingMethod === 'STANDARD'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-blue-600 w-5 h-5" />
                        <span className="block font-bold text-gray-800 text-base">Giao tiêu chuẩn</span>
                      </div>
                      <div className="ml-8">
                        <strong className="text-gray-900 block text-sm mb-1">
                          {city === 'Hồ Chí Minh' ? '15.000 đ' : (city === 'Hà Nội' || city === 'Đà Nẵng' ? '30.000 đ' : '35.000 đ')}
                        </strong>
                        <span className="text-gray-500 text-xs">Từ 3 - 5 ngày làm việc</span>
                      </div>
                    </label>
                    <label className={`flex flex-col justify-between cursor-pointer border-2 rounded-xl p-4 transition-all ${shippingMethod === 'EXPRESS' ? 'border-blue-500 bg-blue-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'} ${city !== 'Hồ Chí Minh' ? 'md:col-span-2' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <input type="radio" name="shippingMethod" value="EXPRESS" checked={shippingMethod === 'EXPRESS'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-blue-600 w-5 h-5" />
                        <span className="block font-bold text-gray-800 text-base">Giao nhanh</span>
                      </div>
                      <div className="ml-8">
                        <strong className="text-gray-900 block text-sm mb-1">
                          {city === 'Hồ Chí Minh' ? '25.000 đ' : (city === 'Hà Nội' || city === 'Đà Nẵng' ? '45.000 đ' : '50.000 đ')}
                        </strong>
                        <span className="text-gray-500 text-xs">Từ 1 - 2 ngày làm việc</span>
                      </div>
                    </label>
                    {city === 'Hồ Chí Minh' && (
                      <label className={`flex flex-col justify-between cursor-pointer border-2 rounded-xl p-4 transition-all ${shippingMethod === 'FAST' ? 'border-red-500 bg-red-50/30 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'} md:col-span-2`}>
                        <div className="flex items-center gap-3 mb-2">
                          <input type="radio" name="shippingMethod" value="FAST" checked={shippingMethod === 'FAST'} onChange={(e) => setShippingMethod(e.target.value)} className="accent-red-600 w-5 h-5" />
                          <span className="block font-bold text-red-600 text-base">Hỏa tốc (2H)</span>
                        </div>
                        <div className="ml-8 flex justify-between items-center">
                          <div>
                             <strong className="text-red-600 block text-sm mb-1">40.000 đ</strong>
                             <span className="text-gray-500 text-xs">Nhận hàng ngay trong ngày (chỉ nội thành TP.HCM)</span>
                          </div>
                          <FaShippingFast className="text-red-500 text-4xl opacity-80" />
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <div className="text-gray-400 mb-2 flex justify-center"><FaMapMarkerAlt size={24}/></div>
                    <p className="text-gray-600 font-medium">Vui lòng điền đầy đủ Địa chỉ giao hàng để xem phí vận chuyển.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-orange-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
                  <FaCreditCard />
                </div>
                <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Phương thức thanh toán</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethodsDetails.map(method => (
                  <label key={method.id} className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${method.id === 'COD' ? 'md:col-span-2' : ''} ${paymentMethod === method.id ? 'border-blue-500 bg-blue-50/20 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id} 
                      checked={paymentMethod === method.id} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="accent-blue-600 w-5 h-5 flex-shrink-0" 
                    />
                    <div className="h-8 flex items-center justify-center flex-shrink-0 min-w-[3rem]">
                       {method.icon}
                    </div>
                    <span className="text-gray-800 font-medium text-base">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 hover:shadow-md transition-shadow">
               <div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={hasNote} onChange={e => {
                      setHasNote(e.target.checked);
                      if (!e.target.checked) setNote('');
                    }} className="accent-blue-600 w-5 h-5 rounded" />
                    <span className="text-gray-800 font-semibold text-base">Ghi chú cho đơn hàng</span>
                  </label>
                  {hasNote && (
                    <textarea 
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Nhập ghi chú giao hàng (Ví dụ: Giao giờ hành chính)..."
                      className="w-full border border-gray-200 rounded-xl p-4 mt-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white"
                      rows={3}
                    />
                  )}
                </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow mb-8 lg:mb-0">
                 <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={requireInvoice} onChange={e => setRequireInvoice(e.target.checked)} className="accent-blue-600 w-5 h-5 rounded" />
                    <span className="text-gray-800 font-semibold text-base">Yêu cầu xuất hóa đơn điện tử (GTGT)</span>
                  </label>
                  {requireInvoice && (
                    <div className="bg-blue-50/70 text-blue-800 p-5 rounded-xl mt-4 text-sm leading-relaxed border border-blue-100 shadow-inner">
                      <strong className="block mb-1 text-blue-900">Lưu ý quan trọng:</strong> 
                      Từ 01/07/2025, Quý khách chịu trách nhiệm về thông tin địa chỉ xuất Hóa đơn theo quy định Hành chính mới. Hệ thống sẽ không xuất lại hóa đơn nếu thông tin không đúng. Vui lòng cung cấp chính xác thông tin trong ô Ghi chú đơn hàng phía trên.
                    </div>
                  )}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-purple-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
                    <FaTags />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Mã khuyến mãi</h2>
                </div>
                <div className="p-6">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Nhập mã..." 
                      className="px-4 py-3 border border-gray-200 rounded-xl flex-1 outline-none uppercase font-bold text-gray-800 focus:border-purple-500 transition-colors bg-gray-50 focus:bg-white" 
                      readOnly={appliedCoupon !== null}
                    />
                    {appliedCoupon ? (
                      <button type="button" onClick={handleRemoveCoupon} className="bg-red-500 text-white px-5 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm">Xóa</button>
                    ) : (
                      <button type="button" onClick={() => handleApplyCoupon()} disabled={validatingCoupon} className="bg-purple-600 text-white px-5 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                        {validatingCoupon ? '...' : 'Áp dụng'}
                      </button>
                    )}
                  </div>
                  {couponError && <div className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1.5 bg-red-50 p-2 rounded-lg"><FaTimes/> {couponError}</div>}
                  {appliedCoupon && <div className="text-green-700 text-sm mt-3 font-medium bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2 shadow-sm">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span> Áp dụng thành công! Được giảm {discountAmount.toLocaleString('vi-VN')} đ
                  </div>}
                  
                  <button 
                    type="button" 
                    onClick={() => setShowCouponModal(true)}
                    className="w-full mt-4 text-purple-700 font-bold border border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 rounded-xl py-3.5 transition-all flex items-center justify-center gap-2 group"
                  >
                    <FaTags className="text-purple-500 group-hover:scale-110 transition-transform"/> Mở danh sách mã khuyến mãi
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="bg-gray-50/80 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center shadow-sm">
                      <FaClipboardList />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Đơn hàng</h2>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">{cart.length} SP</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-2 divide-y divide-gray-50 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-16 h-20 bg-white rounded-lg p-1 border border-gray-100 flex-shrink-0 shadow-sm">
                         <img src={item.img} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">{item.title}</h3>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-gray-500 text-xs font-medium">SL: {item.quantity}</span>
                          <span className="font-bold text-red-600">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tạm tính</span>
                    <span className="font-medium text-gray-900">{cartTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-gray-900">{shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')} đ` : 'Chưa tính'}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm font-medium">
                      <span>Khuyến mãi</span>
                      <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  {user && user.yPoints > 0 && (
                    <div className="flex justify-between items-center text-gray-600 text-sm py-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={useYPoints} onChange={e => setUseYPoints(e.target.checked)} className="accent-red-600 w-4 h-4 rounded" />
                        <span className="flex items-center gap-1">Dùng Y-Point <div className="w-3.5 h-3.5 bg-yellow-400 text-white rounded-full flex items-center justify-center text-[8px] font-bold">Y</div> (Có: {(user.yPoints).toLocaleString()})</span>
                      </label>
                      {useYPoints && <span className="font-medium text-red-600">-{pointsDiscount.toLocaleString('vi-VN')} đ</span>}
                    </div>
                  )}
                  <div className="pt-5 mt-2 border-t border-gray-200/80 border-dashed">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-800 font-bold text-lg">Tổng thanh toán</span>
                      <span className="text-3xl font-extrabold text-red-600 tracking-tight">{totalAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <p className="text-right text-[11px] text-gray-500">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
                <div className="p-6 pt-2 bg-gray-50/50">
                  <button 
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all ${
                      cart.length === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white transform hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {loading ? 'ĐANG XỬ LÝ...' : (cart.length === 0 ? 'GIỎ HÀNG TRỐNG' : 'ĐẶT HÀNG NGAY')}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4 px-2 leading-relaxed">
                    Bằng việc tiến hành Đặt hàng, Bạn đã đồng ý với <a href="#" className="text-blue-600 hover:underline font-medium">Điều khoản & Điều kiện</a> của YiYi Book.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        addresses={addresses}
        onSelect={(addr) => {
          setName(addr.recipientName);
          setPhone(addr.phone);
          setCity(addr.city);
          setWard(addr.ward);
          setAddress(addr.street);
          setShowAddressModal(false);
        }}
        onAddAddress={(newAddr) => {
          setAddresses([...addresses, newAddr]);
          if (addresses.length === 0 || newAddr.isDefault) {
            setName(newAddr.recipientName);
            setPhone(newAddr.phone);
            setCity(newAddr.city);
            setWard(newAddr.ward);
            setAddress(newAddr.street);
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

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-center relative">
               <h3 className="text-xl font-bold text-white uppercase tracking-wider">Thanh toán đơn hàng</h3>
               {!isProcessingPayment && (
                 <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                   <FaTimes />
                 </button>
               )}
            </div>
            <div className="p-8 flex flex-col items-center">
               <div className="mb-4 text-center">
                 <p className="text-gray-500 text-sm font-medium mb-1">Phương thức thanh toán</p>
                 <div className="text-xl font-bold text-blue-700 flex items-center justify-center gap-2">
                    {paymentMethodsDetails.find(m => m.id === paymentMethod)?.icon}
                    <span className="ml-2">{paymentMethodsDetails.find(m => m.id === paymentMethod)?.label}</span>
                 </div>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-blue-200 mb-6 flex justify-center w-full">
                 <QRCodeCanvas value={`bookstore_payment_${Date.now()}_amount_${totalAmount}`} size={200} level="H" includeMargin={true} />
               </div>
               <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm mb-1">Số tiền cần thanh toán</p>
                  <p className="text-3xl font-black text-red-600">{totalAmount.toLocaleString('vi-VN')} đ</p>
               </div>
               <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                       setIsProcessingPayment(true);
                       setTimeout(submitOrder, 2500);
                    }}
                    disabled={isProcessingPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-70"
                  >
                    {isProcessingPayment ? (
                      <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Đang xác nhận hệ thống...</>
                    ) : (
                      'Tôi đã thanh toán thành công'
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-400 font-medium">Hệ thống sẽ tự động đối soát sau khi bạn quét mã QR và chuyển khoản thành công.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowCouponModal(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[85vh] shadow-2xl transform transition-all scale-100 opacity-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                 <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                   <FaTags />
                 </div>
                 Chọn mã khuyến mãi
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><FaTimes size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 space-y-4 custom-scrollbar">
              {availableCoupons.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <FaTags className="mx-auto text-5xl text-gray-200 mb-4" />
                  <p className="font-medium text-gray-600">Hiện chưa có mã khuyến mãi nào khả dụng.</p>
                </div>
              ) : (
                availableCoupons.map(coupon => {
                  const isEligible = cartTotal >= coupon.minOrderAmount;
                  return (
                    <div key={coupon.id} className={`bg-white border-2 rounded-2xl p-5 flex gap-5 transition-all ${isEligible ? 'border-purple-100 hover:border-purple-400 hover:shadow-md' : 'border-gray-100 opacity-70 grayscale'}`}>
                      <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center border-r-2 border-dashed border-gray-100 pr-5">
                         <div className="bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 p-4 rounded-full mb-2 shadow-inner">
                           <FaTags size={24} />
                         </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-gray-800 text-lg uppercase tracking-wider">{coupon.code}</h4>
                            <p className="text-sm text-gray-600 mt-1 leading-snug">
                              {coupon.discountType === 'PERCENTAGE' 
                                ? `Giảm ${coupon.discountValue}% tổng đơn hàng${coupon.maxDiscountAmount > 0 ? ` (Tối đa ${coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ)` : ''}`
                                : `Giảm ${coupon.discountValue.toLocaleString('vi-VN')} đ`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                           <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                             Đơn tối thiểu {coupon.minOrderAmount.toLocaleString('vi-VN')} đ
                           </span>
                           {isEligible ? (
                             <button 
                               type="button" 
                               onClick={() => {
                                 setCouponCode(coupon.code);
                                 handleApplyCoupon(coupon.code);
                               }}
                               className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-sm hover:shadow-purple-500/30 hover:-translate-y-0.5 active:translate-y-0"
                             >
                               Áp dụng
                             </button>
                           ) : (
                             <span className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                               Chưa đủ điều kiện
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-5 border-t border-gray-100 bg-white">
               <button onClick={() => setShowCouponModal(false)} className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg rounded-xl transition-colors">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Global Style for Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af; 
        }
      `}} />
    </div>
  );
}
