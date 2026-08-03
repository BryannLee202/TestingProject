# Postman / Newman — Bộ kiểm thử API (Member 5)

Bộ kiểm thử API cho phần việc **Member 5** trong file phân công `jira_tasks.md` — dự án
YiYi Bookstore Backend.

| File | Nội dung |
|---|---|
| `YiYi_Book_API_Collection_Tai.json` | Collection: 7 folder, 40 request, 126 assertion |
| `YiYi_Book_Local_Environment_Tai.json` | Environment **Local** — `baseUrl = http://localhost:8081/api` |
| `YiYi_Book_Docker_Environment_Tai.json` | Environment **Docker** — `baseUrl = http://backend:8081/api` |
| `package.json` | Khai báo Newman + reporter, kèm sẵn lệnh `npm test` |
| `run-newman.sh` | Script chạy Newman (kiểm tra backend sống trước rồi mới chạy) |

> **Vì sao lại là một file collection riêng?** Nhóm đã chốt cách này để tránh xung đột khi
> nhiều người cùng sửa một file JSON lớn — xem `postman/README.md` (Anh Phú) và
> `YiYi_Book_API_Collection_Thien.json` (Văn Thiên). Mỗi thành viên giữ file của mình,
> gộp lại ở bước cuối.
>
> Bộ này **không dùng chung** `YiYi_Book_Local_Environment.json` của Anh Phú vì file đó chỉ
> có 6 biến (`baseUrl`, `token`, `userId`, `bookId`, `categoryId`, `bannerId`), trong khi
> chuỗi test ở đây cần thêm `adminToken`, `newUserToken`, `newUserId`, `orderId`,
> `reviewId`, `voucherCode`... Sửa file chung sẽ gây xung đột cho cả nhóm, nên môi trường
> được tách riêng với hậu tố `_Tai`.

---

## 1. Phần việc này gồm những gì

| Task | Nội dung | File/thao tác |
|---|---|---|
| **2.3** | Khai báo endpoints: Admin Users + Admin Reviews + Admin Rewards + Rewards | Folder 20/30/40/60 trong collection |
| **2.6a** | Automation với Collection Runner | Xem mục 4 bên dưới |
| **2.6b** | Newman CLI + HTML Report | `npm test` → `newman/newman-report.html` |
| **2.7** | Share Workspace, phân quyền Member | Làm tay trên Postman — xem mục 6 |

---

## 2. Chuẩn bị: bật backend

Bộ test gọi API thật nên backend **phải đang chạy**. Từ thư mục gốc của repo:

```bash
docker compose up --build
```

Đợi 3 container xanh rồi kiểm tra:

```bash
curl http://localhost:8081/api/ping     # phải trả về: pong
```

Nếu không muốn dùng Docker, xem mục VII trong `README.md` ở thư mục gốc để chạy backend
bằng `./mvnw spring-boot:run`.

Tài khoản có sẵn sau khi seed:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| ADMIN | `admin@gmail.com` | `123456` |
| USER | `user@gmail.com` | `123456` |

---

## 3. Chạy bằng Postman (giao diện)

### 3.1 Import

1. Mở Postman → nút **Import** (góc trên bên trái)
2. Kéo thả **cả 3 file** vào: 1 file `...collection.json` + 2 file `...environment.json`
3. Bấm **Import**

### 3.2 Chọn Environment

Góc trên bên phải có ô chọn environment (mặc định ghi *No Environment*) → chọn
**YiYi Book Local (Tai)**.

> ⚠️ Quên bước này là lỗi phổ biến nhất. Không chọn environment thì `{{baseUrl}}` rỗng và
> mọi request đều lỗi "Invalid URL".

### 3.3 Chạy thử một request

Mở `00 Setup & Auth` → `Đăng nhập ADMIN` → **Send**. Kết quả mong đợi: status 200, body có
`token` và `user.role = "ADMIN"`. Tab **Test Results** hiện 4 test màu xanh.

### 3.4 Xem biến môi trường đã lưu

Bấm biểu tượng con mắt 👁 cạnh ô environment → thấy `adminToken` đã có giá trị. Đó là cách
các request sau lấy được token mà không phải chép tay.

