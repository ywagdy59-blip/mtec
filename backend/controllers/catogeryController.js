const asyncHandler = require("../middleware/asyncHandler");

const Category = require("../models/Category");
const Course = require("../models/Course");

// =====================================
// HELPERS
// =====================================
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// هل فيه تصنيف تاني بنفس الاسم (من غير حساسية لحالة الحروف)؟
const nameExists = (name, excludeId) => {
  const filter = {
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  };

  if (excludeId) filter._id = { $ne: excludeId };

  return Category.exists(filter);
};

// ملحوظة: البيانات هنا جاية متنضفة ومتحققة من validate.js،
// وأي تكرار في الاسم بيتمسك كمان من الـ unique index (409 من error handler).

// =====================================
// GET ALL CATEGORIES
// GET /api/categories
// Public
// =====================================
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  res.status(200).json({
    success: true,
    results: categories.length,
    categories,
  });
});

// =====================================
// GET CATEGORY BY ID
// GET /api/categories/:id
// Public
// =====================================
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// =====================================
// CREATE CATEGORY
// POST /api/categories
// Admin
// =====================================
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (await nameExists(name)) {
    res.status(409);
    throw new Error("Category already exists");
  }

  const data = { name };
  if (description !== undefined) data.description = description;

  const category = await Category.create(data);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// =====================================
// UPDATE CATEGORY
// PATCH /api/categories/:id
// Admin
// =====================================
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error("Provide at least one field to update");
  }

  if (updates.name && (await nameExists(updates.name, id))) {
    res.status(409);
    throw new Error("Category name already exists");
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { $set: updates },
{ returnDocument: "after", runValidators: true }
  );

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

// =====================================
// DELETE CATEGORY
// DELETE /api/categories/:id
// Admin
// =====================================
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const coursesCount = await Course.countDocuments({ category: id });

  if (coursesCount > 0) {
    res.status(409);
    throw new Error(
      `Cannot delete category because ${coursesCount} course(s) are assigned to it`
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
