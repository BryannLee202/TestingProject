const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// 👇 KIỂM TRA LẠI TÊN IMPORT NÀY
// Mở file middleware/auth.js ra xem bạn export là 'authenticate' hay 'authenticateToken'?
// Nếu bên đó là authenticateToken thì sửa dòng dưới thành: const { authenticateToken, authorize } = ...
const { authenticate, authorize } = require("../middleware/auth");

// --- 1. CÁC ROUTE ĐẶC BIỆT (PHẢI ĐỂ TRÊN CÙNG) ---

// Route Flash Sale (QUAN TRỌNG: Phải đặt trước /:id)
router.get("/flash-sale", bookController.getFlashSaleBooks);

// Route tìm kiếm & danh sách
router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/featured", bookController.getFeaturedBooks);
router.get("/bestsellers", bookController.getBestsellers);
router.get("/combos", bookController.getTrendingCombos);

// --- 2. CÁC ROUTE CÓ THAM SỐ ID (PHẢI ĐỂ DƯỚI CÙNG) ---

router.get("/recommendations/:userId", bookController.getPersonalizedRecommendations);
router.get("/category/:categoryId", bookController.getBooksByCategory);

// Chi tiết sách
router.get("/:id", bookController.getBookById);

// Lấy đánh giá
router.get("/:id/reviews", bookController.getBookReviews);

// --- 3. CÁC ROUTE CẦN ĐĂNG NHẬP (PROTECTED) ---

// Gửi đánh giá (Nếu biến authenticate bị undefined, app sẽ crash tại đây)
// Hãy thử thay 'authenticate' bằng 'authenticateToken' nếu lỗi vẫn còn.
router.post("/:id/reviews", authenticate, bookController.createReview);

// --- 4. ADMIN ROUTES ---

router.post("/", authenticate, authorize(["admin"]), bookController.createBook);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  bookController.updateBook
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  bookController.deleteBook
);

router.patch(
  "/:id/stock",
  authenticate,
  authorize(["admin"]),
  bookController.updateStock
);

module.exports = router;
