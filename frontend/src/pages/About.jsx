import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FaBookReader, FaHeart, FaShippingFast, FaCheckCircle, FaAward, FaUsers } from 'react-icons/fa';

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16 pt-6">
      <Helmet>
        <title>Giới thiệu về chúng tôi | YiYi Book</title>
        <meta name="description" content="Khám phá hành trình, sứ mệnh và các giá trị cốt lõi của nhà sách trực tuyến YiYi Book. Nơi kết nối tri thức và tình yêu sách." />
      </Helmet>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Giới thiệu</span>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 via-[#C92127] to-red-800 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-12 relative overflow-hidden text-center md:text-left">
          <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-100px] left-[-100px] w-80 h-80 bg-red-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl">
            <span className="bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20">
              Về Chúng Tôi
            </span>
            <h1 className="text-3xl md:text-5xl font-black mt-4 leading-tight">
              YiYi Book - Khởi Nguồn Tri Thức, Kết Nối Yêu Thương
            </h1>
            <p className="text-red-100 text-sm md:text-lg mt-4 leading-relaxed font-medium">
              Chào mừng bạn đến với YiYi Book, điểm hẹn của những tâm hồn yêu sách. Chúng tôi tự hào mang đến hàng nghìn tựa sách chất lượng cao, văn phòng phẩm cao cấp và những trải nghiệm mua sắm tuyệt vời nhất.
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <FaBookReader className="text-2xl" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Sứ mệnh của chúng tôi</h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                YiYi Book ra đời với khát vọng lan tỏa văn hóa đọc đến mọi ngóc ngách của đất nước. Chúng tôi tin rằng mỗi cuốn sách là một thế giới mới chứa đầy bài học bổ ích, định hướng ước mơ và thay đổi cuộc sống của bạn tốt đẹp hơn.
              </p>
            </div>
            <div className="border-t border-gray-100 mt-6 pt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              YiYi Book Mission Statement
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                <FaAward className="text-2xl" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-4">Tầm nhìn chiến lược</h2>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Trở thành hệ sinh thái nhà sách trực tuyến hàng đầu Việt Nam, được yêu thích nhờ vào sự tận tâm dịch vụ, đa dạng mặt hàng chất lượng cao từ các nhà xuất bản uy tín quốc tế lẫn trong nước, cùng việc tích hợp AI tiên tiến nhất giúp tư vấn chọn sách thông minh cho độc giả.
              </p>
            </div>
            <div className="border-t border-gray-100 mt-6 pt-4 text-xs font-semibold text-orange-400 uppercase tracking-wider">
              YiYi Book Vision 2030
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-gray-800">Tại sao nên chọn YiYi Book?</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Chúng tôi không chỉ bán sách, chúng tôi trao gửi sự tin cậy cùng chất lượng hoàn hảo.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaCheckCircle className="text-emerald-500 text-xl" />,
                title: "100% Sách Thật",
                desc: "Cam kết hoàn tiền 200% nếu phát hiện sách giả, sách kém chất lượng."
              },
              {
                icon: <FaShippingFast className="text-blue-500 text-xl" />,
                title: "Giao Hàng Siêu Tốc",
                desc: "Hỗ trợ đóng gói cẩn thận, vận chuyển nhanh chóng đến tay độc giả toàn quốc."
              },
              {
                icon: <FaHeart className="text-rose-500 text-xl" />,
                title: "Khách Hàng Là Số 1",
                desc: "Chính sách đổi trả hàng linh hoạt trong vòng 7 ngày nếu do lỗi vận chuyển."
              },
              {
                icon: <FaUsers className="text-indigo-500 text-xl" />,
                title: "Tư Vấn Thông Minh",
                desc: "Tích hợp trợ lý ảo AI hiểu rõ sở thích của khách hàng để gợi ý đúng sách bạn cần."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-gray-50 hover:bg-red-50/30 border border-transparent hover:border-red-100 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Story / Timeline */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">Chặng đường phát triển</h2>
          <div className="relative border-l border-gray-200 ml-4 md:ml-6 space-y-8">
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-[#C92127] rounded-full ring-4 ring-red-100"></div>
              <h3 className="text-lg font-bold text-gray-800">Năm 2024: Khởi đầu</h3>
              <p className="text-gray-600 text-sm mt-1">Ý tưởng về YiYi Book ra đời với mục tiêu mang đến nền tảng bookstore online thế hệ mới.</p>
            </div>
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-red-400 rounded-full ring-4 ring-red-50"></div>
              <h3 className="text-lg font-bold text-gray-800">Năm 2025: Phát triển & Tích hợp AI</h3>
              <p className="text-gray-600 text-sm mt-1">Thiết kế hoàn chỉnh hệ thống quản lý kho sách, tích hợp AI chat tư vấn độc giả tìm kiếm sách theo cá nhân hóa sở thích.</p>
            </div>
            <div className="relative pl-6 md:pl-8">
              <div className="absolute left-[-6px] top-1.5 w-3 h-3 bg-gray-300 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-800">Năm 2026: Vươn tầm</h3>
              <p className="text-gray-600 text-sm mt-1">Cải tiến UX/UI, bổ sung các trang sitemap chuẩn SEO, các chính sách minh bạch nhằm tăng trải nghiệm phục vụ khách hàng tốt nhất.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
