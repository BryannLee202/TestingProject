import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Bảo mật dữ liệu cá nhân</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            CHÍNH SÁCH BẢO MẬT DỮ LIỆU CÁ NHÂN CỦA KHÁCH HÀNG
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <p>
              YiYi Book mong muốn đem lại một tiện ích mua hàng trực tuyến tin cậy, tiết kiệm và thấu hiểu người dùng. Chúng tôi tôn trọng quyền riêng tư của khách hàng và cam kết bảo mật dữ liệu cá nhân của khách hàng khi khách hàng tin vào chúng tôi và cung cấp dữ liệu cá nhân của mình cho chúng tôi để mua sắm tại website.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Sự Chấp Thuận</h3>
            <p>Việc quý khách xác nhận đồng ý cho phép xử lý dữ liệu cá nhân của mình đồng nghĩa với việc quý khách đã đọc, hiểu rõ và tự nguyện đồng ý đối với các nội dung được nêu ra trong Chính Sách này. Chúng tôi cam kết rằng việc xử lý dữ liệu là đúng với mục đích, phù hợp và giới hạn trong phạm vi của Chính Sách.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Phạm Vi Thu Thập</h3>
            <p>Chúng tôi chỉ thu thập dữ liệu cá nhân cơ bản của khách hàng, tức những thông tin giúp xác định một con người cụ thể, bao gồm: họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng, địa chỉ thanh toán, giới tính, ngày tháng năm sinh, sở thích, thông tin đăng nhập Tài khoản,... và một số thông tin khác khi khách hàng tương tác trên website. Chúng tôi KHÔNG tiến hành thu thập bất kỳ dữ liệu cá nhân nào thuộc nhóm dữ liệu cá nhân nhạy cảm.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Mục Đích Xử Lý Dữ Liệu</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Đơn Hàng:</strong> để xử lý các vấn đề liên quan đến đơn đặt hàng của quý khách.</li>
              <li><strong>Duy Trì Tài Khoản:</strong> để tạo, xác thực và duy trì tài khoản của quý khách với chúng tôi.</li>
              <li><strong>Dịch Vụ Khách Hàng:</strong> bao gồm các phản hồi cho các yêu cầu, khiếu nại và bình luận, đánh giá.</li>
              <li><strong>Cá Nhân Hóa:</strong> để cải thiện và cá nhân hóa trải nghiệm của khách hàng trên website.</li>
              <li><strong>An Ninh:</strong> cho các mục đích ngăn ngừa các hoạt động phá hủy Tài khoản hoặc giả mạo.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Thời Gian Lưu Trữ & Không Chia Sẻ Dữ Liệu</h3>
            <p>Dữ liệu cá nhân của khách hàng sẽ được lưu trữ và bảo mật trên hệ thống máy chủ kể từ thời điểm bắt đầu xử lý dữ liệu cho đến khi việc xử lý dữ liệu kết thúc, trừ trường hợp khách hàng tự ý xóa hoặc có yêu cầu xóa dữ liệu cá nhân của mình hoặc pháp luật có quy định khác.</p>
            <p>Chúng tôi sẽ không cung cấp dữ liệu cá nhân của khách hàng cho bất kỳ bên thứ ba nào khác, trừ các đối tác cung cấp dịch vụ giao hàng, thanh toán và các yêu cầu pháp lý từ cơ quan nhà nước.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">5. An Toàn Dữ Liệu</h3>
            <p>Chúng tôi luôn nỗ lực để giữ an toàn dữ liệu cá nhân của khách hàng, lưu trữ trong môi trường vận hành an toàn và tuân theo các tiêu chuẩn ngành, pháp luật trong việc bảo mật dữ liệu. Thông tin thanh toán được bảo mật theo tiêu chuẩn quốc tế.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">6. Quyền Của Khách Hàng</h3>
            <p>Khách hàng có quyền được biết về hoạt động xử lý dữ liệu cá nhân của mình; có quyền đồng ý hoặc không đồng ý; quyền truy cập để xem, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình; quyền yêu cầu bồi thường thiệt hại khi xảy ra vi phạm. Đồng thời, khách hàng có nghĩa vụ tự bảo vệ dữ liệu cá nhân của mình và cung cấp thông tin chính xác.</p>
            
            <p className="mt-8 text-sm text-gray-500 text-right">
              Hiệu lực: Chính Sách Bảo Mật Dữ Liệu Cá Nhân này được cập nhật và có hiệu lực từ ngày 01/06/2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
