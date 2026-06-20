import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheckCircle, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { showNotification } from '../../utils/alert';
import treeData from '../../data/provinces.json';

const provincesList = Object.values(treeData).sort((a,b) => a.name.localeCompare(b.name));

export default function AddressModal({ isOpen, onClose, addresses, onSelect, onAddAddress, onDeleteAddress, onSetDefaultAddress, API_BASE_URL }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phone: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  });
  const [saving, setSaving] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const handleCityChange = (e) => {
    const selectedCityName = e.target.value;
    setNewAddress({...newAddress, city: selectedCityName, district: '', ward: ''});
    setDistricts([]);
    setWards([]);
    
    if (selectedCityName) {
      const selectedProv = provincesList.find(p => p.name === selectedCityName || p.name_with_type === selectedCityName);
      if (selectedProv && selectedProv['quan-huyen']) {
        const dists = Object.values(selectedProv['quan-huyen']).sort((a,b) => a.name.localeCompare(b.name));
        setDistricts(dists);
      }
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrictName = e.target.value;
    setNewAddress({...newAddress, district: selectedDistrictName, ward: ''});
    setWards([]);
    
    if (selectedDistrictName && newAddress.city) {
      const selectedProv = provincesList.find(p => p.name === newAddress.city || p.name_with_type === newAddress.city);
      if (selectedProv && selectedProv['quan-huyen']) {
        const selectedDist = Object.values(selectedProv['quan-huyen']).find(d => d.name === selectedDistrictName || d.name_with_type === selectedDistrictName);
        if (selectedDist && selectedDist['xa-phuong']) {
          const wds = Object.values(selectedDist['xa-phuong']).sort((a,b) => a.name.localeCompare(b.name));
          setWards(wds);
        }
      }
    }
  };

  useEffect(() => {
    if (!isOpen) setShowAddForm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveNew = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/addresses`, newAddress);
      onAddAddress(res.data);
      setShowAddForm(false);
      showNotification('Thành công', 'Đã thêm địa chỉ mới', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Lỗi', 'Không thể lưu địa chỉ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" />
            {showAddForm ? 'Thêm địa chỉ mới' : 'Địa chỉ giao hàng của tôi'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {showAddForm ? (
            <form id="add-address-form" onSubmit={handleSaveNew} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên *</label>
                  <input required type="text" value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                  <input required type="tel" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
                  <select required value={newAddress.city} onChange={handleCityChange} className={`border ${newAddress.city ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-200 text-gray-400 bg-gray-50'} rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none`}>
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provincesList.map(p => (
                      <option key={p.code} value={p.name}>{p.name_with_type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện *</label>
                  <select required value={newAddress.district} onChange={handleDistrictChange} className={`border ${newAddress.district ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-200 text-gray-400 bg-gray-50'} rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none`} disabled={!newAddress.city}>
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name_with_type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phường / Xã *</label>
                  <select required value={newAddress.ward} onChange={e => setNewAddress({...newAddress, ward: e.target.value})} className={`border ${newAddress.ward ? 'border-gray-300 text-gray-800 bg-white' : 'border-gray-200 text-gray-400 bg-gray-50'} rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none`} disabled={!newAddress.district}>
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name_with_type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đường, Tòa nhà, Số nhà *</label>
                <input required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="border border-gray-200 rounded-xl px-4 py-3 w-full focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 text-primary focus:ring-primary rounded border-gray-300" />
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FaMapMarkerAlt className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p>Bạn chưa có địa chỉ nào được lưu.</p>
                </div>
              ) : (
                addresses.map(addr => (
                  <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-primary bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 cursor-pointer" onClick={() => onSelect(addr)}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-gray-800 text-lg">{addr.recipientName}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-600">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-primary text-xs font-bold rounded-full ml-2 flex items-center gap-1">
                              <FaCheckCircle /> Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{addr.street}</p>
                        <p className="text-gray-600">{addr.ward}, {addr.district}, {addr.city}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {!addr.isDefault && (
                          <button onClick={() => onSetDefaultAddress(addr.id)} className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                            Đặt mặc định
                          </button>
                        )}
                        <button onClick={() => onDeleteAddress(addr.id)} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              <button 
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FaPlus /> Thêm địa chỉ mới
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          {showAddForm ? (
            <>
              <button onClick={() => setShowAddForm(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                Trở lại
              </button>
              <button form="add-address-form" type="submit" disabled={saving} className={`px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors ${saving ? 'opacity-70' : ''}`}>
                {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
