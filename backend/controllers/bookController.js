const { dbHelpers } = require("../config/database");

const bookController = {
  // --- PUBLIC ROUTES ---

  // 1. Lấy tất cả sách (Có phân trang & lọc danh mục)
  // 1. Lấy tất cả sách (Có phân trang, lọc danh mục, LỌC GIÁ, TÌM KIẾM)
  getAllBooks: async (req, res) => {
    try {
      // 1. Lấy tất cả tham số từ URL
      const {
        page = 1,
        limit = 10,
        category,
        min_price,
        max_price,
        search,
      } = req.query;
      const offset = (page - 1) * limit;

      // 2. Khởi tạo câu truy vấn cơ bản
      // Mẹo: Dùng WHERE 1=1 để dễ dàng nối chuỗi AND phía sau
      let whereClause = " WHERE 1=1";
      const params = {};

      // --- XỬ LÝ CÁC BỘ LỌC ---

      // Lọc theo Danh mục
      if (category) {
        // Backend nhận biến 'category' và so sánh với cột 'category_id' trong SQL
        whereClause += " AND category_id = @category";
        params.category = parseInt(category);
      }
      // Lọc theo Giá Tối Thiểu (min_price)
      if (min_price) {
        whereClause += " AND price >= @min";
        params.min = parseFloat(min_price);
      }

      // Lọc theo Giá Tối Đa (max_price)
      if (max_price) {
        whereClause += " AND price <= @max";
        params.max = parseFloat(max_price);
      }

      // Tìm kiếm theo Tên hoặc Tác giả
      if (search) {
        whereClause += " AND (title LIKE @search OR author LIKE @search)";
        params.search = `%${search}%`;
      }

      // 3. TẠO CÂU SQL LẤY DỮ LIỆU
      const sqlQuery = `
        SELECT * FROM Books 
        ${whereClause} 
        ORDER BY id DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      // Thêm tham số phân trang
      params.offset = parseInt(offset);
      params.limit = parseInt(limit);

      // Gọi DB lấy sách
      const books = await dbHelpers.query(sqlQuery, params);

      // 4. TẠO CÂU SQL ĐẾM TỔNG (Để phân trang đúng với bộ lọc)
      const countQuery = `SELECT COUNT(*) as total FROM Books ${whereClause}`;

      // Loại bỏ offset/limit khỏi params khi đếm để tránh lỗi
      const countParams = { ...params };
      delete countParams.offset;
      delete countParams.limit;

      const countResult = await dbHelpers.query(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      res.json({
        success: true,
        data: books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
        },
      });
    } catch (error) {
      console.error("Lỗi getAllBooks:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 2. Tìm kiếm sách
  searchBooks: async (req, res) => {
    try {
      const { q } = req.query; // ?q=Harry Potter
      if (!q)
        return res
          .status(400)
          .json({ success: false, message: "Nhập từ khóa tìm kiếm" });

      const sql =
        "SELECT * FROM Books WHERE title LIKE @keyword OR author LIKE @keyword";
      const books = await dbHelpers.query(sql, { keyword: `%${q}%` });

      res.json({ success: true, data: books });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi tìm kiếm" });
    }
  },

  // 3. Sách nổi bật (Lấy random)
  getFeaturedBooks: async (req, res) => {
    try {
      // ORDER BY NEWID() dùng để random trong SQL Server
      const books = await dbHelpers.query(
        "SELECT TOP 8 * FROM Books ORDER BY NEWID()"
      );
      res.json({ success: true, data: books });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 4. Sách bán chạy
  getBestsellers: async (req, res) => {
    try {
      const books = await dbHelpers.query(
        "SELECT TOP 5 * FROM Books ORDER BY price DESC"
      );
      res.json({ success: true, data: books });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 5. Chi tiết sách
  getBookById: async (req, res) => {
    try {
      const { id } = req.params;
      const books = await dbHelpers.query(
        "SELECT * FROM Books WHERE id = @id",
        { id: parseInt(id) }
      );

      if (books.length > 0) {
        res.json({ success: true, data: books[0] });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sách" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 6. Lấy Reviews của sách
  getBookReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const sql = `
        SELECT r.*, u.name as user_name
        FROM Reviews r 
        JOIN Users u ON r.user_id = u.id 
        WHERE r.book_id = @bookId 
        ORDER BY r.created_at DESC
      `;
      const reviews = await dbHelpers.query(sql, { bookId: parseInt(id) });
      res.json({ success: true, data: reviews });
    } catch (error) {
      // Trả về mảng rỗng nếu bảng Reviews chưa tồn tại hoặc lỗi
      res.json({ success: true, data: [] });
    }
  },

  // --- PROTECTED ROUTES ---

  // 7. Viết Review
  createReview: async (req, res) => {
    try {
      const { id } = req.params; // bookId
      const { rating, comment } = req.body;
      const userId = req.user.id; // Lấy từ token

      const sql = `
        INSERT INTO Reviews (user_id, book_id, rating, comment, created_at)
        VALUES (@userId, @bookId, @rating, @comment, GETDATE())
      `;

      await dbHelpers.execute(sql, {
        userId,
        bookId: parseInt(id),
        rating,
        comment,
      });

      res.status(201).json({ success: true, message: "Đã gửi đánh giá" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi khi đánh giá" });
    }
  },

  // --- ADMIN ROUTES ---

  // 8. Tạo sách mới
  createBook: async (req, res) => {
    try {
      const {
        title,
        author,
        price,
        category_id,
        description,
        image_url,
        stock_quantity,
      } = req.body;

      const sql = `
        INSERT INTO Books (title, author, price, category_id, description, image_url, stock_quantity)
        VALUES (@title, @author, @price, @catId, @desc, @img, @stock)
      `;

      await dbHelpers.execute(sql, {
        title,
        author,
        price,
        catId: category_id,
        desc: description,
        img: image_url,
        stock: stock_quantity || 0,
      });

      res.status(201).json({ success: true, message: "Thêm sách thành công" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi thêm sách",
        error: error.message,
      });
    }
  },

  // 9. Cập nhật sách
  updateBook: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        author,
        price,
        description,
        stock_quantity,
        image_url,
        category_id,
      } = req.body;

      // Xây dựng câu query update động (chỉ update cái nào có gửi lên) hoặc update hết
      const sql = `
        UPDATE Books 
        SET title=@title, author=@author, price=@price, 
            description=@desc, stock_quantity=@stock, 
            image_url=@img, category_id=@catId
        WHERE id=@id
      `;

      await dbHelpers.execute(sql, {
        id: parseInt(id),
        title,
        author,
        price,
        desc: description,
        stock: stock_quantity,
        img: image_url,
        catId: category_id,
      });

      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật" });
    }
  },

  // 10. Xóa sách
  deleteBook: async (req, res) => {
    try {
      const { id } = req.params;
      await dbHelpers.execute("DELETE FROM Books WHERE id = @id", {
        id: parseInt(id),
      });
      res.json({ success: true, message: "Đã xóa sách" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi xóa sách (Có thể sách đang có trong đơn hàng)",
      });
    }
  },

  // 11. Cập nhật kho nhanh
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;

      await dbHelpers.execute(
        "UPDATE Books SET stock_quantity = @stock WHERE id = @id",
        { id: parseInt(id), stock: parseInt(stock) }
      );

      res.json({ success: true, message: "Đã cập nhật kho" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật kho" });
    }
  },
};

module.exports = bookController;
