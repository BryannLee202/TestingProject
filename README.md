# 📚 Grape Book - Website Bán Sách Trực Tuyến

![Grape Book Banner](https://thietkelogo.edu.vn/uploads/images/thiet-ke-do-hoa-khac/banner-sach/15.png)

## 📋 Giới Thiệu Dự Án

Grape Book là một ứng dụng web bán sách trực tuyến hiện đại được phát triển với mục tiêu cung cấp trải nghiệm mua sách dễ dàng, giao diện đẹp mắt và tiện lợi cho người dùng. Dự án sử dụng kiến trúc tách biệt hoàn toàn giữa Frontend và Backend.

🌐 **Demo Frontend (Vercel)**: [https://frontend-pi-tawny-48.vercel.app](https://frontend-pi-tawny-48.vercel.app)

## 🛠 Công Nghệ Sử Dụng

### **Frontend**
- **React 18** (với Vite) - Xây dựng giao diện người dùng
- **Tailwind CSS** - Styling giao diện hiện đại, responsive
- **React Router DOM** - Quản lý điều hướng (Routing)
- **Axios** - Giao tiếp với API Backend
- **SweetAlert2** - Hiển thị thông báo (Popup)
- **Context API** - Quản lý trạng thái Auth và Cart

### **Backend**
- **Java 17+**
- **Spring Boot 3** - Framework chính
- **Spring Security (JWT)** - Xác thực và phân quyền
- **Spring Data JPA & Hibernate** - ORM thao tác với cơ sở dữ liệu
- **Lombok** - Giảm thiểu boilerplate code
- **Database**: H2 (Mặc định để dev) / MySQL / PostgreSQL

## 🚀 Tính Năng Nổi Bật

### **Khách Hàng (Customer)**
- 🔐 Đăng ký, đăng nhập an toàn bằng JWT.
- 🛒 Thêm/Xóa/Cập nhật giỏ hàng.
- 🔍 Tìm kiếm sách thông minh, lọc sách theo danh mục.
- 🌟 Xem chi tiết sách, đánh giá (Review) và chấm điểm.
- ⚡ Săn Flash Sale với bộ đếm ngược.
- 🎟️ Áp dụng mã giảm giá (Coupon).
- 💳 Đặt hàng và tích hợp thanh toán quét mã VietQR động tự động điền số tiền và nội dung.
- 📦 Theo dõi trạng thái vận chuyển của đơn hàng.
- 🔔 Nhận thông báo hệ thống.

### **Quản Trị Viên (Admin)**
- 📊 Bảng điều khiển (Dashboard) thống kê doanh thu, số lượng đơn hàng, người dùng.
- 📚 Quản lý Sách (Thêm, Sửa, Xóa).
- 🗂️ Quản lý Danh mục sách.
- 📦 Quản lý Đơn hàng (Cập nhật trạng thái giao hàng, Hủy đơn).
- 🖼️ Quản lý Banner quảng cáo.

## 🔧 Hướng Dẫn Cài Đặt (Chạy Local)

### **Bước 1: Clone Dự Án**
```bash
git clone https://github.com/graperu/bookstore-project.git
cd bookstore-project
```

### **Bước 2: Cài Đặt & Chạy Backend (Spring Boot)**
```bash
cd backend
# Sử dụng Maven Wrapper để chạy
./mvnw spring-boot:run
```
*Backend sẽ chạy tại: `http://localhost:8081`*

### **Bước 3: Cài Đặt & Chạy Frontend (React/Vite)**
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:5173`*

## ⚙️ Cấu Hình Môi Trường (Environment Variables)

### **Frontend (`frontend/.env`)**
Bạn cần tạo file `.env` trong thư mục `frontend/` để cấu hình đường dẫn API:
```env
VITE_API_URL=http://localhost:8081/api
```

### **Backend (`backend/src/main/resources/application.properties`)**
Cấu hình kết nối Database và JWT. Đây là cấu hình mặc định dùng H2 memory database:
```properties
spring.datasource.url=jdbc:h2:mem:bookstore
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update

# JWT Secret (Thay đổi thành chuỗi bảo mật của bạn)
jwt.secret=5f4dcc3b5aa765d61d8327deb882cf99
jwt.expiration=86400000
```

## 🗄 Cấu Trúc Dự Án

```bash
bookstore-project/
├── backend/                  # Mã nguồn Java Spring Boot
│   ├── src/main/java/com/bookstore/
│   │   ├── config/           # Cấu hình Security, Data Seeder
│   │   ├── controller/       # REST APIs
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/           # JPA Entities
│   │   ├── repository/       # Data Access Layer
│   │   └── service/          # Business Logic
│   └── pom.xml               # Maven dependencies
│
├── frontend/                 # Mã nguồn ReactJS
│   ├── src/
│   │   ├── components/       # Các components tái sử dụng
│   │   ├── context/          # Context API (Auth, Cart)
│   │   ├── pages/            # Các trang giao diện (Home, Admin, Checkout...)
│   │   ├── index.css         # Tailwind CSS entry
│   │   └── App.jsx           # Routing chính
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Cấu hình Vite
└── README.md
```

## 👥 Nhóm Phát Triển
* Dự án được phát triển bởi **Graperu** 
* 🐱 GitHub: [https://github.com/graperu/bookstore-project](https://github.com/graperu/bookstore-project)

## 📄 Giấy Phép
Dự án mã nguồn mở dành cho mục đích học tập và tham khảo.
