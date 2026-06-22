import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Terms() {
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
            <span className="text-gray-900 font-medium">Điều khoản sử dụng</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
            ĐIỀU KHOẢN SỬ DỤNG
          </h1>

          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 space-y-6">
            <p>
              Chào mừng quý khách đến mua sắm tại YiYi Book. Sau khi truy cập vào website của chúng tôi để tham khảo hoặc mua sắm, quý khách đã đồng ý tuân thủ và ràng buộc với những quy định của hệ thống. Vui lòng xem kỹ các quy định và hợp tác với chúng tôi để xây dựng 1 website ngày càng thân thiện và phục vụ tốt những yêu cầu của chính quý khách. Ngoài ra, nếu có bất cứ câu hỏi nào về những thỏa thuận dưới đây, vui lòng liên hệ với chúng tôi theo số điện thoại hotline <strong>1900 1234</strong> hoặc email <strong>cskh@yiyibook.com</strong>.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Tài khoản của khách hàng</h3>
            <p>Một số dịch vụ, tính năng tại đây yêu cầu quý khách cần phải đăng ký Tài khoản thì mới có thể sử dụng. Do đó, để tận hưởng đầy đủ các dịch vụ và tính năng này, quý khách vui lòng cho phép chúng tôi tiến hành xử lý các dữ liệu cá nhân cơ bản sau:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dữ liệu cá nhân cơ bản bắt buộc phải cung cấp:</strong> là các thông tin giúp xác định danh tính đối với từng tài khoản, bao gồm họ tên, địa chỉ email, số điện thoại,... của quý khách. Trường hợp quý khách đăng ký thông qua tài khoản Facebook hoặc Google, các dữ liệu cá nhân cơ bản của quý khách cung cấp cho các nền tảng này sẽ được gửi đến hệ thống ngay khi quý khách cho phép truy cập theo từng chính sách của nền tảng.</li>
              <li><strong>Dữ liệu cá nhân cơ bản được cung cấp để phục vụ giao dịch:</strong> là các thông tin cần thiết để thực hiện một giao dịch tại website, bao gồm địa chỉ giao hàng, địa chỉ thanh toán, phương thức thanh toán,...</li>
              <li><strong>Dữ liệu cá nhân cơ bản tự nguyện cung cấp:</strong> là các thông tin mà quý khách có thể chia sẻ (hoặc không) để cá nhân hóa trải nghiệm sử dụng dịch vụ, bao gồm ngày tháng năm sinh, giới tính, sở thích, nghề nghiệp,...</li>
            </ul>
            <p>Việc sử dụng và bảo mật thông tin Tài khoản là trách nhiệm và quyền lợi của quý khách khi sử dụng dịch vụ. Quý khách phải giữ kín mật khẩu và tài khoản, hoàn toàn chịu trách nhiệm đối với tất cả các hoạt động diễn ra thông qua việc sử dụng mật khẩu hoặc tài khoản của mình. Quý khách nên đảm bảo thoát khỏi Tài khoản sau mỗi lần sử dụng để bảo mật dữ liệu cá nhân của mình.</p>
            <p>Trong trường hợp thông tin do quý khách cung cấp không đầy đủ hoặc có sai sót dẫn đến việc không thể giao hàng, chúng tôi có quyền đình chỉ hoặc từ chối phục vụ, giao hàng mà không phải chịu bất cứ trách nhiệm nào đối với quý khách. Khi có những thay đổi thông tin của quý khách, vui lòng cập nhật lại thông tin trong Tài khoản.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Quyền lợi bảo mật dữ liệu cá nhân của khách hàng</h3>
            <p>Khi sử dụng dịch vụ tại website, quý khách được đảm bảo rằng những thông tin cung cấp cho chúng tôi sẽ chỉ được dùng để nâng cao chất lượng dịch vụ dành cho khách hàng và sẽ không được chuyển giao cho một bên thứ ba nào khác vì mục đích thương mại. Dữ liệu cá nhân của quý khách sẽ được chúng tôi bảo mật và chỉ trong trường hợp pháp luật yêu cầu, chúng tôi sẽ buộc phải cung cấp những thông tin này cho các cơ quan có thẩm quyền.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Trách nhiệm của khách hàng khi sử dụng dịch vụ</h3>
            <p>Quý khách tuyệt đối không được sử dụng bất kỳ công cụ, phương pháp nào để can thiệp, xâm nhập bất hợp pháp vào hệ thống hay làm thay đổi cấu trúc dữ liệu tại website. Quý khách không được có những hành động (như thực hiện, cổ vũ,...) việc can thiệp, xâm nhập dữ liệu cũng như hệ thống máy chủ của chúng tôi.</p>
            <p>Quý khách không được đưa ra những nhận xét, đánh giá có ý xúc phạm, quấy rối, làm phiền hoặc có bất cứ hành vi nào thiếu văn hóa đối với người khác. Không nêu ra những nhận xét có tính chính trị, kỳ thị tôn giáo, giới tính, sắc tộc.... Tuyệt đối cấm mọi hành vi mạo nhận, cố ý tạo sự nhầm lẫn mình là một khách hàng khác hoặc là thành viên Ban Quản Trị.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Trách nhiệm và quyền lợi của chúng tôi</h3>
            <p><strong>Trách nhiệm:</strong> Chúng tôi chịu trách nhiệm tuân thủ các nguyên tắc về xử lý dữ liệu cá nhân theo đúng quy định pháp luật và các điều khoản được nêu ra tại Chính sách bảo mật dữ liệu cá nhân của khách hàng. Trong trường hợp có những phát sinh ngoài ý muốn hoặc trách nhiệm của mình, chúng tôi sẽ không chịu trách nhiệm về mọi tổn thất phát sinh.</p>
            <p><strong>Quyền lợi:</strong> Chúng tôi không cho phép bất kỳ tổ chức, cá nhân nào quảng bá sản phẩm tại website mà chưa có sự đồng ý bằng văn bản. Các thỏa thuận và quy định trong Điều khoản sử dụng này có thể thay đổi vào bất cứ lúc nào nhưng sẽ được thông báo cụ thể trên website.</p>
            <p>Trong các chương trình do chúng tôi triển khai trên App/Web, trong trường hợp xác định Quý khách có hành vi gian lận, can thiệp trái phép vào hệ thống, hoặc vi phạm bất kỳ quy định nào của chương trình, chúng tôi có toàn quyền thu hồi một phần hoặc toàn bộ phần thưởng của Quý khách, đồng thời không có nghĩa vụ thông báo trước hay chịu bất kỳ trách nhiệm nào phát sinh liên quan.</p>

            <div className="bg-gray-100 p-6 rounded-lg mt-8 text-sm italic border-l-4 border-primary">
              "TÔI ĐÃ ĐỌC CÁC ĐIỀU KHOẢN DỊCH VỤ NÀY VÀ ĐỒNG Ý VỚI TẤT CẢ CÁC ĐIỀU KHOẢN NHƯ TRÊN CŨNG NHƯ BẤT KỲ ĐIỀU KHOẢN NÀO ĐƯỢC CHỈNH SỬA SAU NÀY. BẰNG CÁCH BẤM NÚT 'ĐĂNG KÝ' KHI ĐĂNG KÝ SỬ DỤNG TRANG WEB, TÔI HIỂU RẰNG TÔI ĐANG TẠO CHỮ KÝ ĐIỆN TỬ CÓ GIÁ TRỊ VÀ HIỆU LỰC TƯƠNG TỰ NHƯ CHỮ KÝ TÔI KÝ BẰNG TAY."
            </div>
            
            <p className="mt-8 text-sm text-gray-500 text-right">
              Hiệu lực: Điều Khoản Sử Dụng Dịch Vụ này được cập nhật và có hiệu lực từ ngày 01/06/2024.<br/>
              Đại diện hệ thống YiYi Book.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
