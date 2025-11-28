const { dbHelpers } = require("../config/database");

const Cart = {
  // 1. Lấy giỏ hàng (Kết nối 3 bảng: CartItems - Carts - Books)
  async getByUserId(userId) {
    const sql = `
      SELECT 
        ci.id,              -- ID của dòng trong giỏ hàng
        ci.book_id, 
        ci.quantity, 
        b.title, 
        b.price, 
        b.image_url, 
        b.author, 
        b.stock_quantity
      FROM CartItems ci
      JOIN Carts c ON ci.cart_id = c.id
      JOIN Books b ON ci.book_id = b.id
      WHERE c.user_id = @userId
    `;
    return await dbHelpers.query(sql, { userId });
  },

  // 2. Thêm sản phẩm (Tự động tạo giỏ nếu chưa có)
  async addItem(userId, bookId, quantity) {
    // A. Tìm ID giỏ hàng của User
    let cart = await dbHelpers.getOne(
      "SELECT id FROM Carts WHERE user_id = @userId",
      { userId }
    );
    let cartId;

    if (!cart) {
      // Nếu chưa có giỏ -> Tạo mới
      await dbHelpers.execute("INSERT INTO Carts (user_id) VALUES (@userId)", {
        userId,
      });
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
      // Có rồi -> Cộng dồn số lượng
      await dbHelpers.execute(
        "UPDATE CartItems SET quantity = quantity + @quantity WHERE id = @id",
        { id: item.id, quantity }
      );
    } else {
      // Chưa có -> Insert dòng mới
      await dbHelpers.execute(
        "INSERT INTO CartItems (cart_id, book_id, quantity) VALUES (@cartId, @bookId, @quantity)",
        { cartId, bookId, quantity }
      );
    }

    return { userId, bookId, quantity };
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

  // 5. Xóa hết giỏ hàng
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
