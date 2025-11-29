const { dbHelpers } = require("../config/database");

const orderController = {
  // 1. TẠO ĐƠN HÀNG MỚI
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id; // Lấy từ token
      const {
        shipping_address,
        payment_method,
        customer_note,
        shipping_fee,
        total_amount,
      } = req.body;

      // B1: Kiểm tra giỏ hàng có đồ không
      const cartCheck = await dbHelpers.query(
        "SELECT COUNT(*) as count FROM Carts WHERE user_id = @userId",
        { userId }
      );

      if (cartCheck[0].count === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Giỏ hàng trống!" });
      }

      // ⭐ AUTO TẠO ORDER_NUMBER
      const orderNumber =
        "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 10000);

      // B2: Tạo đơn hàng (INSERT vào bảng Orders)
      const orderSql = `
        INSERT INTO Orders (
          user_id,
          order_number,
          shipping_address,
          payment_method,
          customer_note,
          shipping_fee,
          total_amount,
          status,
          created_at
        )
        OUTPUT INSERTED.id
        VALUES (
          @userId,
          @order_number,
          @shipping_address,
          @payment_method,
          @customer_note,
          @shipping_fee,
          @total_amount,
          'pending',
          GETDATE()
        )
      `;

      const orderResult = await dbHelpers.query(orderSql, {
        userId,
        order_number: orderNumber,
        shipping_address,
        payment_method,
        customer_note,
        shipping_fee,
        total_amount,
      });

      const newOrderId = orderResult[0].id;

      // B3: Copy dữ liệu từ CartItems sang OrderDetails
      const detailsSql = `
        INSERT INTO OrderDetails (order_id, book_id, quantity, price)
        SELECT @orderId, ci.book_id, ci.quantity, b.price
        FROM CartItems ci
        JOIN Carts c ON ci.cart_id = c.id
        JOIN Books b ON ci.book_id = b.id
        WHERE c.user_id = @userId
      `;
      await dbHelpers.execute(detailsSql, { orderId: newOrderId, userId });

      // B4: Xóa sạch giỏ hàng
      await dbHelpers.execute(
        "DELETE FROM CartItems WHERE cart_id IN (SELECT id FROM Carts WHERE user_id = @userId)",
        { userId }
      );

      res.status(201).json({
        success: true,
        message: "Đặt hàng thành công!",
        orderId: newOrderId,
        order_number: orderNumber,
      });
    } catch (error) {
      console.error("Create Order Error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
      });
    }
  },

  // 2. LẤY DANH SÁCH ĐƠN HÀNG CỦA TÔI
  getMyOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const sql = `
        SELECT * FROM Orders 
        WHERE user_id = @userId 
        ORDER BY created_at DESC
      `;
      const orders = await dbHelpers.query(sql, { userId });
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách đơn hàng",
      });
    }
  },
};

module.exports = orderController;
