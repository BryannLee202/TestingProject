import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaStore, FaCommentDots, FaBoxOpen, FaSearch } from 'react-icons/fa';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/orders`);
        setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi tải đơn hàng',
          text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusText = (status, shippingStatus) => {
    if (status === 'COMPLETED') return 'HOÀN THÀNH';
    if (status === 'CANCELLED') return 'ĐÃ HỦY';
    if (status === 'PENDING' || status === 'PENDING_PAYMENT') return 'CHỜ THANH TOÁN';
    if (shippingStatus === 'SHIPPING') return 'ĐANG VẬN CHUYỂN';
    if (status === 'PROCESSING') return 'CHỜ GIAO HÀNG';
    return status;
  };

  const filteredOrders = orders.filter(order => {
    // Filter by tab
    let tabMatch = true;
    if (activeTab === 'PENDING') tabMatch = order.status === 'PENDING' || order.status === 'PENDING_PAYMENT';
    else if (activeTab === 'SHIPPING') tabMatch = order.shippingStatus === 'SHIPPING';
    else if (activeTab === 'PROCESSING') tabMatch = order.status === 'PROCESSING' && order.shippingStatus !== 'SHIPPING';
    else if (activeTab === 'COMPLETED') tabMatch = order.status === 'COMPLETED';
    else if (activeTab === 'CANCELLED') tabMatch = order.status === 'CANCELLED';

    // Filter by search term
    let searchMatch = true;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchId = String(order.id).toLowerCase().includes(lowerSearch);
      const matchProduct = order.items?.some(item => item.book?.title?.toLowerCase().includes(lowerSearch));
      searchMatch = matchId || matchProduct;
    }

    return tabMatch && searchMatch;
  });

  const handleReceived = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận đã nhận hàng?',
        text: "Bạn đã nhận được đơn hàng này và đồng ý thanh toán?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#26aa99',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đã nhận',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await axios.put(`${API_BASE_URL}/orders/${orderId}/shipping?status=DELIVERED`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Cảm ơn bạn đã mua sắm tại YiYi Book!', 'success');
        const res = await axios.get(`${API_BASE_URL}/orders`);
        setOrders(res.data);
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyAgain = async (order) => {
    try {
      setLoading(true);
      for (const item of order.items) {
        await axios.post(`${API_BASE_URL}/cart/items`, {
          bookId: item.book.id,
          quantity: item.quantity
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      navigate('/cart');
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order) => {
    const { value: selectedMethod } = await Swal.fire({
      title: 'Chọn phương thức thanh toán',
      input: 'select',
      inputOptions: {
        'VNPAY': 'Thanh toán qua Ví VNPay',
        'MOMO': 'Thanh toán qua Ví MoMo',
        'ZALOPAY': 'Thanh toán qua Ví ZaloPay'
      },
      inputValue: order.paymentMethod !== 'COD' ? order.paymentMethod : 'VNPAY',
      showCancelButton: true,
      confirmButtonText: 'Thanh Toán',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#26aa99'
    });

    if (selectedMethod) {
      try {
        setLoading(true);
        let url = '';
        if (selectedMethod === 'MOMO') {
          const res = await axios.get(`${API_BASE_URL}/payment/momo/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        } else if (selectedMethod === 'ZALOPAY') {
          const res = await axios.get(`${API_BASE_URL}/payment/zalopay/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        } else {
          const res = await axios.get(`${API_BASE_URL}/payment/create-url?amount=${order.totalAmount}&orderId=${order.id}`);
          url = res.data.url;
        }
        window.location.href = url;
      } catch (error) {
        const errorMsg = error.response?.data?.message || 'Không thể tạo phiên thanh toán';
        Swal.fire('Lỗi', errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Shopee-style Tabs */}
        <div className="bg-white flex overflow-x-auto scrollbar-hide mb-4 shadow-sm">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'PENDING', label: 'Chờ thanh toán' },
            { id: 'PROCESSING', label: 'Chờ giao hàng' },
            { id: 'SHIPPING', label: 'Vận chuyển' },
            { id: 'COMPLETED', label: 'Hoàn thành' },
            { id: 'CANCELLED', label: 'Đã hủy' },
            { id: 'RETURN', label: 'Trả hàng/Hoàn tiền' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex-1 text-center py-4 text-base transition-colors ${
                activeTab === tab.id 
                  ? 'text-primary border-b-2 border-primary font-medium' 
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-gray-200/50 rounded-sm flex items-center px-4 py-2.5 mb-4 border border-gray-300 focus-within:border-gray-400 transition-colors">
          <FaSearch className="text-gray-400 mr-3" />
          <input
            type="text"
            placeholder="Bạn có thể tìm kiếm theo ID đơn hàng hoặc Tên Sản phẩm"
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Order List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-sm shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <FaBoxOpen className="text-5xl" />
            </div>
            <h2 className="text-lg text-gray-700 mb-2">Chưa có đơn hàng</h2>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white shadow-sm p-5 hover:shadow-md transition-shadow">
                
                {/* Order Header (Shop Info & Status) */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase">Yêu thích</span>
                    <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      YiYi Book
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {order.shippingStatus === 'DELIVERED' && (
                      <span className="text-teal-600 flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
                         <span className="text-lg leading-none mb-1">🚚</span> Giao hàng thành công
                      </span>
                    )}
                    <span className="text-primary font-medium uppercase">
                      {getStatusText(order.status, order.shippingStatus)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <Link to={`/orders/${order.id}`} className="block">
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="w-20 h-20 border border-gray-200 shrink-0">
                          <img 
                            src={item.book?.imageUrl || 'https://via.placeholder.com/80'} 
                            alt={item.book?.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base text-gray-800 font-medium truncate">{item.book?.title}</h3>
                          <div className="text-sm text-gray-500 mt-1">Phân loại hàng: Sách in</div>
                          <div className="text-sm text-gray-700 mt-1">x{item.quantity}</div>
                        </div>
                        <div className="text-right flex flex-col justify-center h-20">
                          {item.book?.oldPrice && item.book.oldPrice > item.price && (
                            <span className="text-sm text-gray-400 line-through mr-2">
                              {item.book.oldPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                          <span className="text-primary text-sm font-medium">
                            {item.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>

                {/* Order Total */}
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-end items-center bg-orange-50/30 -mx-5 px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Thành tiền:</span>
                    <span className="text-2xl font-medium text-primary">
                      {order.totalAmount?.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-xs text-gray-500">
                    {order.status === 'COMPLETED' ? 'Đánh giá sản phẩm trước để nhận Thưởng Xu' : 'Vui lòng kiểm tra kỹ tình trạng hàng hóa'}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'COMPLETED' ? (
                      <>
                        <button onClick={() => navigate(`/books/${order.items[0]?.book?.id}`)} className="bg-primary text-white border border-primary px-8 py-2 text-sm rounded hover:bg-primary-light transition-colors">
                          Đánh Giá
                        </button>
                        <button onClick={(() => handleBuyAgain(order))} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm rounded hover:bg-gray-50 transition-colors">
                          Mua Lại
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : order.status === 'PENDING' || order.status === 'PENDING_PAYMENT' ? (
                      <>
                        <button onClick={() => handlePayment(order)} className="bg-primary text-white border border-primary px-8 py-2 text-sm rounded hover:bg-primary-light transition-colors">
                          Thanh Toán Ngay
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : order.status === 'CANCELLED' ? (
                      <>
                        <button onClick={(() => handleBuyAgain(order))} className="bg-primary text-white border border-primary px-8 py-2 text-sm rounded hover:bg-primary-light transition-colors">
                          Mua Lại
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm rounded flex items-center justify-center hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleReceived(order.id)} className="bg-primary text-white border border-primary px-8 py-2 text-sm rounded hover:bg-primary-light transition-colors">
                          Đã Nhận Được Hàng
                        </button>
                        <Link to={`/orders/${order.id}`} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 text-sm flex items-center justify-center rounded hover:bg-gray-50 transition-colors">
                          Xem Chi Tiết
                        </Link>
                      </>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
