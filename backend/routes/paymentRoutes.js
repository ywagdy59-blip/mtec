const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  confirmSession,
  getMyCourses,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/auth");
const {
  validateCheckout,
  validateSessionId,
} = require("../middleware/validate");

// ملحوظة: الـ webhook (POST /api/payments/webhook) متسجل في app.js
// قبل express.json() لأنه محتاج الـ body خام.

// POST /api/payments/checkout
router.post("/checkout", authMiddleware, validateCheckout, createCheckoutSession);

// GET /api/payments/my-courses
router.get("/my-courses", authMiddleware, getMyCourses);

// GET /api/payments/session/:sessionId
router.get("/session/:sessionId", authMiddleware, validateSessionId, confirmSession);

module.exports = router;
