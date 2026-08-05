# Bộ kiểm thử API — YiYi Bookstore

Toàn bộ bộ kiểm thử API của nhóm nằm trong thư mục này. Clone repo về, import là
chạy được ngay, không cần sửa tay file nào.

---

## Chạy nhanh (Windows — CMD)

Mở **Command Prompt** rồi làm lần lượt 3 bước:

### Bước 1 — Vào thư mục dự án

```cmd
cd /d D:\đường-dẫn-tới\TestingProject
```

> Mẹo: mở thư mục dự án trong File Explorer, gõ `cmd` vào thanh địa chỉ rồi Enter —
> CMD sẽ mở sẵn đúng thư mục, khỏi gõ đường dẫn.

### Bước 2 — Lấy code mới nhất rồi bật backend

```cmd
git pull
docker compose up --build -d postgres backend
```

Giải thích 3 tham số:

| Tham số | Ý nghĩa |
|---|---|
| `--build` | **Bắt buộc.** Biên dịch lại code Java vừa `git pull`. Thiếu cờ này là vẫn chạy image cũ, sửa lỗi backend xong vẫn thấy lỗi y nguyên. |
| `-d` | Chạy nền, trả lại con trỏ cho bạn gõ tiếp. |
| `postgres backend` | Chỉ bật 2 dịch vụ cần cho Postman. **Không cần `frontend`** cho nhẹ máy. |

Lần đầu build mất khoảng 3–5 phút (tải thư viện Maven), các lần sau nhanh hơn nhiều.

### Bước 3 — Chờ backend sẵn sàng

```cmd
docker compose logs -f backend
```

Thấy dòng `Started BookstoreApplication in ... seconds` là xong. Nhấn **Ctrl + C**
để thoát xem log (container vẫn chạy tiếp, không bị tắt).

Muốn kiểm tra chắc chắn thì mở trình duyệt vào `http://localhost:8081/api/books` —
hiện ra JSON danh sách sách là backend đã chạy đúng.

