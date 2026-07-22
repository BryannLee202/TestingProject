import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Shipping() {
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
            <span className="text-gray-900 font-medium">Chính sách vận chuyển</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            CHÍNH SÁCH VẬN CHUYỂN/ĐÓNG GÓI
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <p>Chúng tôi cung cấp dịch vụ giao hàng toàn quốc, gửi hàng tận nơi đến địa chỉ cung cấp của Quý khách. Thời gian giao hàng dự kiến phụ thuộc vào kho có hàng và địa chỉ nhận hàng của Quý khách.</p>
            <p>Với đa phần đơn hàng, chúng tôi cần vài giờ làm việc để kiểm tra thông tin và đóng gói hàng. Nếu các sản phẩm đều có sẵn hàng, đơn hàng sẽ nhanh chóng được bàn giao cho đối tác vận chuyển.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Thời gian dự kiến</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuyến giao hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian dự kiến</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">HCM - HCM / Hà Nội - Hà Nội</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Nội Thành & Ngoại Thành</td>
                    <td className="px-6 py-4 text-sm font-medium">1 – 2 ngày</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">HCM - Miền Nam / Hà Nội - Miền Bắc</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Trung tâm Tỉnh, TP / Huyện, xã</td>
                    <td className="px-6 py-4 text-sm font-medium">2 – 3 ngày</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">HCM - Miền Trung / Hà Nội - Miền Trung</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Trung tâm Tỉnh, TP / Huyện, xã</td>
                    <td className="px-6 py-4 text-sm font-medium">3 – 4 ngày</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">HCM - Miền Bắc / Hà Nội - Miền Nam</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Trung tâm Tỉnh, TP / Huyện, xã</td>
                    <td className="px-6 py-4 text-sm font-medium">4 – 5 ngày</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-sm italic text-gray-500">
              *Lưu ý: Trong một số trường hợp, hàng không có sẵn tại kho gần nhất, thời gian giao hàng có thể chậm hơn so với dự kiến. Các phí vận chuyển phát sinh chúng tôi sẽ hỗ trợ hoàn toàn. Ngày làm việc là từ thứ hai đến thứ sáu, không tính thứ bảy, chủ nhật và ngày nghỉ lễ tết.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Bảng giá cước vận chuyển</h3>
            <p>Phí vận chuyển sẽ được tự động tính toán tại bước thanh toán dựa trên trọng lượng đơn hàng và địa chỉ giao hàng của quý khách. Các mốc phí cơ bản theo trọng lượng dưới 2kg như sau:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Khu vực Nội thành HCM/HN:</strong> ~ 15.000 VNĐ</li>
              <li><strong>Khu vực Ngoại thành HCM/HN:</strong> ~ 22.000 VNĐ</li>
              <li><strong>Các tỉnh thành khác:</strong> ~ 32.000 VNĐ</li>
            </ul>
            <p>Đối với đơn hàng có trọng lượng lớn (trên 2kg), phụ phí cước cân nặng sẽ được cộng thêm vào phí vận chuyển. Quý khách vui lòng kiểm tra kỹ số tiền phí giao hàng trước khi xác nhận đặt hàng.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
