import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function FAQ() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>Câu hỏi thường gặp | YiYi Book</title>
      </Helmet>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Câu hỏi thường gặp</h1>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Làm sao để đặt hàng?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Bạn chỉ cần chọn sách yêu thích, thêm vào giỏ hàng và tiến hành thanh toán. Quá trình rất đơn giản, hệ thống hỗ trợ cả thanh toán tiền mặt (COD) lẫn thanh toán online (VNPAY/MoMo).</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Bao lâu thì tôi nhận được sách?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Thời gian giao hàng tùy thuộc vào địa chỉ của bạn. Nội thành TP.HCM thường từ 1-2 ngày làm việc. Các tỉnh thành khác mất khoảng 3-5 ngày làm việc.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Có được đổi trả sách không?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sách có lỗi từ nhà sản xuất (thiếu trang, rách, in mờ) hoặc hư hỏng do vận chuyển. Sách đổi trả phải còn nguyên vẹn và chưa qua sử dụng.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Hệ thống điểm thưởng hoạt động như thế nào?</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Mỗi đơn hàng giao thành công sẽ được tích lũy điểm thưởng. Bạn có thể sử dụng điểm thưởng này để đổi thành các voucher giảm giá cho lần mua hàng tiếp theo trong mục Hồ sơ cá nhân.</p>
        </div>
      </div>
    </div>
  );
}
