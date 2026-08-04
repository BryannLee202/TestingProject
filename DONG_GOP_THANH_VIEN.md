# Bảng đóng góp của các thành viên

Tài liệu này giúp tra nhanh **ai làm phần nào**, kèm lệnh `git` để kiểm chứng
trực tiếp trên lịch sử repo thay vì tin vào bảng này.

Cập nhật khi gộp nhánh `claude/review-branch-merges-vhwr8m` vào `main`.

## Tra cứu nhanh bằng git

```bash
# Toàn bộ thành viên và số commit
git shortlog -sne

# Toàn bộ commit của một người
git log --author="anhvnv8076@ut.edu.vn" --oneline

# Ai viết từng dòng của một file
git blame postman/YiYi_Book_API_Collection_Thien.json

# Lịch sử một file, theo được cả khi file bị đổi tên
git log --follow --oneline -- postman/Epic2.1_2.3_Collection_Auth_Books_Categories_Banners_Phu.json
```

## Định danh git của từng thành viên

| Thành viên | Tên trong git | Email |
|---|---|---|
| Vân Anh | `Vân Anh` / `anhvnv8076-sys` | `anhvnv8076@ut.edu.vn` |
| Đinh Phan | `graperu` | `dinhphan0511@gmail.com` |
| Anh Phú | `Phuyzz` | `anhphu163@gmail.com` |
| Tạ Thiên Vân (Thiên) | `Imagine-Astronomy-THTV` | `tathienvan2000@gmail.com` |
| Lê Minh Tài | `LeMinhTai` / `Lê Minh Tài` | `leminhtai2222005@gmail.com` |

## Phần kiểm thử API bằng Postman (Epic 1 & 2)

Tổng **93 request**, toàn bộ đã được đối chiếu 1-1 với mapping controller thật.

| Thành viên | Jira | Phạm vi | File | Số request |
|---|---|---|---|---|
| Anh Phú | Epic 2.1, 2.2, 2.3 | Auth, Books, Categories, Banners | `postman/Epic2.1_2.3_Collection_Auth_Books_Categories_Banners_Phu.json` | 18 |
| Thiên | Epic 2.3, 2.4 | Cart, Orders, Payment, Wishlist, Address, VAT Invoice | `postman/YiYi_Book_API_Collection_Thien.json` | 35 |
| Lê Minh Tài | Epic 2.5 | Admin, Rewards, RBAC, luồng đặt hàng | `postman/YiYi_Book_API_Collection_Tai.json` | 40 |

Báo cáo riêng của từng người: `postman/README_Phu.md`, `postman/README_Tai.md`.
Hướng dẫn chạy chung: `postman/README.md`.

Thiên còn viết **pre-request script tự động đăng nhập và gán token** dùng cho
toàn bộ folder của mình (Jira: *"Viết Pre-request Script (auto login, set token)"*).

Tài còn làm phần **automation Newman CLI + báo cáo HTML**: `postman/package.json`,
`postman/run-newman.sh`, và workflow `.github/workflows/api-tests.yml`.

## Phần unit test tầng Service

Tổng **274 ca test**, phủ đủ **15/15 class Service**. Chạy `cd backend && ./mvnw test`.

| Thành viên | Số ca | Class được test | Nhánh gốc |
|---|---|---|---|
| Vân Anh | **239** | Auth, Banner, Contact, Newsletter, Notification, Order (3 file), Review, SiteSetting, User, WebSocket | `test/unit-services` (PR #2) |
| Đinh Phan | **35** | Book, Cart, Category, Coupon, Reward | `Sp3-Unitest` / `epic-3/unit-test` |

Vân Anh cũng là người thêm **JaCoCo** để đo độ phủ mã nguồn (`backend/pom.xml`).

Kiểm chứng:

```bash
git log --author="anhvnv8076@ut.edu.vn" --oneline    # 10 commit unit test + JaCoCo
git log --author="dinhphan0511@gmail.com" --oneline  # gồm commit 35 ca test
```

## Phần hạ tầng

Từ board Jira, **Member 1 — Setup & Infrastructure** (cài JDK/Docker/IntelliJ,
cấu hình Docker Compose, ghi lại lỗi phát sinh, cập nhật README).

Lịch sử migrate DB từ MySQL sang PostgreSQL và gỡ đăng nhập Google/Firebase nằm
ở các commit `ee366ce`, `707a37a`, `f56635a` trên `main`.

## Lưu ý khi đọc lịch sử

**1. Công của các thành viên được giữ nguyên, không bị gộp đè.**
Nhánh tích hợp dùng `git merge --no-ff` nên 10 commit của Vân Anh vẫn đứng riêng
với tên và ngày gốc, không bị squash.

**2. Commit 35 ca test của Đinh Phan được gán lại đúng tác giả.**
Khi rút 5 file test từ nhánh `Sp3-Unitest`, thao tác `git checkout <sha> -- <path>`
chỉ chép nội dung file chứ không mang theo thông tin tác giả. Commit đã được sửa
lại để mang tên `graperu <dinhphan0511@gmail.com>`.

**3. Các commit mang tên `LeMinhTai` trong đợt gộp này là phần tích hợp và sửa lỗi**,
không phải phần nội dung kiểm thử do thành viên khác viết. Cụ thể gồm: đổi tên file
theo Epic, sửa lỗi `baseUrl` lặp `/api`, gỡ các request trỏ endpoint không tồn tại,
thêm environment dùng chung, và thêm rào chắn CI. Chi tiết lý do nằm trong nội dung
từng commit.

**4. Vì sao số request giảm so với báo cáo ban đầu.**
10 request bị gỡ do trỏ vào endpoint không tồn tại trong backend (8 của Thiên,
2 của Phú). Mỗi request bị gỡ đều đã có bản đúng đường dẫn nằm ngay cạnh nên độ
phủ không giảm. Xem commit `Dọn 8 request…` và `Sửa lỗi baseUrl lặp /api…`.
