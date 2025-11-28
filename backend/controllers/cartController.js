const Cart = require("../models/Cart");

const cartController = {
  // 1. Lấy giỏ hàng
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.getByUserId(userId);

      const summary = {
        total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        total_amount: cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };

      res.json({ success: true, data: cart, summary });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 2. Thêm vào giỏ
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      let { bookId, quantity = 1 } = req.body;

      if (!bookId)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu ID sách" });

      bookId = parseInt(bookId);
      quantity = parseInt(quantity);

      const item = await Cart.addItem(userId, bookId, quantity);
      res
        .status(201)
        .json({ success: true, message: "Đã thêm vào giỏ", data: item });
    } catch (error) {
      console.error("Add cart error:", error);
      res.status(500).json({ success: false, message: "Lỗi thêm giỏ hàng" });
    }
  },

  // 3. Cập nhật số lượng
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { quantity } = req.body;

      if (quantity < 1)
        return res
          .status(400)
          .json({ success: false, message: "Số lượng phải >= 1" });

      await Cart.updateItem(userId, parseInt(bookId), parseInt(quantity));
      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật" });
    }
  },

  // 4. Xóa 1 món (Hàm này phải khớp tên với bên Route)
  async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      await Cart.removeItem(userId, parseInt(bookId));
      res.json({ success: true, message: "Đã xóa sản phẩm" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm" });
    }
  },

  // 5. Xóa hết (Thêm hàm này phòng hờ bạn gọi route clear)
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      await Cart.clearUserCart(userId);
      res.json({ success: true, message: "Đã xóa toàn bộ giỏ hàng" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi dọn giỏ hàng" });
    }
  },
};

module.exports = cartController;
