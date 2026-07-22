import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Warranty() {
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
            <span className="text-gray-900 font-medium">Chính sách bảo hành</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            CHÍNH SÁCH BẢO HÀNH – BỒI HOÀN
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Tôi có thể bảo hành sản phẩm tại đâu?</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Bảo hành chính hãng:</strong> Đối với các sản phẩm điện tử, đồ chơi điện tử,... có tem phiếu cam kết bảo hành từ Hãng, khách hàng có thể mang sản phẩm đến trực tiếp Hãng để bảo hành mà không cần thông qua hệ thống của chúng tôi.</li>
              <li><strong>Bảo hành thông qua chúng tôi:</strong> khách hàng liên hệ hotline 1900 1234 để được hỗ trợ tư vấn về thực hiện bảo hành.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. Tôi có thể được bảo hành sản phẩm miễn phí không?</h3>
            <p>Sản phẩm của quý khách được bảo hành miễn phí chính hãng khi:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Còn thời hạn bảo hành (dựa trên tem/phiếu bảo hành hoặc thời điểm kích hoạt bảo hành điện tử).</li>
              <li>Tem/phiếu bảo hành còn nguyên vẹn.</li>
              <li>Sản phẩm bị lỗi kỹ thuật.</li>
            </ul>

            <p>Các trường hợp có thể phát sinh phí bảo hành:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sản phẩm hết thời hạn bảo hành.</li>
              <li>Sản phẩm bị bể, biến dạng, cháy, nổ, ẩm thấp trong động cơ hoặc hư hỏng trong quá trình sử dụng.</li>
              <li>Sản phẩm bị hư hỏng do lỗi của người sử dụng, không xuất phát từ lỗi vốn có của hàng hóa.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Sau bao lâu tôi có thể nhận lại sản phẩm bảo hành?</h3>
            <p>Nếu sản phẩm của quý khách vẫn còn trong thời hạn bảo hành trên tem phiếu bảo hành của Hãng, chúng tôi khuyến khích quý khách gửi trực tiếp đến trung tâm của Hãng để được hỗ trợ bảo hành trong thời gian nhanh nhất.</p>
            <p>Trường hợp quý khách gửi hàng về chúng tôi, thời gian bảo hành dự kiến trong vòng 21- 45 ngày tùy thuộc vào điều kiện sẵn có của linh kiện thay thế từ nhà sản xuất/lỗi sản phẩm (không tính thời gian vận chuyển đi và về).</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Hình thức bảo hành</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Hóa đơn:</strong> khách hàng mang theo hóa đơn trực tiếp hoặc hóa đơn giá trị gia tăng có thông tin của sản phẩm để được bảo hành.</li>
              <li><strong>Phiếu bảo hành:</strong> đi kèm theo sản phẩm, có đầy đủ thông tin về nơi bảo hành và điều kiện bảo hành.</li>
              <li><strong>Tem bảo hành:</strong> loại tem đặc biệt chỉ sử dụng một lần, được dán trực tiếp lên sản phẩm.</li>
              <li><strong>Điện tử:</strong> chế độ bảo hành sản phẩm trực tuyến thay thế cho phương pháp bảo hành thông thường bằng giấy hay thẻ.</li>
            </ul>

            <p className="mt-8 text-sm text-gray-500 text-right">
              Chính sách sẽ được áp dụng và có hiệu lực từ ngày 01/08/2022
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
