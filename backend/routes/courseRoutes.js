const express = require("express");
const router = express.Router();

const {
  getCourses,
  getAllCoursesAdmin,
  getCourseById,
  createCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  getCourseVideo,
} = require("../controllers/courseController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const uploadCourseVideo = require("../middleware/uploadCourseVideo");
const {
  validateCourse,
  validateUpdateCourse,
  validateCourseId,
  validateCourseQuery,
} = require("../middleware/validate");

// بيحط req.user لو فيه توكن سليم، ويكمل كزائر لو لأ
const optionalAuth = authMiddleware.optional;

router.get("/", validateCourseQuery, getCourses);

router.get(
  "/admin/all",
  authMiddleware,
  adminMiddleware,
  validateCourseQuery,
  getAllCoursesAdmin
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadCourseVideo,
  validateCourse,
  createCourse
);

// optionalAuth عشان الأدمن يقدر يشوف الكورس غير المنشور (معاينة)
router.get("/:id", optionalAuth, validateCourseId, getCourseById);

router.patch(
  "/:id/publish",
  authMiddleware,
  adminMiddleware,
  validateCourseId,
  togglePublishCourse
);

router.get(
  "/:id/video",
  optionalAuth,
  validateCourseId,
  getCourseVideo
);

router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateCourseId,
  uploadCourseVideo,
  validateUpdateCourse,
  updateCourse
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateCourseId,
  deleteCourse
);

module.exports = router;