---

## 4. Task 2.6a — Chạy bằng Collection Runner

1. Hover chuột lên tên collection → bấm dấu **···** → **Run collection**
   (hoặc chọn collection rồi bấm nút **Run** góc phải)
2. Cấu hình:
   - **Environment**: `YiYi Book Local (Tai)`
   - **Iterations**: `1`
   - **Delay**: `100` ms
   - Bật **Save responses** (để xem lại body khi có test fail)
3. Bấm **Run YiYi Bookstore API — Member 5**

Kết quả mong đợi: **40 request, 126 assertion, 0 failed**.

> ⚠️ **Giữ nguyên thứ tự folder từ trên xuống.** Folder sau dùng biến do folder trước lưu
> (`adminToken` → `bookId` → `orderId` → `reviewId` → `voucherCode`). Chạy lẻ folder 40 mà
> chưa chạy folder 00/10 sẽ fail vì thiếu `reviewId`.
>
> Riêng **folder 20** và **folder 50** chạy lẻ được — chúng chỉ cần token, và pre-request
> script của folder sẽ tự đăng nhập nếu token chưa có.

Chụp màn hình kết quả này để nộp kèm deliverable task 2.6a.

---

## 5. Task 2.6b — Chạy bằng Newman (CLI) + báo cáo HTML

### 5.1 Cài đặt

Cần **Node.js 18+**. Cài Newman cục bộ trong thư mục này:

```bash
cd postman
npm install
```

(Hoặc cài toàn máy: `npm install -g newman newman-reporter-htmlextra`)

### 5.2 Chạy

```bash
npm test
```

hoặc dùng script (có kiểm tra backend sống trước, báo lỗi rõ ràng hơn):

```bash
./run-newman.sh
```

Trên Windows, chạy `npm test` trong PowerShell/CMD, hoặc dùng `./run-newman.sh` trong Git Bash.

### 5.3 Kết quả

```
┌─────────────────────────┬───────────────────┬──────────────────┐
│                         │          executed │           failed │
├─────────────────────────┼───────────────────┼──────────────────┤
│                requests │                40 │                0 │
│            test-scripts │                40 │                0 │
│              assertions │               126 │                0 │
└─────────────────────────┴───────────────────┴──────────────────┘
```

Báo cáo HTML nằm ở **`postman/newman/newman-report.html`** — mở bằng trình duyệt.
Đây chính là deliverable của task 2.6b.

Newman trả **exit code 0** khi tất cả test pass, khác 0 khi có test fail. Đó là cơ chế
để CI biết build đỏ hay xanh.

### 5.4 Các lệnh khác

```bash
npm run test:bail       # dừng ngay tại test fail đầu tiên (dễ debug)
npm run test:docker     # dùng environment Docker
./run-newman.sh docker  # tương đương
```

Cờ Newman hữu ích khác:

```bash
npx newman run YiYi_Book_API_Collection_Tai.json \
  -e YiYi_Book_Local_Environment_Tai.json \
  -n 3                  # chạy 3 vòng
  --folder "30 Rewards — /api/rewards"   # chỉ chạy 1 folder
  --verbose             # in chi tiết request/response
```

---

## 6. Task 2.7 — Share Workspace & phân quyền (làm tay)

Phần này **không tự động hoá được** — cần tài khoản Postman và email của đồng đội.

1. Postman → **Workspaces** → **Create Workspace**
   - Tên: `YiYi Bookstore API`
   - Visibility: **Team** (để Personal thì không ai thấy)
2. Import 3 file trong thư mục này vào workspace vừa tạo
3. Bấm **Invite** → nhập email 5 thành viên
4. Phân quyền:

| Thành viên | Vai trò đề xuất | Lý do |
|---|---|---|
| Member 2 (tạo workspace) | **Admin** | Quản lý cấu trúc collection |
| Member 5 | **Admin** | Phụ trách automation & phân quyền |
| Member 3, 4 | **Editor** | Cần sửa/thêm request |
| Người chỉ xem, demo | **Viewer** | Không sửa nhầm collection |

