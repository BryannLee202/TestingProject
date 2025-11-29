# 📚 BookStore - Website Bán Sách Trực Tuyến

## 📋 Giới Thiệu Dự Án

BookStore là một ứng dụng web bán sách trực tuyến được phát triển với mục tiêu cung cấp trải nghiệm mua sách dễ dàng và tiện lợi cho người dùng. Dự án kết hợp giữa frontend đơn giản và backend mạnh mẽ với đầy đủ các tính năng CRUD.

## 👥 Thành Viên Nhóm

- **Trần Văn A** - Backend Developer
- **Nguyễn Thị B** - Frontend Developer 
- **Lê Văn C** - Database Designer
- **Phạm Thị D** - Full-stack Developer
- **Hoàng Văn E** - Project Manager

## 🎯 Mục Tiêu Dự Án

- Xây dựng website bán sách trực tuyến đầy đủ tính năng
- Phát triển kỹ năng full-stack (frontend + backend + database)
- Áp dụng các công nghệ web hiện đại
- Triển khai hệ thống hoàn chỉnh từ thiết kế đến deployment

## 🛠 Công Nghệ Sử Dụng

### **Frontend**
- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **JavaScript ES6+** - Xử lý tương tác người dùng
- **Fetch API** - Giao tiếp với backend

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQL Server** - Hệ quản trị cơ sở dữ liệu
- **MSSQL** - Driver kết nối SQL Server

### **Development Tools**
- **Git** - Version control
- **Nodemon** - Auto-restart server khi development
- **Dotenv** - Quản lý environment variables

## 📁 Cấu Trúc Dự Án
```bash bookstore-project/
├── 📁 frontend/ # Giao diện người dùng
│ ├── 📁 pages/ # Các trang con
│ │ ├── home.html # Trang chủ
│ │ ├── products.html # Trang sản phẩm
│ │ ├── cart.html # Trang giỏ hàng
│ │ ├── login.html # Trang đăng nhập
│ │ └── register.html # Trang đăng ký
│ ├── 📁 js/ # JavaScript files
│ │ ├── api.js # Xử lý API calls
│ │ ├── app.js # Logic chính
│ │ ├── auth.js # Xác thực người dùng
│ │ └── cart.js # Quản lý giỏ hàng
│ ├── 📁 styles/ # CSS files
│ │ ├── main.css # Styles chính
│ │ ├── variables.css # Biến CSS
│ │ └── responsive.css # Responsive design
│ └── index.html # Trang chủ
│
├── 📁 backend/ # Server và API
│ ├── 📁 config/ # Cấu hình
│ │ ├── database.js # Kết nối database
│ │ └── init-database.js # Khởi tạo database
│ ├── 📁 controllers/ # Xử lý business logic
│ │ ├── bookController.js # Controller sách
│ │ └── categoryController.js # Controller danh mục
│ ├── 📁 models/ # Data models
│ │ ├── Book.js # Model sách
│ │ ├── Category.js # Model danh mục
│ │ ├── User.js # Model người dùng
│ │ ├── Order.js # Model đơn hàng
│ │ └── OrderItem.js # Model chi tiết đơn hàng
│ ├── 📁 routes/ # API routes
│ │ ├── books.js # Routes sách
│ │ └── categories.js # Routes danh mục
│ ├── 📁 database/ # Database scripts
│ │ ├── schema.sql # Tạo bảng
│ │ └── sample-data.sql # Dữ liệu mẫu
│ └── server.js # Server chính
│
└── 📄 README.md # Tài liệu dự án
```

## 🗄 Thiết Kế Database
### **Sơ Đồ Quan Hệ**
 users (1) ←→ (n) orders (1) ←→ (n) order_items (n) ←→ (1) books
↑
categories (1) ←→ (n) books

### **Các Bảng Chính**
1. **users** - Quản lý người dùng (customer/admin)
2. **categories** - Danh mục sách
3. **books** - Thông tin sách
4. **orders** - Đơn hàng
5. **order_items** - Chi tiết đơn hàng
6. **reviews** - Đánh giá sách

