const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} = require("../controllers/userController");
const { getMe } = require("../controllers/authController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const {
  validateObjectId,
  validateChangePassword,
} = require("../middleware/validate");

// الترتيب مهم: الـ routes الثابتة (/me و /change-password) لازم قبل "/:id"

// GET /api/users/me
router.get("/me", authMiddleware, getMe);

// PATCH /api/users/change-password
router.patch(
  "/change-password",
  authMiddleware,
  validateChangePassword,
  changePassword
);

// GET /api/users  (Admin)
router.get("/", authMiddleware, adminMiddleware, getUsers);

// GET /api/users/:id  (Owner / Admin)
router.get("/:id", authMiddleware, validateObjectId, getUserById);

// PATCH /api/users/:id  (Owner / Admin)
router.patch("/:id", authMiddleware, validateObjectId, updateUser);

// DELETE /api/users/:id  (Owner / Admin)
router.delete("/:id", authMiddleware, validateObjectId, deleteUser);

module.exports = router;