Xong bước này thì mở Postman chạy như mục [Chạy trong Postman](#chạy-trong-postman).

### Các lệnh Docker hay dùng

```cmd
docker compose ps                 :: xem container nào đang chạy
docker compose logs backend       :: xem log khi nghi có lỗi
docker compose down               :: tắt khi dùng xong (GIỮ nguyên dữ liệu)
docker compose down -v            :: tắt và XOÁ sạch dữ liệu, seed lại từ đầu
```

Nên dùng `docker compose down` mỗi khi tắt, thay vì đóng cửa sổ. Dừng không đúng
cách sẽ để lại container mồ côi, lần sau bật lên báo lỗi
`Conflict. The container name "/bookstore-postgres" is already in use`. Nếu đã lỡ
gặp lỗi đó thì xoá container cũ đi rồi bật lại:

```cmd
docker rm -f bookstore-postgres bookstore-backend
docker compose up --build -d postgres backend
```

Xoá container **không mất dữ liệu** — dữ liệu nằm trong volume riêng, chỉ
`docker compose down -v` mới xoá.

---

## Các file trong thư mục này

File dùng chung có tiền tố `_` nên luôn nằm trên đầu danh sách; còn lại là bộ của
từng người, đặt tên theo mẫu `Tên_Phạm-vi.json`.

| File | Của ai | Phạm vi | Số request |
|---|---|---|---|
| `_FullSuite_AllMembers.json` | Cả nhóm | Gộp cả 5 bộ dưới đây | **152** |
| `_Env_Local.json` | Cả nhóm | Environment mặc định | — |
| `_Env_Docker.json` | Cả nhóm | Environment cho Newman chạy trong mạng Docker | — |
| `Phu_Auth_Books_Categories_Banners.json` | Phú | Auth, Books, Categories, Banners | 18 |
| `Thien_Cart_Orders_Payment_Wishlist.json` | Thiên | Cart, Orders, Payment, Wishlist, Address, VAT Invoice | 44 |
| `Tai_Admin_Rewards_RBAC.json` | Tài | Admin, Rewards, RBAC, luồng đặt hàng đầy đủ | 40 |
| `Dinh_Cart_Orders_Reviews_Coupons.json` | Đỉnh | Cart, Orders, Payment, Reviews, Wishlist, Coupons, Notifications, Newsletter | 26 |
| `VanAnh_Users_Contacts_Settings_Upload.json` | Vân Anh | Users, Contacts, Settings, Upload | 24 |

Mỗi người giữ 1 collection riêng để làm việc hằng ngày, không đụng vào file của
nhau. Tất cả 152 request đã được đối chiếu 1-1 với controller thật trong
`backend/src/main/java/com/bookstore/controller/`.

`_FullSuite_AllMembers.json` là bản gộp dùng khi cần **chạy toàn bộ một lượt và
xuất báo cáo nộp thầy**. Nội dung bên trong giống hệt 5 file gốc (đã kiểm chứng
152/152 request khớp), chỉ khác cách đóng gói: mỗi người 1 folder riêng.

---

## Environment

Chỉ còn **2 file**, đừng nhầm lẫn giữa chúng:

| File | Tên trong Postman | `baseUrl` | Dùng khi |
|---|---|---|---|
| `_Env_Local.json` | YiYi Book — Local | `http://localhost:8081/api` | **Mặc định.** Chạy Postman/Newman trên máy mình. |
| `_Env_Docker.json` | YiYi Book — Docker | `http://backend:8081/api` | Chỉ khi chạy Newman **bên trong** mạng Docker Compose. |

> `backend:8081` chỉ phân giải được bên trong mạng Docker. Chạy Postman trên máy
> thật mà chọn nhầm environment Docker thì mọi request đều lỗi kết nối.
> **Không chắc thì chọn Local.**

### Quy ước quan trọng: `baseUrl` đã bao gồm `/api`

```
baseUrl = http://localhost:8081/api
```

Vì vậy URL trong collection viết **không có** `/api` ở đầu:

```
✅ {{baseUrl}}/books        ->  http://localhost:8081/api/books
❌ {{baseUrl}}/api/books    ->  http://localhost:8081/api/api/books   (404)
```

Khi thêm request mới, nhớ theo đúng quy ước này.

### Biến cần điền sẵn

Chỉ **7 biến** phải có giá trị từ đầu, tất cả đã điền sẵn trong environment:

| Biến | Giá trị mặc định |
|---|---|
| `baseUrl` | `http://localhost:8081/api` |
| `adminEmail` / `adminPassword` | `admin@gmail.com` / `123456` |
| `userEmail` / `userPassword` | `user@gmail.com` / `123456` |
| `testPassword` | `Test@12345` |
| `amount` | `100000` (số tiền cho nhóm Payment) |

Các biến còn lại (`token`, `bookId`, `orderId`, `adminToken`, …) do **test script tự
gán khi chạy** — không cần điền tay, cứ để trống.

---

## Chạy trong Postman

### Làm việc hằng ngày — mỗi người 1 bộ

1. Mở Postman → **Import** → kéo thả collection của mình + `_Env_Local.json`.
2. Chọn environment **"YiYi Book — Local"** ở góc trên bên phải.
3. Bấm **Run collection** để chạy cả bộ, hoặc chạy từng request từ trên xuống.

Thứ tự request trong mỗi bộ đã sắp sao cho chạy tuần tự từ trên xuống là được:
request tạo dữ liệu chạy trước, request dùng dữ liệu đó chạy sau. Token do
pre-request script tự lấy, không cần đăng nhập thủ công.

### Chạy chung để nộp thầy

1. Import `_FullSuite_AllMembers.json` + `_Env_Local.json`.
2. Chọn environment **"YiYi Book — Local"**.
3. Bấm **Run collection** → chọn cả 5 folder → **Run**.
4. Chạy xong, bấm **Export Results** ở bảng kết quả để xuất báo cáo JSON, hoặc
   chụp màn hình tổng số pass/fail.

Muốn báo cáo HTML đẹp hơn thì chạy bằng Newman (mục dưới).

> **Dọn collection cũ trước khi import.** Workspace của nhóm có thể còn các bản
> cũ từ trước khi chuẩn hoá (tên kiểu "Member 3 — Endpoints", "Epic 2.3 & 2.5",
> "Kịch bản kiểm thử"). Các bản đó đã lỗi thời — xoá đi rồi import lại 5 file
> hiện có, tránh chạy nhầm bản cũ rồi tưởng code lỗi.

---

## Chạy bằng Newman (dòng lệnh)

```cmd
cd postman
npm ci
```

| Lệnh | Chạy gì |
|---|---|
| `npm test` | **Cả 5 bộ** + xuất báo cáo HTML vào `newman/newman-report.html` |
| `npm run test:bail` | Cả 5 bộ, dừng ngay khi gặp lỗi đầu tiên |
| `npm run test:phu` | Chỉ bộ của Phú |
| `npm run test:thien` | Chỉ bộ của Thiên |
| `npm run test:tai` | Chỉ bộ của Tài |
| `npm run test:dinh` | Chỉ bộ của Đỉnh |
| `npm run test:vananh` | Chỉ bộ của Vân Anh |

CI (`.github/workflows/api-tests.yml`) gọi đúng `npm test`, tức chạy cả 5 bộ mỗi
khi có thay đổi trong `backend/**` hoặc `postman/**`.

---

## Ghi chú

- **Nhóm Upload của Vân Anh cần chọn tệp thủ công.** Ba request dùng `form-data`
  kiểu `file`; Collection Runner và Newman không tự đính kèm tệp được. Nếu chưa
  chọn tệp, các request đó **tự bỏ qua (skip)** kèm thông báo rõ ràng — không
  phải lỗi. Muốn chúng chạy thật thì mở từng request trong Postman, bấm chọn tệp
  từ máy rồi chạy lại.
- **Nhóm Payment (VNPay / MoMo / ZaloPay) của Thiên cố ý để assertion lỏng**
  (chấp nhận nhiều mã trạng thái) vì phụ thuộc cổng thanh toán bên ngoài — không
  phải lỗi. Các nhóm còn lại assert chặt.
- **"Đăng ký nhận bản tin" của Đỉnh để ngưỡng 8 giây** vì
  `NewsletterService.subscribe()` gửi email đồng bộ, phải chờ Gmail SMTP
  (timeout 5 giây đặt sẵn trong `application.properties`).
- Request `PUT`/`DELETE` trong bộ của Phú thao tác trên **bản ghi do chính nó vừa
  tạo** (`phuBookId`, `phuCategoryId`, `phuBannerId`), không đụng dữ liệu seed.
- Nếu chạy nhiều lần liên tiếp mà bắt đầu lỗi lạ (hết tồn kho sách, trùng email…),
  đó là do dữ liệu test tích luỹ. Reset bằng `docker compose down -v` rồi bật lại.

## Thư mục liên quan

- `../test-scripts/e2e-api.js` — bản kiểm thử E2E viết bằng Node thuần của Đỉnh,
  chạy độc lập, không liên quan Postman.
- `../thunder-tests/` — bản Thunder Client (extension VS Code), tự khai `baseUrl` riêng.
- `api-test.http` — bản REST Client (extension VS Code), tự khai `@baseUrl` riêng.
- `globals/workspace.globals.yaml` — biến global dùng chung cho workspace Postman.