### **Quan Hệ**
- Một user có nhiều orders
- Một category có nhiều books
- Một order có nhiều order_items
- Một book có nhiều reviews

## 🚀 Tính Năng Đã Triển Khai

### **✅ Đã Hoàn Thành**
- [x] **Backend API hoàn chỉnh**
  - RESTful API cho books và categories
  - Kết nối SQL Server
  - CRUD operations đầy đủ
  - Validation và error handling

- [x] **Frontend cơ bản**
  - Trang chủ với sách nổi bật
  - Trang sản phẩm với tìm kiếm và lọc
  - Responsive design
  - Giao diện người dùng thân thiện

- [x] **Database design**
  - Thiết kế schema chuẩn
  - Dữ liệu mẫu đa dạng
  - Quan hệ rõ ràng

### **🔄 Đang Phát Triển**
- [ ] Authentication & Authorization
- [ ] Shopping cart functionality
- [ ] Order management
- [ ] Payment integration
- [ ] Admin dashboard

## 🔧 Hướng Dẫn Cài Đặt

### **Yêu Cầu Hệ Thống**
- Node.js (v14+)
- SQL Server
- Git

### **Bước 1: Clone Dự Án**
```bash
git clone <repository-url>
cd bookstore-project
```
### **Bước 2: Cài đặt Backend**
```bash
cd backend
npm install
```
### **Bước 3: Cấu Hình Database**
1. Tạo database `bookstore` trong SQL Server

2. Chạy file `database/schema.sql` để tạo bảng

3. Chạy file `database/sample-data.sql` để thêm dữ liệu mẫu

## ⚙️ Cấu Hình Environment Variables (Biến Môi Trường)

Để chạy được dự án, bạn cần cấu hình kết nối cơ sở dữ liệu và các biến môi trường khác.

**Bước 1:** Tạo file `.env` bên trong thư mục `backend/`.
**Bước 2:** Copy nội dung dưới đây và cập nhật lại thông tin (như mật khẩu DB) cho phù hợp với máy của bạn.

File: `backend/.env`

```env
PORT=5000
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=your_password      # <--- Thay đổi thành mật khẩu SQL Server của bạn
DB_NAME=bookstore
DB_ENCRYPT=false
JWT_SECRET=your_jwt_secret_key # <--- Chuỗi bí mật dùng để mã hóa token
NODE_ENV=development
CLIENT_URL=http://localhost:5000
 ```

### **Bước 5: Khởi chạy sever**
`npm run dev`
### **Bước 6: Truy Cập Ứng Dụng**
Mở trình duyệt và truy cập: http://localhost:5000
## 📡 API Documentation
## Books Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/books` | Lấy danh sách sách (có pagination) |
| **GET** | `/api/books/:id` | Lấy chi tiết sách theo ID |
| **GET** | `/api/books/search?q=keyword` | Tìm kiếm sách |
| **POST** | `/api/books` | Tạo sách mới (admin) |
| **PUT** | `/api/books/:id` | Cập nhật sách (admin) |
| **DELETE** | `/api/books/:id` | Xóa sách (admin) |

## Categories Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/categories` | Lấy danh sách danh mục |
| **GET** | `/api/categories/:id` | Lấy chi tiết danh mục |
| **GET** | `/api/categories/:id/books` | Lấy sách theo danh mục |
| **POST** | `/api/categories` | Tạo danh mục mới (admin) |

### Common Query Parameters
*Áp dụng cho các endpoint lấy danh sách (GET)*

| Parameter | Description |
| :--- | :--- |
| `page` | Trang hiện tại (default: 1) |
| `limit` | Số items mỗi trang (default: 10) |
| `category_id` | Lọc theo danh mục |
| `search` | Tìm kiếm theo từ khóa |

---

## 🎨 Giao Diện Người Dùng

### Trang Chủ (`/`)
- [x] Hiển thị sách nổi bật (6 books đầu tiên)
- [x] Navigation dễ sử dụng
- [x] Thiết kế responsive
- [x] Hero section với call-to-action