5. Chụp màn hình danh sách member + vai trò để nộp kèm deliverable.

---

## 7. Cấu trúc collection

Thứ tự folder **chính là thứ tự chạy**. Mỗi folder tiêu thụ biến do folder trước lưu.

```
00 Setup & Auth ──────► adminToken, userToken, newUserToken, newUserId, bookId, bookPrice
10 Fixtures ──────────► orderId → shipping=DELIVERED → reviewId
20 Admin Rewards ─────► voucherId + voucherCode (mã 20.000 điểm), voucherId2 (hộp cát)
30 Rewards ───────────► nạp mã → lịch sử điểm → đổi quà
40 Admin Reviews ─────► sửa / bỏ báo cáo / xoá chính review đã tạo ở folder 10
50 RBAC Negative ─────► USER và khách vãng lai gọi /admin/** → 403
60 Admin Users ───────► đổi vai trò, rồi xoá user test (cascade dọn sạch)
```

| Folder | Thuộc task | Số request |
|---|---|---|
| 00 Setup & Auth | hỗ trợ (Member 2 phụ trách khi gộp chung) | 5 |
| 10 Fixtures | hỗ trợ | 3 |
| **20 Admin Rewards** | **2.3 — Member 5** | 9 |
| **30 Rewards** | **2.3 — Member 5** | 8 |
| **40 Admin Reviews** | **2.3 — Member 5** | 4 |
| 50 RBAC Negative | bổ sung (chứng minh phân quyền) | 4 |
| **60 Admin Users** | **2.3 — Member 5** | 7 |

### Vì sao cần folder 10 Fixtures

`ReviewService.createReview()` chặn viết đánh giá nếu người dùng chưa từng mua và **nhận
được hàng**. Nên để có một `reviewId` hợp lệ cho folder 40, bộ test phải:

```
tạo đơn COD → admin đặt shipping status = DELIVERED → user mới viết được review
```

Nhờ vậy bộ test tự sinh review của chính nó, không đụng vào review có sẵn trong database
dùng chung của nhóm.

---

## 8. Vệ sinh dữ liệu

Bộ test **tự dọn sau chính nó**:

- User test đăng ký ở folder 00 bị xoá ở folder 60 (cascade kéo theo đơn hàng, địa chỉ,
  thông báo, giao dịch điểm, wishlist)
- Review tạo ở folder 10 bị xoá ở folder 40
- Mã voucher hộp cát bị xoá ngay trong folder 20

Nhờ vậy chạy lại bao nhiêu lần cũng được, không phình database, không phá dữ liệu seed.

**Tác dụng phụ duy nhất:** mỗi lần chạy trừ tồn kho 1 cuốn sách (do có bước tạo đơn hàng
thật) và không hoàn lại. Muốn về trạng thái sạch hoàn toàn:

```bash
docker compose down -v && docker compose up --build
```

> ⚠️ **TUYỆT ĐỐI KHÔNG** chạy `DELETE /api/admin/users/{id}` lên `admin@gmail.com` hoặc
> `user@gmail.com`. Endpoint này xoá cascade bằng SQL trực tiếp — mất tài khoản seed thì cả
> nhóm phải dựng lại database.

---

## 9. Tiêu chí test

Theo yêu cầu task 2.5 trong file phân công, mỗi request đều kiểm tra:

```javascript
✅ Status code đúng (200 / 400 / 403 / 404)
✅ Response time < 2000ms
✅ Response body có đủ field
✅ Lưu biến môi trường (token, orderId, bookId, reviewId, voucherCode...)
```

Ngoài ra bộ test còn có **16 negative test** — kiểm tra API từ chối đúng cách khi dữ liệu
sai hoặc thiếu quyền, không chỉ kiểm tra "đường hạnh phúc".

---

## 10. Ba điểm file phân công ghi khác thực tế backend

Đã đối chiếu trực tiếp với source code, không phải phỏng đoán:

