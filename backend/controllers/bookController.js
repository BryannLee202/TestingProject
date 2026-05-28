const { dbHelpers } = require("../config/database");

const bookController = {
  // --- 1. Lấy sách Flash Sale (MỚI THÊM - Đặt vào trong object) ---
  getFlashSaleBooks: async (req, res) => {
    try {
      // Lấy 10 cuốn sách có giá rẻ nhất hoặc random để làm Flash Sale
      const query = `
            SELECT TOP 10 * FROM Books 
            WHERE price < original_price OR original_price IS NULL
            ORDER BY NEWID() 
        `;
      const result = await dbHelpers.query(query);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Lỗi Flash Sale:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy Flash Sale" });
    }
  },

  // --- 2. Lấy tất cả sách (Có phân trang & lọc danh mục) ---
  getAllBooks: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        min_price,
        max_price,
        search,
      } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = " WHERE 1=1";
      const params = {};

      // Lọc theo Danh mục
      if (category) {
        whereClause += " AND category_id = @category";
        params.category = parseInt(category);
      }
      // Lọc theo Giá
      if (min_price) {
        whereClause += " AND price >= @min";
        params.min = parseFloat(min_price);
      }
      if (max_price) {
        whereClause += " AND price <= @max";
        params.max = parseFloat(max_price);
      }
      // Tìm kiếm
      if (search) {
        whereClause += " AND (title LIKE @search OR author LIKE @search)";
        params.search = `%${search}%`;
      }

      // Query lấy sách
      const sqlQuery = `
        SELECT * FROM Books 
        ${whereClause} 
        ORDER BY id DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      params.offset = parseInt(offset);
      params.limit = parseInt(limit);

      const books = await dbHelpers.query(sqlQuery, params);

      // Query đếm tổng
      const countQuery = `SELECT COUNT(*) as total FROM Books ${whereClause}`;
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

  // --- 3. Tìm kiếm sách ---
  searchBooks: async (req, res) => {
    try {
      const { q } = req.query;
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

  // --- 4. Sách nổi bật ---
  getFeaturedBooks: async (req, res) => {
    try {
      const books = await dbHelpers.query(
        "SELECT TOP 8 * FROM Books ORDER BY NEWID()"
      );
      res.json({ success: true, data: books });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // --- 5. Sách bán chạy ---
  getBestsellers: async (req, res) => {
    try {
      const sql = `
        SELECT TOP 10 b.*, COALESCE(s.total_sold, 0) as total_sold
        FROM Books b
        JOIN (
          SELECT book_id, SUM(quantity) as total_sold
          FROM OrderDetails
          GROUP BY book_id
        ) s ON b.id = s.book_id
        ORDER BY s.total_sold DESC
      `;
      const books = await dbHelpers.query(sql);
      res.json({ success: true, data: books });
    } catch (error) {
      console.error("Lỗi getBestsellers:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // --- 6. Chi tiết sách ---
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

  // --- 7. Lấy Reviews ---
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
      res.json({ success: true, data: [] });
    }
  },

  // --- 8. Tạo Review ---
  createReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

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
      res.status(500).json({ success: false, message: "Lỗi khi đánh giá" });
    }
  },

  // --- 9. Tạo sách mới ---
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

  // --- 10. Cập nhật sách ---
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

  // --- 11. Xóa sách ---
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

  // --- 12. Cập nhật kho ---
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
  // --- 13. Sách Combo Trending ---
  getTrendingCombos: async (req, res) => {
    try {
      // Dựa theo yêu cầu: thuộc danh mục "Combo" hoặc is_combo = 1
      const sql = `
        SELECT TOP 10 b.* 
        FROM Books b
        LEFT JOIN Categories c ON b.category_id = c.id
        WHERE c.name LIKE '%Combo%' OR ISNULL(b.is_combo, 0) = 1
        ORDER BY NEWID() -- Thay bằng b.view_count DESC nếu có cột view_count
      `;
      const books = await dbHelpers.query(sql);
      res.json({ success: true, data: books });
    } catch (error) {
      console.error("Lỗi getTrendingCombos:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy danh sách combo" });
    }
  },

  // --- 14. Gợi ý cá nhân hóa ---
  getPersonalizedRecommendations: async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Lấy danh mục user hay mua nhất
      const categoryQuery = `
        SELECT TOP 3 b.category_id, COUNT(*) as buy_count
        FROM OrderDetails od
        JOIN Orders o ON od.order_id = o.id
        JOIN Books b ON od.book_id = b.id
        WHERE o.user_id = @userId
        GROUP BY b.category_id
        ORDER BY buy_count DESC
      `;
      const categoriesResult = await dbHelpers.query(categoryQuery, { userId: parseInt(userId) });
      
      if (categoriesResult.length === 0) {
        // Fallback: Sách mới nhất nếu chưa từng mua hàng
        const fallbackQuery = `SELECT TOP 10 * FROM Books ORDER BY id DESC`;
        const fallbackBooks = await dbHelpers.query(fallbackQuery);
        return res.json({ success: true, data: fallbackBooks });
      }
      
      // Sử dụng tham số thay vì chuỗi để an toàn (bảo mật SQL Injection)
      // Mssql driver cần phải có workaround cho câu lệnh IN, ta có thể nối chuỗi an toàn vì category_id là ID nội bộ
      const categoryIds = categoriesResult.map(c => parseInt(c.category_id));
      const catIdsString = categoryIds.join(',');
      
      // Lấy sách thuộc các danh mục này nhưng user chưa mua
      const recommendQuery = `
        SELECT TOP 10 * FROM Books 
        WHERE category_id IN (${catIdsString})
        AND id NOT IN (
          SELECT od.book_id 
          FROM OrderDetails od 
          JOIN Orders o ON od.order_id = o.id 
          WHERE o.user_id = @userId
        )
        ORDER BY NEWID()
      `;
      const recommendedBooks = await dbHelpers.query(recommendQuery, { userId: parseInt(userId) });
      
      res.json({ success: true, data: recommendedBooks });
    } catch (error) {
      console.error("Lỗi getPersonalizedRecommendations:", error);
      res.status(500).json({ success: false, message: "Lỗi lấy gợi ý sách" });
    }
  },
  // --- 15. Lấy sách theo danh mục (có phân trang) ---
  getBooksByCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const sqlQuery = `
        SELECT * FROM Books 
        WHERE category_id = @categoryId
        ORDER BY id DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;
      
      const countQuery = `SELECT COUNT(*) as total FROM Books WHERE category_id = @categoryId`;
      
      const books = await dbHelpers.query(sqlQuery, { 
        categoryId: parseInt(categoryId), 
        offset: offset, 
        limit: limit 
      });
      
      const countResult = await dbHelpers.query(countQuery, { categoryId: parseInt(categoryId) });
      const total = countResult[0]?.total || 0;

      res.json({
        success: true,
        data: books,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Lỗi getBooksByCategory:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },
}; // <--- Đóng object bookController TẠI ĐÂY

module.exports = bookController;
