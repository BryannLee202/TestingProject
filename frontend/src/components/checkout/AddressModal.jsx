import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheckCircle, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { showNotification } from '../../utils/alert';
import treeData from '../../data/provinces.json';

const provincesList = Object.values(treeData).sort((a,b) => a.name.localeCompare(b.name));

export default function AddressModal({ isOpen, onClose, addresses, onSelect, onAddAddress, onDeleteAddress, onSetDefaultAddress, API_BASE_URL }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    country: 'Việt Nam',
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
      const addressToSave = {
        recipientName: `${newAddress.lastName} ${newAddress.firstName}`.trim(),
        phone: newAddress.phone,
        city: newAddress.city,
        district: newAddress.district,
        ward: newAddress.ward,
        street: newAddress.street,
        isDefault: newAddress.isDefault
      };
      const res = await axios.post(`${API_BASE_URL}/addresses`, addressToSave);
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
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl text-gray-800">
            {showAddForm ? 'Thêm địa chỉ mới' : <span className="flex items-center gap-2 font-bold"><FaMapMarkerAlt className="text-primary" /> Địa chỉ giao hàng của tôi</span>}
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
            <form id="add-address-form" onSubmit={handleSaveNew} className="space-y-4 px-2 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Họ<span className="text-red-500">*</span></label>
                <input required type="text" value={newAddress.lastName} onChange={e => setNewAddress({...newAddress, lastName: e.target.value})} className="sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none transition-colors" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Tên<span className="text-red-500">*</span></label>
                <input required type="text" value={newAddress.firstName} onChange={e => setNewAddress({...newAddress, firstName: e.target.value})} className="sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Điện thoại<span className="text-red-500">*</span></label>
                <input required type="tel" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Quốc gia<span className="text-red-500">*</span></label>
                <select value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none bg-white">
                  <option value="Việt Nam">Việt Nam</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Tỉnh/Thành phố<span className="text-red-500">*</span></label>
                <select required value={newAddress.city} onChange={handleCityChange} className={`sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none bg-white ${!newAddress.city ? 'text-gray-400' : 'text-gray-800'}`}>
                  <option value="">Vui lòng chọn Tỉnh/Thành phố</option>
                  {provincesList.map(p => (
                    <option key={p.code} value={p.name}>{p.name_with_type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Quận/Huyện<span className="text-red-500">*</span></label>
                <select required value={newAddress.district} onChange={handleDistrictChange} className={`sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none bg-white ${!newAddress.district ? 'text-gray-400' : 'text-gray-800'}`} disabled={!newAddress.city}>
                  <option value="">Vui lòng chọn Quận/Huyện</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.name}>{d.name_with_type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Xã/Phường<span className="text-red-500">*</span></label>
                <select required value={newAddress.ward} onChange={e => setNewAddress({...newAddress, ward: e.target.value})} className={`sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none bg-white ${!newAddress.ward ? 'text-gray-400' : 'text-gray-800'}`} disabled={!newAddress.district}>
                  <option value="">Vui lòng chọn Xã/Phường</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.name}>{w.name_with_type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Địa chỉ<span className="text-red-500">*</span></label>
                <input required type="text" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} placeholder="Địa chỉ" className="sm:w-3/4 border border-gray-200 rounded px-3 py-2.5 focus:border-red-500 focus:outline-none transition-colors" />
              </div>

              <div className="flex items-center gap-2 mt-2 sm:pl-[25%] sm:ml-4">
                <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 text-red-600 focus:ring-red-500 rounded border-gray-300" />
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
        <div className="px-6 py-5 border-t border-gray-100 flex justify-between items-center bg-white">
          {showAddForm ? (
            <>
              <button onClick={() => setShowAddForm(false)} className="text-blue-500 hover:text-blue-700 transition-colors">
                « Quay lại
              </button>
              <button form="add-address-form" type="submit" disabled={saving} className={`px-6 py-2.5 bg-[#C92127] text-white font-bold rounded hover:bg-red-800 transition-colors ${saving ? 'opacity-70' : ''}`}>
                {saving ? 'ĐANG LƯU...' : 'LƯU ĐỊA CHỈ'}
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button onClick={onClose} className="px-6 py-2 text-gray-600 bg-gray-100 font-bold rounded hover:bg-gray-200 transition-colors">
                ĐÓNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
