const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  confirmSession,
  getMyCourses,
} = require("../controllers/paymentController");
const {
  createGuestCheckout,
  getGuestCourseAccess,
  getGuestOrders,
  confirmCashOrder,
  resendGuestOrderAccess,
} = require("../controllers/guestOrderController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { guestCheckoutLimiter } = require("../middleware/rateLimit");
const {
  validateCheckout,
  validateGuestCheckout,
  validateSessionId,
  validateObjectId,
} = require("../middleware/validate");

// ملحوظة: الـ webhook (POST /api/payments/webhook) متسجل في app.js
// قبل express.json() لأنه محتاج الـ body خام.

// POST /api/payments/checkout
router.post("/checkout", authMiddleware, validateCheckout, createCheckoutSession);
router.post(
  "/guest-checkout",
  guestCheckoutLimiter,
  validateGuestCheckout,
  createGuestCheckout
);
router.get("/guest-access/:token", getGuestCourseAccess);
router.get(
  "/guest-orders",
  authMiddleware,
  adminMiddleware,
  getGuestOrders
);
router.patch(
  "/guest-orders/:id/confirm",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  confirmCashOrder
);
router.patch(
  "/guest-orders/:id/resend-access",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  resendGuestOrderAccess
);

// GET /api/payments/my-courses
router.get("/my-courses", authMiddleware, getMyCourses);

// GET /api/payments/session/:sessionId
router.get("/session/:sessionId", authMiddleware, validateSessionId, confirmSession);

module.exports = router;
