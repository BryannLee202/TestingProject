import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PaymentPrivacy() {
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
            <span className="text-gray-900 font-medium">Bảo mật thanh toán</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            CHÍNH SÁCH BẢO MẬT THANH TOÁN
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Sự Chấp Thuận</h3>
            <p>Hệ thống thanh toán thẻ được cung cấp bởi các đối tác thanh toán ("Đối tác cổng thanh toán") đã được cấp phép hoạt động hợp pháp tại Việt Nam. Theo đó, các tiêu chuẩn bảo mật thanh toán thẻ tại website của chúng tôi đảm bảo tuân thủ theo các tiêu chuẩn bảo mật ngành.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Quy định bảo mật</h3>
            <p>Chính sách giao dịch thanh toán bằng thẻ quốc tế và thẻ nội địa (internet banking) đảm bảo tuân thủ các tiêu chuẩn của các Đối tác cổng thanh toán gồm:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Thông tin tài chính của khách hàng sẽ được bảo vệ trong suốt quá trình giao dịch bằng giao thức SSL (Secure Sockets Layer) bằng cách mã hóa tất cả các thông tin khách hàng nhập vào.</li>
              <li>Chứng nhận tiêu chuẩn bảo mật dữ liệu thông tin thanh toán (PCI DSS) do Trustwave cung cấp.</li>
              <li>Mật khẩu sử dụng một lần (OTP) được gửi qua SMS để đảm bảo việc truy cập tài khoản được xác thực.</li>
              <li>Tiêu chuẩn mã hóa MD5 12 bit.</li>
              <li>Các nguyên tắc và quy định bảo mật thông tin trong ngành tài chính ngân hàng theo quy định của Ngân hàng Nhà nước Việt Nam.</li>
            </ul>

            <p>Chính sách bảo mật giao dịch trong thanh toán áp dụng với khách hàng:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Chúng tôi cung cấp tiện ích lưu giữ Token – chỉ lưu giữ chuỗi đã được mã hóa bởi Đối Tác Cổng Thanh Toán cung cấp. Chúng tôi KHÔNG trực tiếp lưu giữ thông tin thẻ khách hàng. Việc bảo mật thông tin thẻ thanh toán khách hàng được thực hiện bởi Đối Tác Cổng Thanh Toán đã được cấp phép.</li>
              <li>Đối với thẻ quốc tế, thông tin thẻ thanh toán của khách hàng mà có khả năng sử dụng để xác lập giao dịch không được lưu trên hệ thống của chúng tôi. Đối Tác Cổng Thanh Toán sẽ lưu trữ và bảo mật.</li>
              <li>Đối với thẻ nội địa (internet banking), chúng tôi chỉ lưu trữ mã đơn hàng, mã giao dịch và tên Ngân hàng.</li>
              <li>Trong trường hợp khách hàng có bất kỳ thông báo hoặc khiếu nại nào về tình trạng thông tin thanh toán của khách hàng khi mua hàng bị thay đổi, xóa, hủy, sao chép, tiết lộ, di chuyển trái phép hoặc bị chiếm đoạt gây thiệt hại cho khách hàng thì chúng tôi sẽ nỗ lực phối hợp với Đối Tác Cổng Thanh Toán để tìm hiểu vấn đề và hỗ trợ xử lý cho đến khi hoàn tất.</li>
            </ul>
            
            <p>Chúng tôi cam kết đảm bảo thực hiện nghiêm túc các biện pháp bảo mật cần thiết cho mọi hoạt động thanh toán thực hiện qua website/ứng dụng. Các quy định tại Chính Sách Bảo Mật Dữ Liệu Cá Nhân cũng sẽ được áp dụng đồng thời để đảm bảo an toàn các thông tin thanh toán của khách hàng.</p>
            
            <p className="mt-8 text-sm text-gray-500 text-right">
              Hiệu lực: Chính Sách Bảo Mật Thanh Toán này được cập nhật và có hiệu lực từ ngày 01/06/2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
