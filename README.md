# 📚 YiYi Book - Website Bán Sách Trực Tuyến & Hệ Thống Quản Trị Toàn Diện

![YiYi Book Banner](https://thietkelogo.edu.vn/uploads/images/thiet-ke-do-hoa-khac/banner-sach/15.png)

---

## 📋 I. Giới Thiệu Đề Tài

Dự án **YiYi Book** là một nền tảng thương mại điện tử (E-Commerce) hiện đại, chuyên biệt cho lĩnh vực phân phối sách trực tuyến và các văn phòng phẩm đi kèm. Dự án được phát triển theo kiến trúc **Decoupled (Tách biệt hoàn toàn Frontend & Backend)** để đạt hiệu năng tối ưu, tính bảo mật cao và khả năng chịu tải tốt.

Hệ thống được thiết kế hướng tới việc tối ưu hóa trải nghiệm khách hàng (Customer Experience - CX) và tự động hóa quy trình quản trị cho doanh nghiệp thông qua các giải pháp công nghệ tiên tiến:

*   **🤖 Trợ Lý AI Cá Nhân Hóa (YiYi AI):** Chatbot thông minh tích hợp Groq API (Llama 3.3 70B), được trang bị Intent Detection Engine, RAG (Retrieval-Augmented Generation) đọc toàn bộ kho hàng thực tế, và khả năng học hỏi từng khách hàng riêng biệt.
*   **💰 Hệ Thống Điểm Thưởng Thông Minh (Y-Point System):** Cơ chế tích lũy điểm dựa trên giá trị đơn hàng thực tế, cho phép người dùng đổi điểm thành mã giảm giá hoặc trừ trực tiếp vào hóa đơn.
*   **🏆 Chiến Lược Giữ Chân Khách Hàng (Membership Gamification):** Tự động phân hạng thành viên (Đồng, Bạc, Vàng, Kim Cương) dựa trên điểm tích lũy, mang đến đặc quyền miễn phí vận chuyển và ưu đãi riêng.
*   **💳 Thanh Toán Số & Đăng Nhập Mạng Xã Hội:** Tích hợp thanh toán nhanh qua VNPAY, mã VietQR động, và đăng nhập cực nhanh qua Google/Apple (Firebase Auth).
*   **🌐 Hệ Thống Đa Ngôn Ngữ (Multilingual):** Hỗ trợ song ngữ Tiếng Việt - Tiếng Anh (i18n) với cơ chế đồng bộ mượt mà.

---

## 🛠 II. Kiến Trúc & Công Nghệ Sử Dụng

Hệ thống áp dụng mô hình kiến trúc Client-Server tiêu chuẩn công nghiệp:

```
┌─────────────────────────────────┐          ┌─────────────────────────────────┐
│        FRONTEND CLIENT          │          │         BACKEND SERVICES        │
│    (ReactJS SPA - Vercel)       │          │     (Spring Boot - Render)      │
├─────────────────────────────────┤          ├─────────────────────────────────┤
│  • React 18 + Vite              │  HTTP/   │  • Java 17 + Spring Boot 3      │
│  • Tailwind CSS (v4)            │  JSON    │  • Spring Security (JWT Auth)   │
│  • Context API (Auth/Cart/Lang) ├─────────►│  • Spring Data JPA + Hibernate  │
│  • Firebase Auth (Social Login) │◄─────────┤  • Resend API & Spring Mail     │
│  • Axios (HTTP client)          │          │  • VNPAY & QR Payment Gateways  │
│  • Groq API (AI Chatbot)        │          │  • MySQL (Clever Cloud)         │
└─────────────────────────────────┘          └─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│        AI / LLM LAYER           │
├─────────────────────────────────┤
│  • Groq Cloud (Llama 3.3 70B)  │
│  • Client-side RAG Engine       │
│  • Intent Detection System      │
│  • Per-user Memory (localStorage)│
└─────────────────────────────────┘
```

---

## 🔍 III. Phân Tích Yêu Cầu Chức Năng Chi Tiết

### 1. Phân Hệ Khách Hàng (Customer App)

*   **Xác Thực Tài Khoản (Authentication):** Đăng ký bằng Email/OTP, Đăng nhập an toàn qua Social Login (Google, Apple) tích hợp Firebase, cơ chế lưu phiên JWT, tự động đính kèm Token qua Axios Interceptors.
*   **Đa Ngôn Ngữ (i18n):** Chuyển đổi linh hoạt giữa Tiếng Việt và Tiếng Anh với React Context và Google Translate fallback.
*   **Trang Chủ Động (Dynamic Homepage):**
    *   **Hero Slider:** Trình chiếu các chương trình khuyến mãi lớn, hỗ trợ autoplay và chạm vuốt.
    *   **Flash Sale Board:** Hiển thị sản phẩm giảm giá với bộ đếm ngược thời gian thực.
    *   **Best Sellers Category Tab Cycling:** Tự động chuyển tab danh mục và cuộn đổi thứ hạng sách.
    *   **Partner Brands Marquee:** Băng chuyền cuộn ngang vô hạn logo các nhà xuất bản.
*   **Tìm Kiếm & Lọc Nâng Cao:** Tìm kiếm theo từ khóa, tác giả, tên sách; bộ lọc đa tiêu chí (danh mục, khoảng giá, sắp xếp).
*   **Chi Tiết Sản Phẩm & Tương Tác Cộng Đồng:**
    *   Xem album ảnh chi tiết, đánh giá kèm hình ảnh (Review Rating).
    *   Bình luận phản hồi nhiều tầng (Multi-level Nested Replies), Wishlist.
*   **Giỏ Hàng & Thanh Toán (Cart & Checkout):**
    *   Lưu trữ giỏ hàng trong database, đồng bộ trên mọi thiết bị.
    *   Áp dụng đồng thời Coupon, Coupon Freeship và Điểm Y-Point.
    *   Thanh toán: VNPAY, Ví điện tử, Quét mã QR, COD.
*   **Theo Dõi & Quản Lý Đơn Hàng:**
    *   Theo dõi trạng thái thời gian thực qua Stepper 5 bước.
    *   Yêu cầu trả hàng/hoàn tiền kèm minh chứng hình ảnh.
*   **Trang Cá Nhân (User Profile & Membership):**
    *   Hiển thị hạng thành viên, quản lý địa chỉ nhận hàng, lịch sử Y-Point.
    *   **🆕 Tab "Huấn Luyện AI":** Người dùng tự dặn dò AI theo ý muốn riêng (giọng xưng hô, sở thích thể loại sách, v.v.).

### 2. Phân Hệ Quản Trị Viên (Admin Portal)

*   **Dashboard Thống Kê Tổng Quan:** Biểu đồ dữ liệu kinh doanh, danh sách đơn hàng cần xử lý.
*   **Quản Lý Sách & Kho Hàng:** Thêm, cập nhật giá, hình ảnh, số lượng tồn kho.
*   **Quản Lý Danh Mục:** Cây danh mục sách và văn phòng phẩm.
*   **Quản Lý Đơn Hàng:** Cập nhật trạng thái, duyệt giao hàng, hoàn tiền.
*   **Quản Lý Khuyến Mãi & Voucher:** Thiết lập mã Coupon, quản lý kho Voucher.
*   **Kiểm Duyệt Review & Reply:** Duyệt, xóa nội dung vi phạm.
*   **Hệ Thống Thông Báo Đẩy:** Gửi Broadcast hoặc Private message.
*   **Quản Lý Thành Viên & Cài Đặt:** Quản lý người dùng, banner quảng cáo.

### 3. 🤖 Hệ Thống AI Chatbot (YiYi AI Assistant)

Đây là tính năng nổi bật nhất, được xây dựng hoàn toàn trên Frontend với kiến trúc **Mini RAG (Retrieval-Augmented Generation)**:

#### Kiến Trúc RAG & Intent Engine

```
Tin nhắn của User
        │
        ▼
┌─────────────────────────────────────────────┐
│          INTENT DETECTION ENGINE            │
│  Phân tích 8 loại ý định:                   │
│  🎯 Cần gợi ý  │ 💰 So sánh giá            │
│  🎁 Mua quà    │ 🔍 Xem tổng quan           │
│  ⚡ Cần gấp    │ 👶 Sách thiếu nhi          │
│  🚀 Self-help  │ 📖 Thích tiểu thuyết       │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│           CLIENT-SIDE RAG ENGINE            │
│  1. Tải toàn bộ kho hàng (5000 sản phẩm)   │
│  2. Thống kê: tổng SP, phân bổ danh mục    │
│  3. Keyword extraction (bỏ stopwords VN)    │
│  4. Fuzzy match: title + author + category  │
│  5. Inject context vào System Prompt        │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│        GROQ API (Llama 3.3 70B)             │
│  Stream response với ngữ cảnh đầy đủ        │
└─────────────────────────────────────────────┘
```

#### Tính Năng Nổi Bật

| Tính năng | Mô tả |
|---|---|
| **Bộ nhớ bất tử** | Lịch sử chat lưu localStorage, không mất khi F5 |
| **Nhớ theo tài khoản** | Mỗi user có lịch sử riêng biệt (`yiyi_chat_history_{userId}`) |
| **AI cá nhân hóa** | Người dùng tự "dặn dò" AI qua tab Huấn luyện AI trong Profile |
| **Nhận biết thời gian** | Bot biết giờ, ngày, múi giờ Việt Nam |
| **Đọc toàn kho hàng** | Biết tổng số SP, phân bổ danh mục, tồn kho chi tiết |
| **Intent Detection** | Tự động nhận diện 8 loại ý định mua hàng |
| **Chủ động gợi ý** | Luôn đề xuất sản phẩm liên quan không cần chờ hỏi |
| **Mở rộng fullscreen** | Nút ⤢ phóng to cửa sổ chat toàn màn hình |
| **Streaming response** | Chữ hiện ra từng từ như đang gõ, không chờ toàn bộ |

---

## 🗺️ IV. Thiết Kế Sơ Đồ Quy Trình & Workflow Nghiệp Vụ

### 1. Luồng Xác Thực Tài Khoản & Phân Quyền (Security JWT Workflow)

```mermaid
sequenceDiagram
  autonumber
  actor User as Khách Hàng
  participant FE as Frontend (React)
  participant BE as Backend (Spring Boot)
  participant Firebase as Firebase Auth
  participant DB as Database (MySQL/SQL Server)

  alt Đăng nhập Truyền thống
      User->>FE: Nhập email & password
      FE->>BE: POST /api/auth/login
  else Social Login (Google/Apple)
      User->>FE: Bấm đăng nhập Google
      FE->>Firebase: Gọi signInWithPopup
      Firebase-->>FE: Trả về ID Token
      FE->>BE: POST /api/auth/social-login (kèm Token)
  end

  BE->>DB: Truy vấn thông tin User
  alt Tồn tại User hợp lệ
    BE->>BE: Tạo chuỗi JWT Token chứa Username & Roles
    BE-->>FE: Trả về HTTP 200 OK + JWT Token
    FE->>FE: Lưu JWT Token vào LocalStorage
    FE-->>User: Chuyển hướng về Trang Chủ / Dashboard
  else Lỗi xác thực
    BE-->>FE: Trả về HTTP 401 Unauthorized
  end
```

### 2. Luồng Đặt Hàng & Thanh Toán Chi Tiết (Checkout Flow)

```mermaid
flowchart TD
  A([Khách hàng nhấn 'Đặt Hàng']) --> B{Chọn Phương Thức?}
  
  B -- COD --> C1[Tạo Đơn Hàng: Trạng thái PENDING]
  C1 --> D1[Trừ tồn kho & Khấu trừ điểm Y-Point]
  C1 --> G1[Đưa đơn hàng vào tab 'Chờ Giao Hàng']
  G1 --> H1[Admin chuyển trạng thái sang SHIPPING]
  H1 --> I1[Shipper giao hàng thành công]
  I1 --> J1[Cập nhật trạng thái thành COMPLETED]
  J1 --> K1[Cộng điểm tích lũy Y-Point] --> M1([Kết thúc])

  B -- Online/VNPAY/QR --> C2[Tạo Đơn Hàng: PENDING_PAYMENT]
  C2 --> D2[Tạo link thanh toán VNPAY/QR Code]
  D2 --> E2[Chuyển hướng đến Cổng thanh toán]
  E2 --> F2{Thanh toán thành công?}
  
  F2 -- Thất bại --> G2[Đơn hàng giữ ở tab 'Chờ Thanh Toán']
  F2 -- Thành công --> G3[Cập nhật đơn hàng thành PENDING]
  G3 --> H3[Trừ tồn kho, áp dụng Coupon/Y-Point]
  H3 --> J3[Đưa vào tab 'Chờ Giao Hàng']
  J3 --> K3[Admin bàn giao]
  K3 --> L3[Giao hàng thành công: COMPLETED]
  L3 --> M3[Cộng điểm Y-Point] --> N3([Kết thúc])
```

### 3. Luồng AI Chatbot (YiYi AI Workflow)

```mermaid
sequenceDiagram
  autonumber
  actor User as Khách Hàng
  participant Chat as AIChatWidget (React)
  participant RAG as RAG Engine (Client-side)
  participant Groq as Groq API (Llama 3.3 70B)

  User->>Chat: Gửi tin nhắn
  Chat->>RAG: Phân tích ngữ cảnh (2 tin nhắn gần nhất)
  
  RAG->>RAG: Intent Detection (8 loại ý định)
  RAG->>RAG: Keyword extraction (bỏ stopwords tiếng Việt)
  RAG->>RAG: Fuzzy match toàn bộ kho hàng (5000 SP)
  RAG->>RAG: Build store context (thống kê + sản phẩm khớp)
  
  RAG-->>Chat: Trả về storeContext + intentSummary
  Chat->>Groq: POST /chat/completions (stream=true)<br/>System prompt = KnowledgeBase + storeContext + intentSummary<br/>History = 20 tin nhắn gần nhất
  
  loop Streaming response
    Groq-->>Chat: SSE chunk (delta content)
    Chat->>Chat: Render từng từ lên UI
  end
  
  Chat->>Chat: Lưu lịch sử vào localStorage[userId]
```

---

## 🛠 V. Triển Khai Thực Tế (Deployment)

Dự án đã được cấu hình tối ưu để triển khai mượt mà trên các dịch vụ Cloud:

| Dịch vụ | Công nghệ | Ghi chú |
|---|---|---|
| **Frontend** | Vercel | Auto-deploy khi push `main`, CDN toàn cầu |
| **Backend** | Render | Java 17, HikariCP Pool Size=2 (tránh vượt limit free tier) |
| **Database** | Clever Cloud MySQL | Cloud DB, tự động backup |
| **Email** | Resend API | Thay SMTP truyền thống, tránh spam filter |
| **AI / LLM** | Groq Cloud | Llama 3.3 70B, tốc độ inference cực nhanh (~500 tokens/s) |

---

## 💻 VI. Hướng Dẫn Cài Đặt (Chạy Local)

### 1. Yêu Cầu Chuẩn Bị

*   **Java Development Kit (JDK):** Phiên bản 17 hoặc cao hơn.
*   **Node.js:** Phiên bản 18.x trở lên.
*   **Database:** Microsoft SQL Server hoặc MySQL.

### 2. Biến Môi Trường (Environment Variables)

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:8081/api
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

### 3. Khởi Chạy Backend (Spring Boot)

```bash
cd backend
# Cập nhật application.properties với DB và Resend API Key
./mvnw spring-boot:run
# Backend chạy tại: http://localhost:8081
```

### 4. Khởi Chạy Frontend (ReactJS)

```bash
cd frontend
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
```

---

## 🆕 VII. Lịch Sử Cập Nhật Toàn Bộ

### 🤖 Phase 5 — AI Chatbot & Personalization (24/06/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 24/06 | `d3c05e5` | 📝 docs: full changelog theo 5 phase |
| 24/06 | `74a7fd6` | 📝 docs: cập nhật README toàn diện với kiến trúc AI |
| 24/06 | `5b38815` | 🎯 Intent Detection Engine — nhận diện 8 loại ý định mua hàng |
| 24/06 | `a46684d` | 📊 RAG toàn diện: thống kê kho, phân bổ danh mục, keyword search |
| 24/06 | `1fcaf1a` | ⤢ Nút Expand/Collapse — mở rộng cửa sổ chat fullscreen |
| 24/06 | `836b2fd` | 👤 Bộ nhớ tách riêng theo từng tài khoản + Tab "Huấn Luyện AI" trong Profile |
| 24/06 | `836b2fd` | 🗄️ Backend: thêm trường `aiPreferences` vào entity `User` |
| 24/06 | `bf47ccb` | 🧠 Persistent Memory, nhận biết thời gian thực, Fuzzy search RAG |
| 24/06 | `bf47ccb` | 🤖 AI Chatbot với Groq API (Llama 3.3 70B), Streaming SSE response |

### 🛒 Phase 4 — Advanced E-Commerce (23/06/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 23/06 | `00d97f8` | 🔐 Fix: thêm auth token cho admin user API |
| 23/06 | `0cd07c9` | 🗑️ Force delete user kèm toàn bộ dữ liệu liên quan |
| 23/06 | `17e3359` | 🔒 Lưu OTP vào DB (sống sót qua server restart), hết hạn 5 phút |
| 23/06 | `9b5c0ac` | 📧 Tích hợp Resend API để gửi email OTP |
| 23/06 | `19043b2` | 🎁 Voucher freeship đơn hàng đầu tiên + dynamic voucher badge |
| 23/06 | `f3330a4` | 🔧 Load Firebase credentials từ biến môi trường (production) |
| 23/06 | `63620b4` | 🕐 Enforce múi giờ Việt Nam cho payment gateway |
| 23/06 | `e1006b4` | ⏰ Scheduled job: tự động duyệt đơn hoàn thành sau 7 ngày |
| 23/06 | `a6514d4` | 🎫 Partner coupons & ví voucher |
| 23/06 | `05244b4` | 💳 Tích hợp ZaloPay & cập nhật giỏ hàng |
| 23/06 | `1a6d1f4` | 📰 Fix: email đăng ký newsletter không được trùng |
| 23/06 | `4d911b9` | 🛍️ Gợi ý sản phẩm dạng 2 hàng grid trong ProductDetail |
| 23/06 | `82388c5` | ⚙️ Nâng cao trang Admin Site Settings với visual list editors |
| 23/06 | `a31a30c` | 🚫 Phân loại đơn online bị hủy vào tab "Đã Hủy" |
| 23/06 | `b7b8c18` | ↩️ Cho phép hủy đơn trước khi ship, tự động hoàn tiền online |
| 23/06 | `dc2d057` | 🗂️ Mega menu Fahasa-style với danh mục động |
| 23/06 | `4a38393` | 📱 Mobile sidebar menu + horizontal nav bar |
| 23/06 | `3be23c7` | 🔍 Mobile search bar với lịch sử & gợi ý |
| 23/06 | `bb551eb` | 📐 Orders page responsive toàn bộ thiết bị |
| 23/06 | `5c9b981` | 🚀 Spring Caching + JVM tuning tối ưu hiệu năng |
| 23/06 | `ca37dcb` | 💓 Endpoint `/api/ping` giữ server Render không ngủ |
| 23/06 | `c7d60af` | 💜 Tích hợp thanh toán MoMo |

### 🎨 Phase 3 — UI/UX & Payment (21–22/06/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 22/06 | `2440fca` | 📋 Trang chính sách, nâng cao profile, review, coupon, bảo mật |
| 22/06 | `485695e` | 📚 Quản lý sách: tự tính giá + upload nhiều ảnh |
| 22/06 | `db9ab2c` | 🏷️ Quản lý Featured Categories với hình ảnh |
| 22/06 | `4550ef5` | 📰 Quản lý Newsletter & cài đặt website (Admin) |
| 22/06 | `3704f99` | 💎 Redesign trang chủ theo chuẩn Luxury, slider/navigation |
| 22/06 | `d4b4182` | 💳 Tích hợp cổng thanh toán VNPay & cải tiến checkout |
| 21/06 | `d16e307` | ⭐ Quản lý review, upload ảnh review, thay logo ngang |
| 21/06 | `facaf82` | 🏅 Hệ thống Y-Point reward & Member Rules Modal |
| 21/06 | `18ebd55` (20/06) | 👨‍💼 Thêm admin users, email OTP, Firebase Auth |
| 21/06 | `af4cead` | 📍 Dropdown tìm kiếm địa chỉ với react-select |
| 21/06 | `fd21a4b` | 🗺️ Dữ liệu tỉnh/thành 2026 (34 tỉnh sau sáp nhập) |
| 21/06 | `23d8a7b` | 🚚 Khôi phục logic giao hàng nhanh HCM & Hà Nội |

### ⚙️ Phase 2 — Core Backend & Features (08–20/06/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 20/06 | `800e5b7` | 🛒 Nút thêm vào giỏ hàng, dynamic logic, styling |
| 15/06 | `6e7436c` | ✅ Review, Flash Sale, Coupon, tìm kiếm nâng cao, VietQR |
| 08/06 | `e199d71` | 🌱 DataSeeder: tự động khởi tạo dữ liệu mẫu |
| 08/06 | `85d7b06` | 🔧 Backend Spring Boot Phase 1,2,3: Security, Category, Cart, Order |
| 08/06 | `611fa5a` | 🔄 Migrate từ Node.js sang Spring Boot |

### 🎨 Phase 1b — Frontend Node.js (26/05–28/05/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 28/05 | `60c43b4` | 📚 Thêm danh mục bestseller, ranked, test tính năng web |
| 26/05 | `e56084a` | 🎨 Cải tiến giao diện |
| 25/05 | `cb9fb9c` | 🖼️ Giao diện mới |

### 🏗️ Phase 1 — Khởi Tạo Dự Án (11/2025 – 05/2026)

| Ngày | Commit | Tính năng |
|------|--------|-----------|
| 11/05/2026 | `a721876` | 🔧 Cải tiến |
| 01/12/2025 | `3314516` | ✏️ Đổi tên dự án |
| 29/11/2025 | `e32c592` | 🌐 Thêm website, fix giỏ hàng, đổi màu admin |
| 28/11/2025 | `ca93bc0` | 🦶 Xây dựng Footer, trang liên hệ, hỗ trợ, ứng tuyển |
| 28/11/2025 | `675dd8a` | 🔗 Liên kết API Flash Sale và Daily |
| 27/11/2025 | `817b307` | 🔥 Flash Sale với bộ lọc |
| 27/11/2025 | `fa4e836` | ⚙️ GitHub Actions workflow cho static site |
| 27/11/2025 | `a5b9d74` | ✅ Hoàn thiện giao diện cơ bản & backend |
| 26/11/2025 | `ba54167` | 🎨 Xong giao diện |
| 23/11/2025 | `5464da8` | 🔌 Các API còn lại, Routes, Controllers, Models |
| 23/11/2025 | `b67397c` | 🖼️ Giao diện mới |
| 22/11/2025 | `146291a` | 📦 Commit frontend lần đầu |
| 21/11/2025 | `e00d96b` | 🗄️ Database schema |
| 20/11/2025 | `e1cc74c` | 📁 Routes & Controllers cho Books, Categories |
| 20/11/2025 | `77c1c04` | 🗃️ Tạo Models |
| 20/11/2025 | `2b0c4ff` | 🔗 Kết nối Database |
| 13/11/2025 | `4337097` | 🎉 **Initial commit** |

---

## 📝 VIII. Lời Kết

Dự án **YiYi Book** là giải pháp hoàn chỉnh cho một website bán sách trực tuyến hiện đại. Điểm nổi bật nhất là **YiYi AI** — trợ lý chatbot thông minh tích hợp LLM thực thụ, có khả năng đọc toàn bộ kho hàng, nhận diện ý định khách hàng, cá nhân hóa trải nghiệm cho từng người dùng và ghi nhớ lịch sử hội thoại lâu dài.

Toàn bộ hệ thống được xây dựng bằng **Spring Boot 3** (Backend) + **ReactJS** (Frontend) + **Groq/Llama** (AI Layer) với chuẩn cấu trúc công nghiệp, thích hợp để tham khảo hoặc phát triển lên quy mô lớn hơn.
