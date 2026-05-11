const express = require("express");
const sql = require("mssql");
const router = express.Router();

// Middleware xác thực admin
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Token không tồn tại" });
    }

    // Trong thực tế, bạn sẽ verify JWT token
    // Ở đây tôi tạm dùng cách đơn giản cho demo
    const isAdmin = token.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }
};

// Áp dụng middleware cho tất cả routes admin
router.use(authenticateAdmin);

// 📊 Dashboard Statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const pool = await sql.connect();
    
    // Lấy tổng số đơn hàng
    const ordersResult = await pool.request().query(`
      SELECT COUNT(*) as totalOrders, 
             SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END) as totalRevenue
      FROM orders
    `);

    // Lấy tổng số sách
    const booksResult = await pool.request().query(`
      SELECT COUNT(*) as totalBooks, SUM(stock_quantity) as totalStock
      FROM books
    `);

    // Lấy tổng số người dùng
    const usersResult = await pool.request().query(`
      SELECT COUNT(*) as totalUsers, 
             SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as totalAdmins
      FROM users
    `);

    // Doanh thu theo tháng (12 tháng gần nhất)
    const revenueResult = await pool.request().query(`
      SELECT 
        MONTH(created_at) as month,
        YEAR(created_at) as year,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE status = 'delivered' 
        AND created_at >= DATEADD(MONTH, -12, GETDATE())
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY year, month
    `);

    // Sách bán chạy
    const bestsellersResult = await pool.request().query(`
      SELECT TOP 5 
        b.title,
        SUM(oi.quantity) as total_sold
      FROM order_items oi
      JOIN books b ON oi.book_id = b.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'delivered'
      GROUP BY b.id, b.title
      ORDER BY total_sold DESC
    `);

    const stats = {
      totalOrders: ordersResult.recordset[0].totalOrders,
      totalRevenue: ordersResult.recordset[0].totalRevenue || 0,
      totalBooks: booksResult.recordset[0].totalBooks,
      totalStock: booksResult.recordset[0].totalStock,
      totalUsers: usersResult.recordset[0].totalUsers,
      totalAdmins: usersResult.recordset[0].totalAdmins,
      monthlyRevenue: Array(12).fill(0), // Khởi tạo mảng 12 tháng
      bestsellers: bestsellersResult.recordset.map(item => ({
        name: item.title,
        sales: item.total_sold
      }))
    };

    // Điền dữ liệu doanh thu theo tháng
    revenueResult.recordset.forEach(item => {
      const monthIndex = item.month - 1;
      stats.monthlyRevenue[monthIndex] = item.revenue;
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 📚 Quản lý Sách
router.get("/books", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      ORDER BY b.created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/books", async (req, res) => {
  try {
    const { title, author, price, original_price, category_id, description, image_url, stock_quantity } = req.body;
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('author', sql.NVarChar, author)
      .input('price', sql.Decimal(10,2), price)
      .input('original_price', sql.Decimal(10,2), original_price)
      .input('category_id', sql.Int, category_id)
      .input('description', sql.NVarChar, description)
      .input('image_url', sql.NVarChar, image_url)
      .input('stock_quantity', sql.Int, stock_quantity)
      .query(`
        INSERT INTO books (title, author, price, original_price, category_id, description, image_url, stock_quantity)
        OUTPUT INSERTED.*
        VALUES (@title, @author, @price, @original_price, @category_id, @description, @image_url, @stock_quantity)
      `);
    
    res.json({ success: true, data: result.recordset[0], message: "Thêm sách thành công" });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, price, original_price, category_id, description, image_url, stock_quantity } = req.body;
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('author', sql.NVarChar, author)
      .input('price', sql.Decimal(10,2), price)
      .input('original_price', sql.Decimal(10,2), original_price)
      .input('category_id', sql.Int, category_id)
      .input('description', sql.NVarChar, description)
      .input('image_url', sql.NVarChar, image_url)
      .input('stock_quantity', sql.Int, stock_quantity)
      .query(`
        UPDATE books 
        SET title = @title, author = @author, price = @price, 
            original_price = @original_price, category_id = @category_id,
            description = @description, image_url = @image_url, 
            stock_quantity = @stock_quantity, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    if (result.recordset.length > 0) {
      res.json({ success: true, data: result.recordset[0], message: "Cập nhật sách thành công" });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy sách" });
    }
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const pool = await sql.connect();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM books WHERE id = @id');
    
    res.json({ success: true, message: "Xóa sách thành công" });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 🗂️ Quản lý Danh mục
router.get("/categories", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT c.*, COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id, c.name, c.description, c.image_url, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    
    const pool = await sql.connect();
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('image_url', sql.NVarChar, image_url)
      .query(`
        INSERT INTO categories (name, description, image_url)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @image_url)
      `);
    
    res.json({ success: true, data: result.recordset[0], message: "Thêm danh mục thành công" });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 👥 Quản lý Người dùng
router.get("/users", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT id, name, email, role, phone, address, avatar_url, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 📦 Quản lý Đơn hàng
router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    
    if (status) {
      query += ` WHERE o.status = '${status}'`;
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const pool = await sql.connect();
    const result = await pool.request().query(query);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const pool = await sql.connect();
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE orders SET status = @status, updated_at = GETDATE() WHERE id = @id');
    
    res.json({ success: true, message: "Cập nhật trạng thái đơn hàng thành công" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 🎫 Quản lý Khuyến mãi
router.get("/promotions", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT * FROM promotions ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get promotions error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 📧 Quản lý Liên hệ
router.get("/contacts", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT * FROM contacts ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 🆘 Quản lý Hỗ trợ
router.get("/support-tickets", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT st.*, u.name as customer_name
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get support tickets error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// 💼 Quản lý Ứng tuyển
router.get("/job-applications", async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
      SELECT * FROM job_applications ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Get job applications error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;