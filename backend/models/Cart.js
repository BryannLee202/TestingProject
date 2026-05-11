const { dbHelpers } = require("../config/database");

const Cart = {
  // 1. Lấy giỏ hàng
  async getByUserId(userId) {
    try {
      const sql = `
        SELECT 
          ci.id, 
          ci.book_id as bookId, -- Đổi tên để khớp với frontend
          ci.quantity, 
          b.title, 
          b.price, 
          b.image_url, 
          b.stock_quantity
        FROM CartItems ci
        JOIN Carts c ON ci.cart_id = c.id
        JOIN Books b ON ci.book_id = b.id
        WHERE c.user_id = @userId
      `;
      return await dbHelpers.query(sql, { userId });
    } catch (err) {
      console.error("❌ Lỗi Model getByUserId:", err.message);
      throw err;
    }
  },

  // 2. Thêm sản phẩm (Hàm hay bị lỗi nhất)
  async addItem(userId, bookId, quantity) {
    try {
      console.log(
        `➡️ Đang xử lý thêm giỏ: User ${userId}, Book ${bookId}, Qty ${quantity}`
      );

      // A. Tìm ID giỏ hàng của User
      let cart = await dbHelpers.getOne(
        "SELECT id FROM Carts WHERE user_id = @userId",
        { userId }
      );
      let cartId;

      if (!cart) {
        console.log("...User chưa có giỏ, đang tạo mới...");
        // Nếu chưa có giỏ -> Tạo mới
        await dbHelpers.execute(
          "INSERT INTO Carts (user_id) VALUES (@userId)",
          { userId }
        );
        const newCart = await dbHelpers.getOne(
          "SELECT id FROM Carts WHERE user_id = @userId",
          { userId }
        );
        cartId = newCart.id;
      } else {
        cartId = cart.id;
      }

      // B. Kiểm tra xem sách đã có trong giỏ chưa
      const item = await dbHelpers.getOne(
        "SELECT * FROM CartItems WHERE cart_id = @cartId AND book_id = @bookId",
        { cartId, bookId }
      );

      if (item) {
        console.log("...Sách đã có, cập nhật số lượng...");
        await dbHelpers.execute(
          "UPDATE CartItems SET quantity = quantity + @quantity WHERE id = @id",
          { id: item.id, quantity }
        );
      } else {
        console.log("...Sách mới, thêm vào dòng mới...");
        await dbHelpers.execute(
          "INSERT INTO CartItems (cart_id, book_id, quantity) VALUES (@cartId, @bookId, @quantity)",
          { cartId, bookId, quantity }
        );
      }

      console.log("✅ Thêm thành công!");
      return { userId, bookId, quantity };
    } catch (err) {
      console.error("❌ Lỗi Model addItem:", err); // Log lỗi chi tiết ra Terminal
      throw err;
    }
  },

  // 3. Cập nhật số lượng
  async updateItem(userId, bookId, quantity) {
    const sql = `
      UPDATE CartItems 
      SET quantity = @quantity 
      FROM CartItems ci
      JOIN Carts c ON ci.cart_id = c.id
      WHERE c.user_id = @userId AND ci.book_id = @bookId
    `;
    await dbHelpers.execute(sql, { userId, bookId, quantity });
    return { userId, bookId, quantity };
  },

  // 4. Xóa sản phẩm
  async removeItem(userId, bookId) {
    const sql = `
      DELETE ci 
      FROM CartItems ci
      JOIN Carts c ON ci.cart_id = c.id
      WHERE c.user_id = @userId AND ci.book_id = @bookId
    `;
    await dbHelpers.execute(sql, { userId, bookId });
    return true;
  },

  // 5. Xóa hết
  async clearUserCart(userId) {
    const sql = `
      DELETE ci 
      FROM CartItems ci
      JOIN Carts c ON ci.cart_id = c.id
      WHERE c.user_id = @userId
    `;
    await dbHelpers.execute(sql, { userId });
    return true;
  },
};

module.exports = Cart;
