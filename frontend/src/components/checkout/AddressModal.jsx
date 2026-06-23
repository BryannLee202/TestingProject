import React, { useState, useEffect } from 'react';
import { FaTimes, FaMapMarkerAlt, FaCheckCircle, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { showNotification } from '../../utils/alert';
import treeData from '../../data/provinces.json';
import Select from 'react-select';

const provincesList = Object.values(treeData).sort((a,b) => a.name.localeCompare(b.name));

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#ef4444' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #ef4444' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#ef4444' : '#d1d5db'
    },
    padding: '2px',
    borderRadius: '0.25rem'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#ef4444' : state.isFocused ? '#fef2f2' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:active': {
      backgroundColor: '#ef4444'
    }
  })
};

export default function AddressModal({ isOpen, onClose, addresses, onSelect, onAddAddress, onEditAddress, onDeleteAddress, onSetDefaultAddress, API_BASE_URL }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    lastName: '',
    firstName: '',
    phone: '',
    country: 'Việt Nam',
    street: '',
    ward: '',
    city: '',
    isDefault: false
  });
  const [saving, setSaving] = useState(false);

  const [wards, setWards] = useState([]);

  const handleCityChange = (selectedOption) => {
    const selectedCityName = selectedOption ? selectedOption.value : '';
    setNewAddress({...newAddress, city: selectedCityName, ward: ''});
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
    if (!isOpen) {
      setShowAddForm(false);
      setEditingId(null);
    }
  }, [isOpen]);

  const handleEditClick = (addr) => {
    const parts = addr.recipientName.trim().split(' ');
    const firstName = parts.length > 0 ? parts.pop() : '';
    const lastName = parts.join(' ');

    setNewAddress({
      lastName,
      firstName,
      phone: addr.phone,
      country: 'Việt Nam',
      street: addr.street,
      ward: addr.ward,
      city: addr.city,
      isDefault: addr.isDefault
    });
    setEditingId(addr.id);
    setShowAddForm(true);

    const selectedProv = provincesList.find(p => p.name === addr.city || p.name_with_type === addr.city);
    if (selectedProv && selectedProv['xa-phuong']) {
      const wds = Object.values(selectedProv['xa-phuong']).sort((a,b) => a.name.localeCompare(b.name));
      setWards(wds);
    }
  };

  const resetForm = () => {
    setNewAddress({
      lastName: '',
      firstName: '',
      phone: '',
      country: 'Việt Nam',
      street: '',
      ward: '',
      city: '',
      isDefault: false
    });
    setWards([]);
    setEditingId(null);
  };

  if (!isOpen) return null;

  const handleSaveNew = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const addressToSave = {
        recipientName: `${newAddress.lastName} ${newAddress.firstName}`.trim(),
        phone: newAddress.phone,
        city: newAddress.city,
        ward: newAddress.ward,
        street: newAddress.street,
        isDefault: newAddress.isDefault
      };
      
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };

      if (editingId) {
        const res = await axios.put(`${API_BASE_URL}/addresses/${editingId}`, addressToSave, config);
        onEditAddress && onEditAddress(res.data);
        showNotification('Thành công', 'Đã cập nhật địa chỉ', 'success');
      } else {
        const res = await axios.post(`${API_BASE_URL}/addresses`, addressToSave, config);
        onAddAddress(res.data);
        showNotification('Thành công', 'Đã thêm địa chỉ mới', 'success');
      }
      
      setShowAddForm(false);
      resetForm();
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
            {showAddForm ? (editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới') : <span className="flex items-center gap-2 font-bold"><FaMapMarkerAlt className="text-primary" /> Địa chỉ giao hàng của tôi</span>}
          </h2>
          <button 
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                resetForm();
              } else {
                onClose();
              }
            }}
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
                <div className="sm:w-3/4">
                  <Select
                    options={provincesList.map(p => ({ value: p.name, label: p.name_with_type }))}
                    value={newAddress.city ? { value: newAddress.city, label: provincesList.find(p => p.name === newAddress.city)?.name_with_type } : null}
                    onChange={handleCityChange}
                    placeholder="Vui lòng chọn Tỉnh/Thành phố"
                    styles={customSelectStyles}
                    isClearable
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <label className="sm:w-1/4 text-sm font-medium text-gray-700">Xã/Phường<span className="text-red-500">*</span></label>
                <div className="sm:w-3/4">
                  <Select
                    options={wards.map(w => ({ value: w.name, label: w.name_with_type }))}
                    value={newAddress.ward ? { value: newAddress.ward, label: wards.find(w => w.name === newAddress.ward)?.name_with_type || newAddress.ward } : null}
                    onChange={(selectedOption) => setNewAddress({...newAddress, ward: selectedOption ? selectedOption.value : ''})}
                    placeholder="Vui lòng chọn Xã/Phường"
                    styles={customSelectStyles}
                    isDisabled={!newAddress.city}
                    isClearable
                    required
                  />
                </div>
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
                          {(addr.isDefault || addr.default) && (
                            <span className="px-2 py-0.5 bg-blue-100 text-primary text-xs font-bold rounded-full ml-2 flex items-center gap-1">
                              <FaCheckCircle /> Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{addr.street}</p>
                        <p className="text-gray-600">{addr.ward}, {addr.city}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => handleEditClick(addr)} className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
                          Sửa
                        </button>
                        {!(addr.isDefault || addr.default) && (
                          <button onClick={() => onSetDefaultAddress(addr.id)} className="text-sm font-medium text-gray-500 hover:text-primary transition-colors border border-gray-300 px-2 py-1 rounded">
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
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
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
              <button onClick={() => {
                setShowAddForm(false);
                resetForm();
              }} className="text-blue-500 hover:text-blue-700 transition-colors">
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
