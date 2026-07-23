import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSave, FaClock, FaLink, FaImage } from 'react-icons/fa';
import { showNotification } from '../../utils/alert';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState({
    flashSaleEndTime: '2', // default hours
    flashSaleTitle: 'Flash Sale',
    partnerBrandsJson: '[]',
    quickLinksJson: '[]'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
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
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/settings`, settings, {
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

  if (loading) return <div>Đang tải...</div>;

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
            <FaLink className="text-blue-500" /> Danh Mục Nhanh (Quick Links) - JSON
          </div>
          <p className="text-sm text-gray-500 mb-2">Định dạng JSON cho các nút danh mục tròn tròn ở trang chủ. (Ví dụ: <code>[&#123;"label":"Sách hot","path":"/search","icon":"FaFire","color":"#FF7020"&#125;]</code>)</p>
          <textarea
            rows="6"
            value={settings.quickLinksJson || '[]'}
            onChange={(e) => handleChange('quickLinksJson', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
          />
        </section>

        {/* Partner Brands */}
        <section className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
            <FaImage className="text-green-500" /> Thương Hiệu Đối Tác (Brands) - JSON
          </div>
          <p className="text-sm text-gray-500 mb-2">Định dạng JSON cho danh sách các đối tác. (Ví dụ: <code>[&#123;"name":"NXB Trẻ","logo":"url"&#125;]</code>)</p>
          <textarea
            rows="6"
            value={settings.partnerBrandsJson || '[]'}
            onChange={(e) => handleChange('partnerBrandsJson', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm"
          />
        </section>

      </div>
    </div>
  );
}
