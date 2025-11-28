const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/auth");

// Public routes

router.get("/", categoryController.getAllCategories);
router.get("/popular", categoryController.getPopularCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/books", categoryController.getBooksByCategory);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  categoryController.createCategory
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  categoryController.updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  categoryController.deleteCategory
);

module.exports = router;
