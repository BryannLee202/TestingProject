import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Returns() {
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
            <span className="text-gray-900 font-medium">Chính sách đổi trả</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            CHÍNH SÁCH ĐỔI / TRẢ / HOÀN TIỀN
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <p>Chúng tôi luôn trân trọng sự tin tưởng và ủng hộ của quý khách hàng khi trải nghiệm mua hàng. Do đó chúng tôi luôn cố gắng hoàn thiện dịch vụ tốt nhất để phục vụ mọi nhu cầu mua sắm của quý khách.</p>
            
            <p>Trong trường hợp hiếm hoi sản phẩm quý khách nhận được có khiếm khuyết, hư hỏng hoặc không như mô tả, chúng tôi cam kết bảo vệ khách hàng bằng chính sách đổi trả/hoàn tiền trên tinh thần bảo vệ quyền lợi người tiêu dùng. Quý khách vui lòng liên hệ hotline <strong>1900 1234</strong> để được hỗ trợ nhanh nhất.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Thời gian áp dụng đổi/trả</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trường hợp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình thức xử lý</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Sản phẩm lỗi (do nhà cung cấp)</td>
                    <td className="px-6 py-4 text-sm text-gray-500">30 ngày đầu tiên</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">Đổi mới / Trả hàng không thu phí</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Sản phẩm lỗi do người sử dụng</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Mọi thời điểm</td>
                    <td className="px-6 py-4 text-sm text-red-600">Không hỗ trợ đổi/trả</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">Sản phẩm không lỗi (khách đổi ý)</td>
                    <td className="px-6 py-4 text-sm text-gray-500">30 ngày đầu tiên</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Đổi/Trả không thu phí (không áp dụng cho voucher/sản phẩm số)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Điều kiện đổi trả</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sản phẩm còn nguyên bao bì như hiện trạng ban đầu.</li>
              <li>Sản phầm còn đầy đủ phụ kiện, quà tặng khuyến mãi kèm theo.</li>
              <li>Sản phẩm không có dấu hiệu đã qua sử dụng, còn nguyên tem, mác hay niêm phong của nhà sản xuất.</li>
              <li>Cung cấp đầy đủ thông tin đối chứng (video mở hộp, hình ảnh sản phẩm lỗi).</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Quy trình đổi trả</h3>
            <p>Quý khách vui lòng thông tin đơn hàng cần hỗ trợ đổi trả theo Hotline hoặc email cskh@yiyibook.com với tiêu đề "Đổi Trả Đơn Hàng [Mã đơn hàng]". Quý khách cần cung cấp đính kèm thêm các bằng chứng để đối chiếu (Video clip khui hàng, hình ảnh lỗi sản phẩm).</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Thời gian hoàn tiền</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>ATM nội địa/ Cổng Zalo Pay/ Cổng VNPay/ Chuyển khoản: 5 - 7 ngày làm việc.</li>
              <li>Visa/ Master/ JCB: 5 - 7 ngày làm việc (tuỳ thuộc vào ngân hàng phát hành thẻ, tối đa 3 tuần).</li>
              <li>Ví điện tử (MoMo, ShopeePay...): 1 - 3 ngày làm việc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
