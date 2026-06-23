import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FaSearch, 
  FaTruck, 
  FaInfoCircle, 
  FaRegFileAlt,
  FaCalendarAlt, 
  FaUser, 
  FaMapMarkerAlt, 
  FaTimes,
  FaCheck,
  FaPrint,
  FaTrash
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Modal detail states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Update states
  const [shippingStatus, setShippingStatus] = useState('PENDING');
  const [shippingPartner, setShippingPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders/all`);
      setOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải đơn hàng',
        text: 'Có lỗi xảy ra khi đồng bộ danh sách đơn hàng từ máy chủ.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setShippingStatus(order.shippingStatus || 'PENDING');
    setShippingPartner(order.shippingPartner || '');
    setTrackingNumber(order.trackingNumber || '');
    setIsModalOpen(true);
  };

  const handleUpdateShipping = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/orders/${selectedOrder.id}/shipping`, null, {
        params: {
          status: shippingStatus,
          shippingPartner: shippingPartner || null,
          trackingNumber: trackingNumber || null
        }
      });

      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công',
        text: `Đơn hàng #${selectedOrder.id} đã được cập nhật thông tin vận chuyển.`,
        timer: 1500,
        showConfirmButton: false
      });
      
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order shipping:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi cập nhật',
        text: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = (orderId) => {
    Swal.fire({
      title: 'Xóa đơn hàng?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Có, xóa ngay!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Đơn hàng đã được xóa thành công.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          fetchOrders();
        } catch (error) {
          console.error('Error deleting order:', error);
          Swal.fire(
            'Lỗi!',
            'Không thể xóa đơn hàng lúc này.',
            'error'
          );
        }
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (id) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedOrderIds.length === 0) return;

    Swal.fire({
      title: 'Xóa các đơn hàng đã chọn?',
      text: `Bạn chuẩn bị xóa ${selectedOrderIds.length} đơn hàng. Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Có, xóa ngay!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/orders/bulk`, {
            params: { ids: selectedOrderIds.join(',') }
          });
          Swal.fire({
            title: 'Đã xóa!',
            text: `Đã xóa thành công ${selectedOrderIds.length} đơn hàng.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          setSelectedOrderIds([]);
          fetchOrders();
        } catch (error) {
          console.error('Error deleting orders:', error);
          Swal.fire('Lỗi!', 'Không thể xóa các đơn hàng lúc này.', 'error');
        }
      }
    });
  };

  const handleApproveReturn = async (orderId) => {
    try {
      Swal.fire({
        title: 'Đang xử lý...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });
      await axios.put(`${API_BASE_URL}/orders/${orderId}/return/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      Swal.fire('Thành công', 'Đã chấp nhận yêu cầu trả hàng và chuyển trạng thái thành Đã hoàn tiền.', 'success');
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu.', 'error');
    }
  };

  const handleRejectReturn = async (orderId) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận từ chối?',
        text: "Bạn có chắc chắn muốn từ chối yêu cầu trả hàng này? Đơn hàng sẽ quay lại trạng thái Đã giao.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Đồng ý từ chối',
        cancelButtonText: 'Hủy'
      });
      
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Đang xử lý...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        await axios.put(`${API_BASE_URL}/orders/${orderId}/return/reject`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã từ chối yêu cầu trả hàng.', 'success');
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu.', 'error');
    }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('vi-VN') + ' đ';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-850">Chờ duyệt</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-850">Đang xử lý</span>;
      case 'SHIPPING':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-850">Đang giao</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-850">Đã giao</span>;
      case 'RETURNED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-200">Khách yêu cầu trả hàng</span>;
      case 'REFUNDED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 border border-teal-200">Đã hoàn tiền</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-850">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-850">{status}</span>;
    }
  };

  const getShippingStatusBadge = (shipStatus) => {
    switch (shipStatus) {
      case 'PENDING':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-700 border border-amber-250">Chờ chuẩn bị</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-250">Đang đóng gói</span>;
      case 'SHIPPING':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700 border border-purple-250">Đang vận chuyển</span>;
      case 'DELIVERED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-250">Đã giao hàng</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-rose-50 text-rose-700 border border-rose-250">Đã hủy giao</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-50 text-gray-700 border border-gray-250">{shipStatus}</span>;
    }
  };

  // Lọc đơn hàng
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) || 
                          order.phoneNumber?.includes(searchTerm) || 
                          order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h2>
        <p className="text-gray-500 text-sm mt-1">Duyệt đơn, theo dõi luồng giao nhận vận chuyển và cập nhật vận đơn cho đối tác.</p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-150 flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <input 
            type="text"
            placeholder="Tìm kiếm theo mã đơn, sđt, tên người nhận..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-all text-sm"
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filter */}
        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary transition-all text-sm bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="SHIPPING">Đang giao hàng</option>
            <option value="COMPLETED">Đã giao hàng</option>
            <option value="RETURNED">Yêu cầu trả hàng</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Bulk Delete Button */}
        {selectedOrderIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <FaTrash /> Xóa {selectedOrderIds.length} đơn
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase border-b border-gray-250">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4">Mã đơn</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4">Tổng cộng</th>
                  <th className="px-6 py-4">TT Đơn hàng</th>
                  <th className="px-6 py-4">TT Vận chuyển</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/40">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{order.user?.fullName || 'Khách vãng lai'}</div>
                      <div className="text-xs text-gray-450 mt-0.5">{order.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">{getShippingStatusBadge(order.shippingStatus)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openDetailModal(order)}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FaInfoCircle /> Chi tiết
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Xóa đơn hàng"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail & Update Shipping Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-150 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaRegFileAlt className="text-primary" />
                Chi tiết đơn hàng #{selectedOrder.id}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 transition-colors p-1.5 hover:bg-gray-50 rounded"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Thông tin khách hàng & Giao hàng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-150 text-sm">
                <div className="space-y-2.5">
                  <div className="font-bold text-gray-750 uppercase text-xs tracking-wider border-b pb-1">Người nhận hàng</div>
                  <div className="flex items-center gap-2 text-gray-750 font-semibold"><FaUser className="text-gray-400" /> {selectedOrder.user?.fullName}</div>
                  <div className="text-gray-600"><strong>Số điện thoại:</strong> {selectedOrder.phoneNumber}</div>
                  <div className="text-gray-600 flex items-start gap-1">
                    <FaMapMarkerAlt className="text-gray-400 shrink-0 mt-0.5" /> 
                    <span><strong>Địa chỉ nhận:</strong> {selectedOrder.shippingAddress}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="font-bold text-gray-750 uppercase text-xs tracking-wider border-b pb-1">Chi tiết đơn hàng</div>
                  <div className="flex items-center gap-2 text-gray-600"><FaCalendarAlt className="text-gray-400" /> <strong>Ngày đặt:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('vi-VN')}</div>
                  <div className="text-gray-600"><strong>Phương thức thanh toán:</strong> {
                    selectedOrder.paymentMethod === 'COD' ? 'Thanh toán COD' :
                    selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản Ngân hàng' :
                    selectedOrder.paymentMethod === 'MOMO' ? 'Ví điện tử MoMo' :
                    selectedOrder.paymentMethod === 'ZALOPAY' ? 'Ví điện tử ZaloPay' : selectedOrder.paymentMethod || 'Khác'
                  }</div>
                  <div className="text-gray-650 bg-white px-2 py-1.5 rounded border border-gray-200 text-xs italic">
                    <strong>Ghi chú:</strong> {selectedOrder.customerNote || 'Không có ghi chú.'}
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm mua */}
              <div className="space-y-2.5">
                <div className="font-bold text-gray-750 text-sm">Sản phẩm đã đặt mua</div>
                <div className="border border-gray-150 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 font-semibold text-gray-600 border-b border-gray-150 text-xs uppercase">
                        <th className="px-4 py-2.5">Tên Sách</th>
                        <th className="px-4 py-2.5 text-right w-28">Đơn giá</th>
                        <th className="px-4 py-2.5 text-center w-20">SL</th>
                        <th className="px-4 py-2.5 text-right w-32">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="text-gray-750">
                          <td className="px-4 py-2.5 font-medium">{item.book?.title || 'Sản phẩm đã gỡ bỏ'}</td>
                          <td className="px-4 py-2.5 text-right">{formatPrice(item.price)}</td>
                          <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/50 text-gray-700">
                        <td colSpan="3" className="px-4 py-2 text-right text-xs">Tạm tính:</td>
                        <td className="px-4 py-2 text-right font-medium">{formatPrice(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}</td>
                      </tr>
                      <tr className="bg-gray-50/50 text-gray-700">
                        <td colSpan="3" className="px-4 py-2 text-right text-xs">Phí vận chuyển:</td>
                        <td className="px-4 py-2 text-right font-medium">{formatPrice(selectedOrder.shippingFee || 0)}</td>
                      </tr>
                      {(selectedOrder.discountAmount > 0) && (
                        <tr className="bg-green-50/50 text-green-700">
                          <td colSpan="3" className="px-4 py-2 text-right text-xs">
                            Giảm giá {selectedOrder.couponCode ? `(Mã: ${selectedOrder.couponCode})` : ''}:
                          </td>
                          <td className="px-4 py-2 text-right font-medium">-{formatPrice(selectedOrder.discountAmount)}</td>
                        </tr>
                      )}
                      {(selectedOrder.pointsUsed > 0) && (
                        <tr className="bg-yellow-50/50 text-yellow-700">
                          <td colSpan="3" className="px-4 py-2 text-right text-xs">Sử dụng điểm (Y-Points):</td>
                          <td className="px-4 py-2 text-right font-medium">-{formatPrice(selectedOrder.pointsUsed)}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50 text-gray-850 font-bold border-t">
                        <td colSpan="3" className="px-4 py-2.5 text-right">Tổng giá trị đơn hàng:</td>
                        <td className="px-4 py-2.5 text-right text-primary text-base">{formatPrice(selectedOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Thông tin yêu cầu trả hàng */}
              {selectedOrder.status === 'RETURNED' && (
                <div className="border border-orange-150 bg-orange-50/30 p-5 rounded-2xl space-y-4">
                  <div className="font-bold text-orange-800 text-sm flex items-center gap-2 border-b border-orange-100 pb-2">
                    <FaInfoCircle className="text-orange-500" /> Yêu cầu trả hàng & Hoàn tiền
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div><strong>Lý do:</strong> {selectedOrder.returnReason || 'Không có'}</div>
                    <div><strong>SĐT liên hệ:</strong> {selectedOrder.returnPhone || 'Không có'}</div>
                    <div className="md:col-span-2"><strong>STK & Ngân hàng:</strong> {selectedOrder.returnBank || 'Không có'}</div>
                    <div className="md:col-span-2 bg-white p-3 rounded border border-orange-100 whitespace-pre-wrap"><strong>Chi tiết:</strong><br/>{selectedOrder.returnDetails || 'Không có mô tả thêm'}</div>
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-orange-100">
                    <button onClick={() => handleRejectReturn(selectedOrder.id)} className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm">Từ chối trả hàng</button>
                    <button onClick={() => handleApproveReturn(selectedOrder.id)} className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors text-sm">Chấp nhận hoàn tiền</button>
                  </div>
                </div>
              )}

              {/* Cập nhật vận đơn & trạng thái vận chuyển */}
              <div className="border border-purple-150 bg-purple-50/10 p-5 rounded-2xl space-y-4">
                <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FaTruck className="text-purple-600" /> Cấu hình vận chuyển & Duyệt trạng thái đơn hàng
                </div>
                
                <form onSubmit={handleUpdateShipping} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  {/* Trạng thái vận chuyển */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">Trạng thái giao nhận</label>
                    <select
                      value={shippingStatus}
                      onChange={(e) => setShippingStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm bg-white"
                    >
                      <option value="PENDING">Chờ chuẩn bị</option>
                      <option value="PROCESSING">Đang đóng gói</option>
                      <option value="SHIPPING">Đang vận chuyển</option>
                      <option value="DELIVERED">Đã giao hàng thành công</option>
                      <option value="CANCELLED">Hủy đơn / Hủy giao</option>
                    </select>
                  </div>

                  {/* Đơn vị vận chuyển */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">Đơn vị giao hàng</label>
                    <select
                      value={shippingPartner}
                      onChange={(e) => setShippingPartner(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm bg-white"
                    >
                      <option value="">-- Chọn đơn vị --</option>
                      <option value="Giao Hàng Nhanh (GHN)">Giao Hàng Nhanh (GHN)</option>
                      <option value="Giao Hàng Tiết Kiệm (GHTK)">Giao Hàng Tiết Kiệm (GHTK)</option>
                      <option value="Viettel Post">Viettel Post</option>
                      <option value="J&T Express">J&T Express</option>
                      <option value="VNPost">VNPost</option>
                      <option value="Ninja Van">Ninja Van</option>
                      <option value="Ahamove">Ahamove</option>
                      <option value="GrabExpress">GrabExpress</option>
                    </select>
                  </div>

                  {/* Mã vận đơn */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase">Mã vận đơn (Tracking No.)</label>
                    <input 
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Ví dụ: GHN823612"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary text-sm bg-white"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="sm:col-span-3 flex justify-end gap-3.5 pt-2 border-t border-gray-150">
                    <Link
                      to={`/orders/${selectedOrder.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      <FaPrint /> In hóa đơn PDF
                    </Link>
                    <button
                      type="submit"
                      disabled={updating}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light text-sm font-semibold transition-all cursor-pointer disabled:bg-gray-400"
                    >
                      {updating ? 'Đang cập nhật...' : 'Cập nhật giao hàng'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
