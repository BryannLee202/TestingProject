import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaList, FaTimes } from 'react-icons/fa';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '',
    expirationDate: '',
    isActive: true,
    isPartner: false,
    userId: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/coupons/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCoupons(res.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Không thể kết nối đến máy chủ. Vui lòng tải lại trang.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      minOrderAmount: '',
      expirationDate: '',
      isActive: true,
      isPartner: false,
      userId: '',
      category: 'DISCOUNT',
      usageLimit: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      minOrderAmount: coupon.minOrderAmount || 0,
      expirationDate: coupon.expirationDate ? coupon.expirationDate.substring(0, 16) : '',
      isActive: coupon.isActive,
      isPartner: coupon.isPartner || false,
      userId: coupon.userId || '',
      category: coupon.category || 'DISCOUNT',
      usageLimit: coupon.usageLimit || 1
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, code) => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: `Voucher "${code}" sẽ bị xóa vĩnh viễn!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/coupons/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          Swal.fire('Đã xóa!', 'Voucher đã được xóa thành công.', 'success');
          fetchCoupons();
        } catch (error) {
          console.error('Error deleting coupon:', error);
          Swal.fire('Lỗi!', 'Không thể xóa voucher này.', 'error');
        }
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      Swal.fire('Lỗi', 'Vui lòng nhập đầy đủ Mã voucher và Giá trị giảm', 'error');
      return;
    }
    
    // Format payload
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      maxDiscountAmount: formData.discountType === 'PERCENTAGE' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
      isActive: formData.isActive,
      isPartner: formData.isPartner,
      userId: formData.userId ? Number(formData.userId) : null,
      category: formData.category,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 1
    };

    try {
      if (editingCoupon) {
        await axios.put(`${API_BASE_URL}/coupons/${editingCoupon.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã cập nhật voucher', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/coupons`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        Swal.fire('Thành công', 'Đã thêm mới voucher', 'success');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      Swal.fire('Lỗi', error.response?.data?.message || 'Không thể lưu voucher. Có thể mã đã tồn tại.', 'error');
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaList className="text-primary" />
            Quản lý Voucher
          </h2>
          <p className="text-gray-500 text-sm mt-1">Danh sách mã giảm giá, khuyến mãi cho khách hàng</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <FaPlus /> Thêm Voucher
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Tìm kiếm mã voucher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
          Tổng cộng: <span className="text-primary font-bold">{filteredCoupons.length}</span> voucher
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Mã Voucher</th>
                  <th className="px-6 py-4 font-semibold">Loại giảm</th>
                  <th className="px-6 py-4 font-semibold">Loại Voucher</th>
                  <th className="px-6 py-4 font-semibold">Mức giảm</th>
                  <th className="px-6 py-4 font-semibold">Đơn tối thiểu</th>
                  <th className="px-6 py-4 font-semibold">Phạm vi</th>
                  <th className="px-6 py-4 font-semibold">Lượt dùng</th>
                  <th className="px-6 py-4 font-semibold">Hạn sử dụng</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === 'PERCENTAGE' ? (
                        <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md text-xs">Theo %</span>
                      ) : (
                        <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded-md text-xs">Cố định</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.category === 'SHIPPING' ? (
                        <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md text-xs">Vận chuyển</span>
                      ) : (
                        <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md text-xs">Sản phẩm</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {coupon.discountType === 'PERCENTAGE' ? (
                        <div>
                          <span>{coupon.discountValue}%</span>
                          {coupon.maxDiscountAmount > 0 && (
                            <div className="text-xs text-gray-500 font-normal mt-1">
                              (Tối đa: {coupon.maxDiscountAmount.toLocaleString('vi-VN')} đ)
                            </div>
                          )}
                        </div>
                      ) : (
                        `${coupon.discountValue.toLocaleString('vi-VN')} đ`
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.userId ? (
                        <span className="text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-md text-xs">Cá nhân (ID: {coupon.userId})</span>
                      ) : coupon.isPartner ? (
                        <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md text-xs">Đối tác</span>
                      ) : (
                        <span className="text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-md text-xs">Hệ thống</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {coupon.usageLimit != null ? `x${coupon.usageLimit}` : 'Không'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {coupon.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(coupon)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <FaEdit size={18}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FaTrash size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FaList size={24} />
            </div>
            <p className="text-lg font-medium">Không tìm thấy voucher nào!</p>
            {searchTerm ? <p className="text-sm mt-1">Vui lòng thử từ khóa khác.</p> : <p className="text-sm mt-1">Hãy bấm "Thêm Voucher" để tạo mã đầu tiên.</p>}
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Cập nhật Voucher' : 'Thêm Voucher Mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="voucherForm" onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Voucher *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="VD: SUMMER2024"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loại giảm giá</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    >
                      <option value="PERCENTAGE">Theo Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mức giảm *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      placeholder={formData.discountType === 'PERCENTAGE' ? "VD: 10" : "VD: 50000"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {formData.discountType === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mức giảm tối đa (đ)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                      placeholder="VD: 50000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống hoặc nhập 0 nếu không giới hạn.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn hàng tối thiểu (đ)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                    placeholder="VD: 150000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Để trống hoặc nhập 0 nếu áp dụng cho mọi đơn.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loại Voucher</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    >
                      <option value="DISCOUNT">Giảm giá Sản phẩm</option>
                      <option value="SHIPPING">Miễn phí Vận chuyển</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượt sử dụng</label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày giờ hết hạn</label>
                  <input 
                    type="datetime-local" 
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ID Người dùng (Tùy chọn)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    placeholder="Nhập ID người dùng nếu muốn gắn riêng (để trống: Toàn hệ thống)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Kích hoạt Voucher</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isPartner}
                        onChange={(e) => setFormData({...formData, isPartner: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-700">Voucher Đối tác</span>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Hủy
              </button>
              <button 
                type="submit"
                form="voucherForm"
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium shadow-sm"
              >
                Lưu Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
