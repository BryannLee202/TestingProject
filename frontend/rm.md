Hướng dẫn Deploy Frontend lên Vercel
Dự án của bạn đã được cấu hình hoàn tất 100% để sẵn sàng đẩy lên nền tảng Vercel.

Thay đổi đã thực hiện
Biến môi trường linh hoạt (.env): Thay vì code cứng http://localhost:5000/api, toàn bộ ứng dụng (Home, Category, ProductDetail) đã được chuyển sang sử dụng import.meta.env.VITE_API_URL. Khi chạy ở máy tính, nó tự động đọc file .env tôi vừa tạo để nối với Backend local. Khi lên Vercel, bạn có thể thiết lập biến VITE_API_URL tới một Backend trên mạng bất kỳ.

Khắc phục lỗi 404 (React Router): Vercel mặc định thiết lập các trang HTML tĩnh. Khi người dùng truy cập trực tiếp link /cart hoặc ấn F5 trên điện thoại, Vercel sẽ báo lỗi 404. Tôi đã tạo file cấu hình đặc biệt vercel.json với lệnh rewrites chuyên dùng cho React SPA để xử lý triệt để lỗi này.

Kiểm tra biên dịch (Build Test): Ứng dụng đã chạy qua lệnh npm run build và cho kết quả thành công, không có bất kỳ rủi ro lỗi cú pháp nào khi đẩy lên hệ thống Vercel.

🚀 Cách đưa website lên Vercel ngay lập tức
Bạn cần mở Terminal (CMD/PowerShell) trên máy tính của mình và thực hiện 2 bước đơn giản sau:

Bước 1: Di chuyển vào thư mục frontend
Mở Terminal mới và trỏ đường dẫn vào thư mục chứa code React:

bash

cd e:\bookstore-project\frontend
Bước 2: Chạy lệnh Vercel
Gõ lệnh sau và ấn Enter:

bash

npx vercel --prod
TIP

Các câu hỏi Vercel sẽ hỏi trên Terminal (nếu bạn chưa đăng nhập):

Trình duyệt sẽ tự động mở lên để bạn đăng nhập/đăng ký tài khoản Vercel qua Github.
Terminal hỏi: Set up and deploy "~/..."? -> Nhấn Y (Yes).
Terminal hỏi: Which scope do you want to deploy to? -> Nhấn Enter chọn tài khoản mặc định.
Terminal hỏi: Link to existing project? -> Nhấn N (No).
Terminal hỏi: What's your project's name? -> Nhấn Enter để chọn tên gợi ý (ví dụ: frontend).
Terminal hỏi: In which directory is your code located? -> Nhấn Enter (chọn mặc định ./).
Terminal hỏi: Want to modify these settings? -> Nhấn N (No).
Đợi khoảng 1-2 phút, Vercel sẽ cấp cho bạn một đường dẫn (URL) ví dụ như: https://frontend-abc.vercel.app. Bạn có thể gửi link này cho bạn bè xem ngay!

WARNING

Do hiện tại Database SQL Server vẫn nằm trên máy tính của bạn, nên khi bạn bè vào link web trên điện thoại của họ, web sẽ chỉ hiện giao diện khung mà không có hình ảnh/giá sách thật (do web cố gắng gọi http://localhost:5000/api trên điện thoại của họ). Nếu bạn muốn dữ liệu có thật trên mạng, hãy phản hồi lại để chúng ta thiết lập đưa Backend lên Render/Railway nhé!