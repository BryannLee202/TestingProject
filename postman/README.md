# Báo cáo kết quả công việc: Postman Workspace & Endpoints

**Người thực hiện (Member 2):** Anh Phú
**Task liên quan:** Epic 1 (1.5) & Epic 2 (2.1, 2.2, 2.3)

## Danh sách công việc đã hoàn thành:

### 1. Tạo Collection & Cấu trúc thư mục (Epic 2.1 & 2.3)
Đã tạo thành công file Collection chứa toàn bộ các API Endpoints thuộc phạm vi phụ trách, bao gồm 4 thư mục chính:
- **Auth:** Đã khai báo các request `/auth/login`, `/register`, `/refresh`, `/logout`. Đã cấu hình sẵn Body dạng JSON (VD: `email`, `password`) cho các endpoint cần thiết.
- **Books:** Đã khai báo đầy đủ các phương thức `GET`, `POST`, `PUT`, `DELETE` cho `/books`, lấy chi tiết sách `/books/{id}` và tìm kiếm `/search`.
- **Categories:** Khai báo đầy đủ các phương thức `GET`, `POST`, `PUT`, `DELETE` cho quản lý danh mục.
- **Banners:** Đã ánh xạ toàn bộ API của Banner Controller, bao gồm lấy danh sách, lấy theo vị trí (`position`), tạo mới, cập nhật và xóa Banner.

*Tất cả các API yêu cầu xác thực đều đã được cấu hình nhúng tự động Token JWT thông qua cơ chế Bearer Token của Collection.*

### 2. Tạo Environment (Epic 2.2)
- `Epic2.1_2.3_Collection_Auth_Books_Categories_Banners_Phu.json`: File Collection chứa toàn bộ các API Auth, Books, Categories, Banners.
- `Epic2.2_Environment_Local_Phu.json`: Cấu hình cho môi trường chạy Spring Boot Local (`baseUrl = http://localhost:8081`).
- `Epic2.2_Environment_Docker_Phu.json`: Cấu hình cho môi trường chạy qua Docker Compose (`baseUrl = http://localhost:8081`).
- **Các biến đã cấu hình:** `baseUrl`, `token`, `userId`, `bookId`, `categoryId`, `bannerId`.

### 3. Verify API bằng Postman/Swagger (Epic 1.5)
Quá trình tạo file Collection này được trích xuất (map) đối chiếu trực tiếp 1-1 từ Source Code Backend của dự án (cụ thể là các file Controller như `AuthController.java`, `BookController.java`,...), đảm bảo tính chính xác về mặt định tuyến (routing) và tham số truyền vào (payload body).

## Hướng dẫn sử dụng cho Team (Reviewer):
1. **Import:** Mở Postman/Thunder Client, chọn Import và chọn 3 file `Epic*.json` trong thư mục `postman/`.
2. **Chọn Environment:** Bật môi trường "Epic 2.2 - Environment Docker (Anh Phú)" hoặc "Epic 2.2 - Environment Local (Anh Phú)".
3. **Thử nghiệm:** Đăng nhập (Auth -> Login) để lấy token, sau đó copy token dán vào biến `token` trong Environment để test các API bảo mật (tạo, sửa, xóa).
