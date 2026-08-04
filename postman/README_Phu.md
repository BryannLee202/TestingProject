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
Đã tạo 2 file Environment cấu hình sẵn biến môi trường:
- `YiYi_Book_Local_Environment.json`: Sử dụng cho môi trường chạy Spring Boot Local.
- `YiYi_Book_Docker_Environment.json`: Sử dụng cho môi trường chạy qua Docker Compose.
- **Các biến đã cấu hình:** `baseUrl` (mặc định `http://localhost:8081`), `token` (chuẩn bị sẵn để map JWT), `userId`, `bookId`, `categoryId`, `bannerId`.

### 3. Verify API bằng Postman/Swagger (Epic 1.5)
Quá trình tạo file Collection này được trích xuất (map) đối chiếu trực tiếp 1-1 từ Source Code Backend của dự án (cụ thể là các file Controller như `AuthController.java`, `BookController.java`,...), đảm bảo tính chính xác về mặt định tuyến (routing) và tham số truyền vào (payload body).

## Hướng dẫn sử dụng cho Team (Reviewer):
1. **Import:** Mở ứng dụng Postman, chọn Import và kéo thả 3 file JSON trong thư mục này vào Workspace của team.
2. **Chọn Environment:** Bật (active) môi trường "YiYi Book Local" hoặc "YiYi Book Docker" ở góc phải màn hình Postman.
3. **Thử nghiệm:** Đăng nhập (Auth -> Login) để lấy token, sau đó copy token dán vào biến `token` trong Environment để test các API bảo mật (tạo, sửa, xóa).

---

## Ghi chú cập nhật khi gộp nhánh vào main

Báo cáo phía trên được giữ nguyên như bản gốc. Phần dưới đây ghi lại những thay
đổi đã áp dụng lên bộ collection khi gộp vào `main`, để không lệch với nội dung
báo cáo.

**1. Tên file đã đổi theo Epic trên Jira**

| Tên cũ trong báo cáo | Tên hiện tại |
|---|---|
| `YiYi_Book_API_Collection.json` | `Epic2.1_2.3_Collection_Auth_Books_Categories_Banners_Phu.json` |
| `YiYi_Book_Local_Environment.json` | `Epic2.2_Environment_Local_Phu.json` |
| `YiYi_Book_Docker_Environment.json` | `Epic2.2_Environment_Docker_Phu.json` |

**2. Đã gỡ 2 request `/auth/refresh` và `/auth/logout`**

Mục 1 phía trên ghi bộ Auth gồm 4 request. Thực tế backend chỉ có 2:
`AuthController` khai báo đúng `@PostMapping("/register")` và
`@PostMapping("/login")`. Hai đường dẫn `/auth/refresh` và `/auth/logout` không
tồn tại nên luôn trả 404.

Đây cũng không phải tính năng đang chờ làm: `AuthResponse` chỉ có `{token, user}`,
không có trường `refreshToken`; đăng xuất ở frontend là thao tác thuần client
(`localStorage.removeItem('token')`) vì JWT là stateless. Board Jira của dự án
cũng không có dòng nào nhắc tới `refresh` hay `logout`.

Epic 2.3 yêu cầu "Khai báo endpoints: Auth + Books + Categories + Banners" ở mức
nhóm endpoint. Sau khi gỡ, bộ collection phủ **2/2 endpoint thật của nhóm Auth**,
tức vẫn đạt đủ yêu cầu của Epic.

**3. Đã sửa lỗi khiến toàn bộ request trả 404**

URL trong collection viết `{{baseUrl}}/api/...` trong khi `baseUrl` đã kết thúc
bằng `/api`, nên đường dẫn thật thành `http://localhost:8081/api/api/...`. Đã bỏ
tiền tố `/api` khỏi 18 URL, thống nhất với quy ước mà bộ của Thiên và Tài dùng.

**4. Đã bổ sung test script cho cả 18 request**

Trước đây bộ này không có assertion nào, nên lỗi ở mục 3 không ai phát hiện.
Nay mỗi request đều kiểm tra status code, thời gian phản hồi và cấu trúc body.
Request `PUT`/`DELETE` thao tác trên bản ghi do chính collection vừa tạo, không
sửa hay xoá dữ liệu seed.

Xem `README.md` trong cùng thư mục để biết cách chạy.