### Trang Sản Phẩm (`/pages/products.html`)
- [x] Grid layout hiển thị sách
- [x] Chức năng tìm kiếm real-time
- [x] Lọc theo danh mục
- [x] Hiển thị thông tin chi tiết sách
- [x] Nút "Thêm vào giỏ hàng"

### Các Trang Khác
- **Giỏ hàng**: Quản lý sản phẩm đã chọn
- **Đăng nhập**: Form đăng nhập user
- **Đăng ký**: Form tạo tài khoản mới

---

## 🗓️ Tiến Độ Dự Án

| Tuần | Giai đoạn | Công việc chi tiết |
| :--- | :--- | :--- |
| **Tuần 1** | **Planning & Setup** | • Thiết kế database schema<br>• Setup project structure<br>• Cấu hình backend cơ bản<br>• Kết nối SQL Server |
| **Tuần 2** | **Development** | • Hoàn thiện backend API<br>• Tạo models và controllers<br>• Phát triển frontend cơ bản<br>• Tích hợp frontend-backend |
| **Tuần 3** | **Testing & Deployment** | • Testing API endpoints<br>• Fix bugs và optimization<br>• Chuẩn bị báo cáo |

---

## 🐛 Các Vấn Đề Đã Giải Quyết

- ✅ **Kết nối SQL Server**: Fix lỗi authentication.
- ✅ **Unicode support**: Sửa lỗi hiển thị tiếng Việt (dùng `NVARCHAR`).
- ✅ **CORS configuration**: Cấu hình cho phép frontend kết nối API.
- ✅ **Static file serving**: Phục vụ frontend assets từ backend.
- ✅ **API integration**: Kết nối data flow giữa Frontend và Backend thành công.

---

## 🔮 Hướng Phát Triển Tương Lai

### Short-term Goals
1. **Authentication System**: Triển khai JWT-based auth.
2. **Shopping Cart**: Lưu trữ Local storage đồng bộ với backend.
3. **Order Management**: Xây dựng quy trình Checkout hoàn chỉnh.
4. **Admin Panel**: Giao diện CRUD đầy đủ cho admin.

### Long-term Vision
- [ ] **Payment Integration**: Tích hợp Stripe/Momo.
- [ ] **Recommendation Engine**: Gợi ý sách dựa trên AI.
- [ ] **Mobile App**: Phiên bản React Native/Flutter.
- [X] **Social Features**: Reviews, ratings, wishlist.

---

## 👥 Phân Công Công Việc

### Backend Team (2 người)
* **Database Design & Core API**: Thiết kế DB, models, books/categories API.
* **Authentication & Business Logic**: User auth, cart, orders, security.

### Frontend Team (2 người)
* **UI/UX Design**: Thiết kế giao diện, responsive.
* **API Integration**: Kết nối frontend với backend APIs.

### Testing & Deployment (1 người)
* **Quality Assurance**: Testing, bug fixes.
* **Documentation**: Viết API docs, user guide.

---

## 📊 Kết Quả Đạt Được
- ✅ Hoàn thành 100% backend API
- ✅ Hoàn thành 90% frontend integration
- ✅ Database design chuẩn hóa
- ✅ Responsive web design
- ✅ Cross-browser compatibility
- ✅ Code organization tốt

---

## 📞 Liên Hệ
**Nhóm Phát Triển BookStore**
* 📧 Email: [dinhphan0511@gmail.com](mailto:dinhphan0511@gmail.com)
* 🐱 GitHub: [https://github.com/PhanDinh2005/bookstore-project.git](hhttps://github.com/PhanDinh2005/bookstore-project.git)
* 🌐 Website: [https://phandinh2005.github.io/bookstore-project/](https://phandinh2005.github.io/bookstore-project/)

## 📄 Giấy Phép
> Dự án được phát triển cho mục đích học tập và nghiên cứu tại **[Tên Trường/Đơn vị]**. Mọi quyền sở hữu trí tuệ thuộc về nhóm phát triển.
