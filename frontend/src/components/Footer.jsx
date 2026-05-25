import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaClock } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">VỀ BOOKSTORE</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-600 hover:text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-primary transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-600 hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-primary transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">HỖ TRỢ KHÁCH HÀNG</h3>
            <ul className="space-y-3">
              <li><Link to="/order-guide" className="text-gray-600 hover:text-primary transition-colors">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/shipping-methods" className="text-gray-600 hover:text-primary transition-colors">Phương thức vận chuyển</Link></li>
              <li><Link to="/return-policy" className="text-gray-600 hover:text-primary transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">LIÊN HỆ & HỖ TRỢ</h3>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link to="/support" className="text-gray-600 hover:text-primary transition-colors">Hỗ trợ</Link></li>
              <li><Link to="/submit-contact" className="text-gray-600 hover:text-primary transition-colors">Gửi liên hệ</Link></li>
              <li><Link to="/submit-support" className="text-gray-600 hover:text-primary transition-colors">Gửi yêu cầu hỗ trợ</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-4">THÔNG TIN LIÊN HỆ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600">
                <FaMapMarkerAlt className="mt-1 text-gray-400" />
                <span>123 Đường Sách, TP.HCM</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaEnvelope className="mt-1 text-gray-400" />
                <span>cskh@bookstore.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaPhone className="mt-1 text-gray-400" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FaClock className="mt-1 text-gray-400" />
                <span>8:00 - 22:00 (T2 - CN)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} BookStore - Design by You</p>
        </div>
      </div>
    </footer>
  );
}
