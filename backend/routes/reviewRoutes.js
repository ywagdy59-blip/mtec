
const express = require("express");
const router = express.Router();

const {
  getReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { validateObjectId } = require("../middleware/validate");

// Public: Get all reviews
router.get("/", getReviews);

// Admin only: Create a review
router.post("/", authMiddleware, adminMiddleware, createReview);

// Admin only: Delete a review
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId,
  deleteReview
);

module.exports = router;
