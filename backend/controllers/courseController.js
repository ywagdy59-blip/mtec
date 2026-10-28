const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");

const Course = require("../models/Course");
const Category = require("../models/Category");
const Enrollment = require("../models/Enrollment");
const fs = require("fs/promises");
const toPublicCourse = require("../utils/publicCourse");

const VIDEO_DIR = path.join(__dirname, "..", "uploads", "videos");

const removeVideoFile = async (filename) => {
  if (!filename) return;
  try {
    await fs.unlink(path.join(VIDEO_DIR, path.basename(filename)));
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to remove video file:", error);
    }
  }
};
// =====================================
// HELPERS
// =====================================

// نخلي البحث نص عادي، مش تعبير Regex يتحكم فيه المستخدم
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// الترتيبات المسموح بها
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

// الحقول المسموح بتعديلها من خلال updateCourse
const UPDATABLE_FIELDS = [
  "title",
  "description",
  "price",
  "category",
  "level",
  "thumbnail",
];

// هل المستخدم الحالي أدمن؟ (req.user بيتحط من auth أو auth.optional)
const isAdmin = (req) => req.user?.role === "admin";

// التأكد إن التصنيف موجود
const assertCategoryExists = async (res, categoryId) => {
  const exists = await Category.exists({ _id: categoryId });

  if (!exists) {
    res.status(400);
    throw new Error("Category does not exist");
  }
};

// =====================================
// SHARED COURSE LIST
// =====================================
const listCourses = async (req, res, { publishedOnly }) => {
  // البيانات اللي تحقق منها validateCourseQuery (فيها الـ defaults)
  const query = req.validatedQuery || {};

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const { search, category, level, sort, isPublished } = query;

  const filter = {};

  // الزائر يشوف المنشور فقط، والأدمن يقدر يفلتر
  if (publishedOnly) {
    filter.isPublished = true;
  } else if (typeof isPublished === "boolean") {
    filter.isPublished = isPublished;
  }

  // البحث في عنوان الكورس
  if (search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }

  if (category) filter.category = category;
  if (level) filter.level = level;

  // ترتيب ثابت حتى مع وجود كورسات لها نفس التاريخ أو السعر
  const sortBy = {
    ...(SORT_OPTIONS[sort] || SORT_OPTIONS.newest),
    _id: -1,
  };

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("category", "name")
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),

    Course.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: courses.length,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  courses: courses.map(toPublicCourse),
  });
};

// =====================================
// GET PUBLISHED COURSES
// GET /api/courses
// =====================================
const getCourses = asyncHandler(async (req, res) => {
  await listCourses(req, res, { publishedOnly: true });
});

// =====================================
// GET ALL COURSES FOR ADMIN
// GET /api/courses/admin/all
// =====================================
const getAllCoursesAdmin = asyncHandler(async (req, res) => {
  await listCourses(req, res, { publishedOnly: false });
});

// =====================================
// GET COURSE BY ID
// GET /api/courses/:id   (auth.optional)
// =====================================
const getCourseById = asyncHandler(async (req, res) => {
  const filter = { _id: req.params.id };

  // الزائر واليوزر العادي ما يشوفوش الكورسات غير المنشورة
  if (!isAdmin(req)) {
    filter.isPublished = true;
  }

  const course = await Course.findOne(filter)
    .populate("category", "name")
    .lean();

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  res.status(200).json({
    success: true,
    course: toPublicCourse(course),
  });
});

// =====================================
// CREATE COURSE
// POST /api/courses
// =====================================
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, price, category, level, thumbnail } = req.body;

  await assertCategoryExists(res, category);

  const course = await Course.create({
    title,
    description,
    price,
    category,
    level,
    thumbnail,
    video: req.file ? req.file.filename : "",
    isPublished: true,
  });

  await course.populate("category", "name");

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});

// =====================================
// UPDATE COURSE
// PATCH /api/courses/:id
// =====================================
const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updates = {};

  // نسمح بالحقول المحددة فقط
  for (const field of UPDATABLE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (req.file) {
    updates.video = req.file.filename;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error("Provide at least one field to update");
  }

  if (updates.category !== undefined) {
    await assertCategoryExists(res, updates.category);
  }
    const previous = req.file
    ? await Course.findById(id).select("video").lean()
    : null;

  const course = await Course.findByIdAndUpdate(
    id,
    { $set: updates },
{ returnDocument: "after", runValidators: true }
  ).populate("category", "name");

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
    if (previous?.video) await removeVideoFile(previous.video);

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    course,
  });
});

// =====================================
// PUBLISH / UNPUBLISH COURSE
// PATCH /api/courses/:id/publish
// =====================================
const togglePublishCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  course.isPublished = !course.isPublished;

  await course.save();
  await course.populate("category", "name");

  res.status(200).json({
    success: true,
    message: course.isPublished
      ? "Course published successfully"
      : "Course unpublished successfully",
    course,
  });
});

// =====================================
// DELETE COURSE
// DELETE /api/courses/:id
// =====================================
const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // مينفعش نمسح كورس فيه ناس دفعت فلوسها، بدل كده بنخفيه
  const enrollmentsCount = await Enrollment.countDocuments({
    course: id,
    status: "paid",
  });

  if (enrollmentsCount > 0) {
    res.status(409);
    throw new Error(
      `Cannot delete a course with ${enrollmentsCount} enrollment(s). Unpublish it instead`
    );
  }

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  await removeVideoFile(course.video);
  // محاولات الدفع المعلقة على كورس اتمسح ملهاش لازمة
  await Enrollment.deleteMany({ course: id, status: "pending" });

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

// GET /api/courses/:id/video
const getCourseVideo = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).select("video");

  if (!course || !course.video) {
    res.status(404);
    throw new Error("Course video not found");
  }

  if (
    req.user.role !== "admin" &&
    !(await Enrollment.exists({
      course: course._id,
      user: req.user.id,
      status: "paid",
    }))
  ) {
    res.status(403);
    throw new Error("You must be enrolled to watch this course");
  }

  res.sendFile(
    path.basename(course.video),
    { root: VIDEO_DIR },
    (error) => {
      if (error) next(error);
    }
  );
});

module.exports = {
  getCourses,
  getAllCoursesAdmin,
  getCourseById,
  createCourse,
  updateCourse,
  togglePublishCourse,
  deleteCourse,
  getCourseVideo,
};
