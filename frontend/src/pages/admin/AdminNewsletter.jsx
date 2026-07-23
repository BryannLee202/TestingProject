import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaEnvelope, FaTrash, FaList, FaRegPaperPlane } from 'react-icons/fa';
import { showNotification } from '../../utils/alert';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminNewsletter() {
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'manage'
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubscribers = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/newsletter`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(res.data || []);
    } catch (error) {
      console.error(error);
      showNotification('Lỗi', 'Không thể tải danh sách người đăng ký', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'manage') {
      fetchSubscribers();
    }
  }, [activeTab, fetchSubscribers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa email này khỏi danh sách nhận bản tin?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/newsletter/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Thành công', 'Đã xóa email đăng ký', 'success');
      fetchSubscribers();
    } catch {
      showNotification('Lỗi', 'Lỗi khi xóa email đăng ký', 'error');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      showNotification('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.', 'error');
      return;
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn gửi email này đến TOÀN BỘ người đăng ký nhận bản tin? Hành động này không thể hoàn tác.')) {
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/newsletter/send-bulk`, { subject, body }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Thành công', 'Đã bắt đầu gửi email hàng loạt tới các người đăng ký.', 'success');
      setSubject('');
      setBody('');
    } catch (error) {
      console.error('Lỗi khi gửi bản tin:', error);
      showNotification('Lỗi', error.response?.data?.message || 'Không thể gửi email.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg">
            <FaEnvelope />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản Lý Bản Tin</h2>
            <p className="text-sm text-gray-500">Gửi email thông báo và quản lý danh sách đăng ký nhận bản tin</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('send')}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'send' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FaRegPaperPlane className="inline-block mr-2" /> Gửi Email Bản Tin
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FaList className="inline-block mr-2" /> Danh sách người đăng ký
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'send' && (
        <form onSubmit={handleSend} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề Email <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: 🔥 Flash Sale Giữa Tháng - Giảm tới 50% toàn bộ sách!"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nội dung Email <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows="10"
              placeholder="Nhập nội dung email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
              required
            />
            <p className="text-xs text-gray-500 mt-2">Nội dung sẽ được gửi dưới dạng văn bản (Plain Text).</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={sending}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-sm transition-all ${
                sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark hover:shadow-md'
              }`}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Gửi Tới Toàn Bộ Subscriber
                </>
              )}
            </button>
          </div>
        </form>
        )}

        {activeTab === 'manage' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Tổng số: {subscribers.length} email</h3>
              <button onClick={fetchSubscribers} className="text-sm text-blue-600 hover:underline">Làm mới</button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">Chưa có ai đăng ký nhận bản tin</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <th className="p-3 font-semibold">ID</th>
                      <th className="p-3 font-semibold">Email</th>
                      <th className="p-3 font-semibold">Trạng thái</th>
                      <th className="p-3 font-semibold text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-sm text-gray-500">#{sub.id}</td>
                        <td className="p-3 text-sm font-medium text-gray-800">{sub.email}</td>
                        <td className="p-3 text-sm">
                          {sub.active ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Đang hoạt động</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Đã hủy</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-center">
                          <button 
                            onClick={() => handleDelete(sub.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Xóa khỏi danh sách"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
