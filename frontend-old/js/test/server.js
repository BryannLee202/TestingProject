// require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin"); // THÊM DÒNG NÀY

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
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
    app.use("/api/admin", adminRoutes); // THÊM DÒNG NÀY

    // 4. Xử lý lỗi 404 (Route không tồn tại)
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "🔍 API endpoint not found",
        path: req.originalUrl
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
      console.log(`   👉 /api/admin`); // THÊM DÒNG NÀY
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;