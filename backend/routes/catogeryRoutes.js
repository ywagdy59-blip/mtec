const express = require("express");
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/catogeryController");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const {
  validateCategory,
  validateUpdateCategory,
  validateObjectId,
} = require("../middleware/validate");

router.get("/", getCategories);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateCategory,
  createCategory
);
router.get("/:id", validateObjectId, getCategoryById);
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  validateUpdateCategory,
  updateCategory
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  deleteCategory
);

module.exports = router;