| File phân công ghi | Thực tế trong code |
|---|---|
| `Rewards → GET /rewards` | **Không tồn tại.** `RewardController` chỉ có `/redeem`, `/history`, `/exchange` |
| `Admin - Reviews → GET/PUT` | Có đủ **4** endpoint: thêm `POST /{id}/dismiss-report` và `DELETE /{id}` |
| `Admin - Rewards → GET/POST` | Có đủ **4** endpoint: thêm `PUT /{id}` và `DELETE /{id}` |

Bộ test này khai báo theo **thực tế code**, và đã ghi chú lý do trong phần mô tả của từng
folder.

---

## 11. Ghi chú kỹ thuật rút ra khi viết bộ test

Những điều đọc được từ source, hữu ích khi mở rộng bộ test:

- **Quà đăng ký**: `AuthService.applyRegistrationGift()` tặng 20.000 Y-point cho mọi tài
  khoản mới. Vì vậy assertion về số dư dùng so sánh tương đối
  (`newBalance = previousBalance + 20000`) thay vì gán cứng con số.
- **Mã voucher tự chuẩn hoá**: backend `.trim().toUpperCase()` mã và **luôn ép
  `isActive = true`** khi tạo, bất kể body gửi gì.
- **`rewardType`** chỉ nhận `"POINTS"` hoặc `"FREESHIP"`.
- **`expirationDate`** phải đúng dạng `LocalDateTime` ISO: `2030-12-31T23:59:59` — không có
  `Z`, không có offset múi giờ.
- **Email và số điện thoại phải duy nhất** mỗi lần chạy (`existsByEmail` / `existsByPhone`),
  nên pre-request script sinh chúng từ `Date.now()`.
- **Thiếu token trả 403, không phải 401**: backend không cấu hình
  `AuthenticationEntryPoint` riêng nên Spring Security dùng mặc định 403.
- **`AdminReviewController` không có `@PreAuthorize`** như hai controller admin còn lại,
  nhưng vẫn được bảo vệ nhờ rule chung `/api/admin/** → hasRole('ADMIN')` trong
  `SecurityConfig`. Folder 50 chứng minh điều này bằng test thật.
- **Xoá voucher đã được nạp có thể vi phạm khoá ngoại** (bảng `user_rewards` còn tham
  chiếu). Vì vậy folder 20 tạo riêng một mã "hộp cát" để test PUT/DELETE.

---

## 12. Xử lý sự cố

| Tình huống | Cách xử lý |
|---|---|
| `Invalid URL` hoặc URL hiện `{{baseUrl}}/...` | Chưa chọn Environment ở góc trên bên phải Postman |
| `ECONNREFUSED localhost:8081` | Backend chưa chạy — `docker compose up --build` |
| Folder 40 fail vì thiếu `reviewId` | Đang chạy lẻ folder. Chạy full từ folder 00 |
| `Email đã được sử dụng` | Biến `testEmail` cũ còn sót. Xoá giá trị của nó trong Environment rồi chạy lại |
| Test 403 ở folder 20/40/60 | Đang dùng nhầm `userToken` thay vì `adminToken`, hoặc `adminToken` đã hết hạn (24h) — chạy lại folder 00 |
| `newman: command not found` | Chạy `npm install` trong `postman/` |
| Newman báo `Could not find "htmlextra" reporter` | Thiếu `newman-reporter-htmlextra` — chạy lại `npm install` |
| Response time > 2000ms ở lần chạy đầu | Bình thường nếu backend vừa khởi động (JIT warm-up). Chạy lại lần 2 |
| Muốn xem body của request bị fail | Postman: bật **Save responses** trong Runner. Newman: thêm `--verbose` |

---

## 13. Chạy tự động trên GitHub Actions

Workflow `.github/workflows/api-tests.yml` tự chạy bộ test này mỗi khi có push/PR chạm vào
`backend/**`:

1. Dựng `postgres` + `backend` bằng Docker Compose (bỏ qua frontend cho nhanh)
2. Đợi `/api/ping` trả lời
3. `npm ci` rồi `npm test`
4. Đính kèm `newman-report.html` vào tab **Artifacts** của lần chạy

Bấm tab **Actions** trên GitHub → chọn lần chạy → tải `newman-report` để xem báo cáo.
Có thể kích hoạt thủ công bằng nút **Run workflow**.
