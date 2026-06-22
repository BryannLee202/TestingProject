import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaEnvelope } from 'react-icons/fa';
import { showNotification } from '../../utils/alert';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function AdminNewsletter() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

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
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-lg">
          <FaEnvelope />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gửi Email Bản Tin</h2>
          <p className="text-sm text-gray-500">Gửi thông báo, quảng cáo, khuyến mãi tới tất cả người đăng ký</p>
        </div>
      </div>

      <div className="p-6">
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
      </div>
    </div>
  );
}
