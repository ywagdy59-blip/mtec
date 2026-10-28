const express = require("express");
const router = express.Router();

const { login, logout, me } = require("../controllers/authController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { loginLimiter } = require("../middleware/rateLimit");
const { validateLogin } = require("../middleware/validate");

// mounted on /api  ->  POST /api/login , POST /api/logout , GET /api/me
router.post("/login", loginLimiter, validateLogin, login);
router.post("/logout", auth, logout);
router.get("/me", auth, admin, me);

module.exports = router;
