const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// 👇 SỬA LỖI Ở ĐÂY:
// 1. Đổi đường dẫn thành '../middleware/auth' (File bạn đang có)
// 2. Đổi tên hàm thành 'authenticate' (Tên hàm trong file auth.js)
const { authenticate } = require('../middleware/auth'); 

// Áp dụng xác thực cho tất cả route bên dưới
// 👇 SỬA LẠI BIẾN NÀY LUÔN
router.use(authenticate);

// 1. Lấy giỏ hàng
router.get('/', cartController.getCart);

// 2. Thêm vào giỏ
router.post('/add', cartController.addToCart);

// 3. Cập nhật số lượng
router.put('/update/:bookId', cartController.updateCartItem);

// 4. Xóa sản phẩm
router.delete('/remove/:bookId', cartController.removeFromCart);

// 5. Xóa hết
router.delete('/clear', cartController.clearCart);

module.exports = router;