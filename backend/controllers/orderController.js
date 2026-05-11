const { dbHelpers } = require("../config/database");

const orderController = {
  createOrder: async (req, res) => {
    try {
      const userId = req.user.id;

      // Lấy dữ liệu từ Frontend
      const {
        fullName,
        phone,
        address,
        items,
        total,
        paymentMethod = "COD",
        shippingFee = 30000,
      } = req.body;

      console.log("👉 Đang tạo đơn hàng cho User:", userId);

      // Tính toán tổng cuối
      const finalTotal = parseFloat(total) + parseFloat(shippingFee);

      // 1. INSERT vào bảng Orders
      // Sử dụng OUTPUT INSERTED.ID để lấy ngay ID vừa tạo
      const orderSql = `
                INSERT INTO Orders 
                (user_id, full_name, phone, shipping_address, payment_method, shipping_fee, total_amount, final_amount, created_at)
                OUTPUT INSERTED.ID
                VALUES 
                (@userId, @name, @phone, @addr, @method, @fee, @total, @final, GETDATE())
            `;

      const orderResult = await dbHelpers.query(orderSql, {
        userId,
        name: fullName,
        phone: phone,
        addr: address,
        method: paymentMethod,
        fee: shippingFee,
        total: total,
        final: finalTotal,
      });

      const orderId = orderResult[0].ID;
      console.log("✅ Tạo đơn thành công, ID:", orderId);

      // 2. INSERT vào bảng OrderDetails (Lưu từng cuốn sách)
      for (const item of items) {
        // Lưu ý: item.bookId hoặc item.book_id tùy vào frontend gửi lên
        const bId = item.bookId || item.book_id || item.id;

        await dbHelpers.execute(
          "INSERT INTO OrderDetails (order_id, book_id, quantity, price) VALUES (@oId, @bId, @qty, @price)",
          { oId: orderId, bId: bId, qty: item.quantity, price: item.price }
        );
      }

      // 3. XÓA GIỎ HÀNG (Quan trọng)
      await dbHelpers.execute(
        "DELETE FROM CartItems WHERE cart_id IN (SELECT id FROM Carts WHERE user_id = @userId)",
        { userId }
      );

      res.json({ success: true, message: "Đặt hàng thành công!", orderId });
    } catch (error) {
      console.error("❌ Lỗi tạo đơn hàng:", error); // Xem lỗi chi tiết ở Terminal
      res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  },
};

module.exports = orderController;
