# Bộ kiểm thử API — YiYi Bookstore

Thư mục này chứa toàn bộ bộ kiểm thử API của nhóm. Sau khi clone repo, import là
chạy được ngay, không cần chỉnh tay file nào.

Báo cáo công việc của từng thành viên: [`README_Phu.md`](README_Phu.md), [`README_Tai.md`](README_Tai.md).

## Chạy nhanh

```bash
# 1. Bật backend (từ thư mục gốc của repo)
docker compose up --build -d postgres backend

# 2. Chạy bộ kiểm thử bằng Newman
cd postman && npm ci && npm test
```

Muốn chạy trong Postman GUI thì xem mục [Import vào Postman](#import-vào-postman).

## Ba bộ collection

| Collection | Người làm | Phạm vi | Số request |
|---|---|---|---|
| `Epic2.1_2.3_Collection_Auth_Books_Categories_Banners_Phu.json` | Anh Phú | Auth, Books, Categories, Banners | 18 |
| `YiYi_Book_API_Collection_Thien.json` | Thiên | Cart, Orders, Payment, Wishlist, Address, VAT Invoice | 35 |
| `YiYi_Book_API_Collection_Tai.json` | Tài | Admin, Rewards, RBAC, luồng đặt hàng đầy đủ | 40 |

Tổng **93 request**, tất cả đã được đối chiếu 1-1 với mapping controller thật
trong `backend/src/main/java/com/bookstore/controller/`.

## Environment

**Dùng `YiYi_Book_Team_Local_Environment.json` cho hầu hết trường hợp** — nó chứa
hợp của toàn bộ biến mà cả 3 collection cần, nên một environment chạy được cả ba.

| File | Dùng khi |
|---|---|
| `YiYi_Book_Team_Local_Environment.json` | **Mặc định** — chạy cả 3 bộ, backend ở `localhost:8081` |
| `YiYi_Book_Team_Docker_Environment.json` | Giống bản Local; giữ riêng cho ai quen tách môi trường |
| `Epic2.2_Environment_*_Phu.json` | Chỉ chạy riêng bộ của Phú |
| `YiYi_Book_*_Environment_Tai.json` | Chỉ chạy riêng bộ của Tài (CI đang dùng file này) |

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

24 biến còn lại (`token`, `bookId`, `orderId`, `adminToken`, …) do **test script tự
gán khi chạy** — không cần điền tay, cứ để trống.

## Import vào Postman

1. Mở Postman → **Import** → kéo thả 3 file collection + `YiYi_Book_Team_Local_Environment.json`.
2. Chọn environment **"YiYi Book — TEAM (Local)"** ở góc phải.
3. Chạy request **Login** trước (bộ của Phú), hoặc để pre-request script tự đăng nhập
   (bộ của Thiên) — token được lưu tự động vào biến `token`.
4. Sau đó chạy các request khác, hoặc bấm **Run collection** để chạy cả bộ.

Thứ tự request trong mỗi bộ đã sắp sao cho chạy tuần tự từ trên xuống là được:
request tạo dữ liệu chạy trước, request dùng dữ liệu đó chạy sau.

## Chạy bằng Newman (dòng lệnh)

```bash
cd postman
npm ci

npm test              # bộ của Tài, environment Local, xuất báo cáo HTML
npm run test:docker   # bộ của Tài, environment Docker
./run-newman.sh       # tương đương npm test, kiểm tra backend sống trước khi chạy
```

Chạy một bộ bất kỳ với environment dùng chung:

```bash
npx newman run YiYi_Book_API_Collection_Thien.json \
  --environment YiYi_Book_Team_Local_Environment.json
```

Báo cáo HTML nằm ở `postman/newman/newman-report.html`.

## Ghi chú

- **Nhóm Payment (VNPay / MoMo / ZaloPay) trong bộ của Thiên cố ý để assertion lỏng**
  (chấp nhận nhiều mã trạng thái) vì phụ thuộc cổng thanh toán bên ngoài — không
  phải lỗi. Các nhóm còn lại assert chặt.
- Request `PUT`/`DELETE` trong bộ của Phú thao tác trên **bản ghi do chính nó vừa
  tạo** (`phuBookId`, `phuCategoryId`, `phuBannerId`), không đụng dữ liệu seed.
- `./run-newman.sh docker` dùng `baseUrl = http://backend:8081/api`, chỉ resolve được
  **bên trong** mạng Docker Compose. Chạy từ máy thật thì dùng bản Local.
- CI (`.github/workflows/api-tests.yml`) gọi `npm test`, tức bộ của Tài với
  `YiYi_Book_Local_Environment_Tai.json`. Đổi tên các file đó sẽ làm gãy CI.

## Thư mục liên quan

- `thunder-tests/` — bản Thunder Client (extension VS Code), tự khai `baseUrl` riêng.
- `api-test.http` — bản REST Client (extension VS Code), tự khai `@baseUrl` riêng.
- `globals/workspace.globals.yaml` — biến global dùng chung cho workspace Postman.
