import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaClock, FaLink, FaImage, FaTrash, FaPlus } from 'react-icons/fa';
import { showNotification } from '../../utils/alert';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminSiteSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    flashSaleEndTime: '2',
    flashSaleTitle: 'Flash Sale'
  });
  
  const [quickLinks, setQuickLinks] = useState([]);
  const [partnerBrands, setPartnerBrands] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
          
          if (res.data.quickLinksJson) {
            try {
              setQuickLinks(JSON.parse(res.data.quickLinksJson));
            } catch(e) {}
          }
          if (res.data.partnerBrandsJson) {
            try {
              setPartnerBrands(JSON.parse(res.data.partnerBrandsJson));
            } catch(e) {}
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        quickLinksJson: JSON.stringify(quickLinks),
        partnerBrandsJson: JSON.stringify(partnerBrands)
      };
      
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/settings`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Thành công', 'Đã lưu cấu hình trang web.', 'success');
    } catch (error) {
      console.error('Lỗi khi lưu cấu hình:', error);
      showNotification('Lỗi', 'Không thể lưu cấu hình.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cấu Hình Trang Web</h2>
          <p className="text-sm text-gray-500">Quản lý các hiển thị động trên trang chủ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <FaSave /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </button>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Flash Sale Settings */}
        <section className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
            <FaClock className="text-yellow-500" /> Cấu Hình Flash Sale
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Flash Sale</label>
              <input 
                type="text" 
                value={settings.flashSaleTitle || ''} 
                onChange={(e) => handleChange('flashSaleTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đếm ngược (Giờ)</label>
              <input 
                type="number" 
                value={settings.flashSaleEndTime || ''} 
                onChange={(e) => handleChange('flashSaleEndTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
            <FaLink className="text-blue-500" /> Danh Mục Nhanh (Quick Links)
          </div>
          <p className="text-sm text-gray-500 mb-4">Các biểu tượng tròn nằm dưới banner ở trang chủ.</p>
          
          <div className="space-y-3">
            {quickLinks.map((link, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">Tên hiển thị</label>
                  <input placeholder="VD: Sách hot" value={link.label || ''} onChange={(e) => { const newArr = [...quickLinks]; newArr[idx].label = e.target.value; setQuickLinks(newArr); }} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">Đường dẫn</label>
                  <input placeholder="VD: /search" value={link.path || ''} onChange={(e) => { const newArr = [...quickLinks]; newArr[idx].path = e.target.value; setQuickLinks(newArr); }} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">Tên Icon (react-icons/fa)</label>
                  <input placeholder="VD: FaFire" value={link.icon || ''} onChange={(e) => { const newArr = [...quickLinks]; newArr[idx].icon = e.target.value; setQuickLinks(newArr); }} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                </div>
                <div className="w-24 shrink-0">
                  <label className="text-xs text-gray-500 block mb-1">Màu sắc</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={link.color || '#000000'} onChange={(e) => { const newArr = [...quickLinks]; newArr[idx].color = e.target.value; setQuickLinks(newArr); }} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                    <input type="text" value={link.color || ''} onChange={(e) => { const newArr = [...quickLinks]; newArr[idx].color = e.target.value; setQuickLinks(newArr); }} className="w-full px-2 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm uppercase" />
                  </div>
                </div>
                <button onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== idx))} className="mt-5 text-red-500 p-2 hover:bg-red-50 rounded transition-colors" title="Xóa mục này">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={() => setQuickLinks([...quickLinks, {label: '', path: '', icon: 'FaCircle', color: '#000000'}])} className="flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm">
              <FaPlus /> Thêm Danh Mục
            </button>
          </div>
        </section>

        {/* Partner Brands */}
        <section className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
            <FaImage className="text-green-500" /> Thương Hiệu Đối Tác (Brands)
          </div>
          <p className="text-sm text-gray-500 mb-4">Các logo thương hiệu chạy ngang ở cuối trang chủ.</p>
          
          <div className="space-y-3">
            {partnerBrands.map((brand, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-green-200 transition-colors">
                <div className="w-16 h-16 shrink-0 bg-white border border-gray-200 rounded p-1 flex items-center justify-center">
                  {brand.logo ? <img src={brand.logo} alt="logo" className="max-w-full max-h-full object-contain" /> : <FaImage className="text-gray-300 text-2xl" />}
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 block mb-1">Tên thương hiệu</label>
                  <input placeholder="VD: NXB Trẻ" value={brand.name || ''} onChange={(e) => { const newArr = [...partnerBrands]; newArr[idx].name = e.target.value; setPartnerBrands(newArr); }} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="text-xs text-gray-500 block mb-1">Đường dẫn URL của Logo</label>
                  <input placeholder="https://example.com/logo.png" value={brand.logo || ''} onChange={(e) => { const newArr = [...partnerBrands]; newArr[idx].logo = e.target.value; setPartnerBrands(newArr); }} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-sm" />
                </div>
                <button onClick={() => setPartnerBrands(partnerBrands.filter((_, i) => i !== idx))} className="mt-5 text-red-500 p-2 hover:bg-red-50 rounded transition-colors" title="Xóa thương hiệu này">
                  <FaTrash />
                </button>
              </div>
            ))}
            <button onClick={() => setPartnerBrands([...partnerBrands, {name: '', logo: ''}])} className="flex items-center gap-2 bg-green-50 text-green-600 border border-green-200 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm">
              <FaPlus /> Thêm Thương Hiệu
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
