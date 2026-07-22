import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export default function Contact() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !content) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ Họ tên, Email và Nội dung góp ý.',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/contacts`, {
        fullName,
        phone,
        email,
        content
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: response.data.message || 'Cảm ơn bạn đã gửi ý kiến đóng góp cho YiYi Book.',
        confirmButtonColor: '#10B981'
      });

      // Clear form
      setFullName('');
      setPhone('');
      setEmail('');
      setContent('');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.response?.data?.message || 'Không thể gửi thông tin góp ý. Vui lòng thử lại sau.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Helmet>
        <title>Liên hệ - Góp ý | YiYi Book</title>
      </Helmet>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Liên hệ với YiYi Book</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe mọi góp ý của bạn để cải thiện chất lượng dịch vụ. 
            Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi qua các kênh dưới đây.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-primary shrink-0">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Địa chỉ</h3>
                <p className="text-gray-600 text-sm">Số 2 Võ Oanh, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-primary shrink-0">
                <FaPhoneAlt className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Điện thoại</h3>
                <p className="text-gray-600 text-sm">1900 1234 - 0123 456 789</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-primary shrink-0">
                <FaEnvelope className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Email</h3>
                <p className="text-gray-600 text-sm">cskh@yiyibook.store</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gửi góp ý</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên của bạn</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" 
                placeholder="Nguyễn Văn A" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" 
                  placeholder="0909..." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" 
                  placeholder="email@example.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
              <textarea 
                required 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition h-32 resize-none" 
                placeholder="Nhập nội dung cần hỗ trợ hoặc góp ý..."
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              Gửi thông tin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
