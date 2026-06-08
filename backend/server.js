// require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database"); // Kết nối chuẩn với file database.js mới

// Import routes (Chỉ bật những cái đã làm)
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
// const categoryRoutes = require("./routes/categories"); // Tạm ẩn
// const wishlistRoutes = require("./routes/wishlist");   // Tạm ẩn

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (Giữ lại cái này của bạn vì nó rất hay)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Khởi tạo server
const initializeApp = async () => {
  try {
    console.log("🔌 Connecting to SQL Server...");

    // 1. Kết nối Database
    await connectDB();

    // 2. Route kiểm tra sức khỏe server
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "📚 BookStore API is running!",
        timestamp: new Date().toISOString(),
      });
    });

    // 3. Đăng ký các API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/orders", orderRoutes);

    // app.use("/api/categories", categoryRoutes); // Tạm ẩn
    // app.use("/api/wishlist", wishlistRoutes);   // Tạm ẩn

    // 4. Xử lý lỗi 404 (Route không tồn tại)
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "🔍 API endpoint not found",
        path: req.originalUrl,
      });
    });

    // 5. Khởi động server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 ==========================================`);
      console.log(`   📚 BookStore Server Started Successfully!`);
      console.log(`   ==========================================`);
      console.log(`   🌐 Server: http://localhost:${PORT}`);
      console.log(`   ⏰ Time: ${new Date().toISOString()}`);
      console.log(`   ==========================================\n`);

      console.log(`📋 Active Endpoints:`);
      console.log(`   👉 /api/auth`);
      console.log(`   👉 /api/books`);
      console.log(`   👉 /api/cart`);
      console.log(`   👉 /api/orders`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;
