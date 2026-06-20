import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhone, 
  FaBookOpen,
  FaCcVisa,
  FaCcMastercard,
  FaApple,
  FaGooglePlay
} from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      {/* Top Section: Newsletter */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-800 uppercase mb-1">Đăng ký nhận bản tin</h3>
            <p className="text-gray-600 text-sm">Đừng bỏ lỡ các chương trình khuyến mãi hấp dẫn từ YiYi Book</p>
          </div>
          <form className="flex w-full md:w-auto max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn" 
              className="flex-1 px-4 py-2.5 rounded-l-md border border-gray-300 focus:outline-none focus:border-primary"
              required
            />
            <button 
              type="submit" 
              className="bg-primary hover:bg-primary-light text-white font-medium px-6 py-2.5 rounded-r-md transition-colors whitespace-nowrap"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Middle Section: Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Company Info */}
          <div>
            <Link to="/" className="flex items-center text-primary font-bold text-2xl gap-2 mb-4">
              <img src="/src/assets/logo_YiYi.png" alt="YiYi Book" className="h-10 object-contain" />
              <span>YiYi Book</span>
            </Link>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-gray-400 shrink-0" />
                <span>123 Đường Sách, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-gray-400 shrink-0" />
                <span>cskh@yiyibook.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-gray-400 shrink-0" />
                <span>1900 1234</span>
              </li>
            </ul>
          </div>

          {/* Col 2: Customer Service */}
          <div>
            <h3 className="font-bold text-gray-800 text-base uppercase mb-4">Dịch vụ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/returns" className="text-gray-600 hover:text-primary transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/warranty" className="text-gray-600 hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-primary transition-colors">Chính sách vận chuyển</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">Liên hệ - Góp ý</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h3 className="font-bold text-gray-800 text-base uppercase mb-4">Tài khoản của bạn</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="text-gray-600 hover:text-primary transition-colors">Cập nhật tài khoản</Link></li>
              <li><Link to="/orders" className="text-gray-600 hover:text-primary transition-colors">Lịch sử mua hàng</Link></li>
              <li><Link to="/wishlist" className="text-gray-600 hover:text-primary transition-colors">Danh sách yêu thích</Link></li>
              <li><Link to="/points" className="text-gray-600 hover:text-primary transition-colors">Điểm thưởng YiYi Book</Link></li>
            </ul>
          </div>

          {/* Col 4: Payments & Apps */}
          <div>
            <h3 className="font-bold text-gray-800 text-base uppercase mb-4">Phương thức thanh toán</h3>
            <div className="flex gap-3 mb-6">
              <FaCcVisa className="text-4xl text-blue-800" />
              <FaCcMastercard className="text-4xl text-red-600" />
              <div className="w-10 h-6 bg-pink-500 rounded flex items-center justify-center text-white text-[10px] font-bold mt-1.5">MoMo</div>
            </div>
            
            <h3 className="font-bold text-gray-800 text-base uppercase mb-4">Tải ứng dụng</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 transition-colors w-40">
                <FaApple className="text-xl" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] leading-none">Download on the</span>
                  <span className="text-sm font-semibold leading-none">App Store</span>
                </div>
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-md py-2 px-4 hover:bg-gray-800 transition-colors w-40">
                <FaGooglePlay className="text-xl" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] leading-none">GET IT ON</span>
                  <span className="text-sm font-semibold leading-none">Google Play</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: Copyright */}
      <div className="bg-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Công Ty Cổ Phần Phát Hành Sách YiYi Book. Tất cả các quyền được bảo lưu.</p>
          <div className="flex flex-col items-center md:items-end">
            <p className="mb-1">Giấy chứng nhận ĐKKD số: 123456789 do Sở KH & ĐT TP.HCM cấp</p>
            {/* Fake Bo Cong Thuong logo */}
            <a 
              href="http://online.gov.vn/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block w-32 h-10 bg-[url('https://images.tiki.vn/fa/static/img/da-thong-bao-bo-cong-thuong.png')] bg-contain bg-no-repeat bg-center mix-blend-multiply opacity-80 hover:opacity-100 transition-opacity"
            ></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
