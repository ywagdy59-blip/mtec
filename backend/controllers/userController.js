const asyncHandler = require("../middleware/asyncHandler");

const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const { generateToken } = require("./authController");

// =====================================
// HELPERS
// =====================================
const ROLES = ["user", "admin"]; // لازم تطابق enum في الـ model
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ملحوظة: password و reset tokens عليهم select:false في الـ model،
// فعمرهم ما بيرجعوا في أي query من هنا.

const isSelf = (req, userId) => String(req.user.id) === String(userId);

// صاحب الحساب أو الأدمن
const canAccessUser = (req, userId) =>
  req.user.role === "admin" || isSelf(req, userId);

// =====================================
// GET ALL USERS
// GET /api/users
// Admin only
// =====================================
const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const [users, total] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: users,
  });
});

// =====================================
// GET USER BY ID
// GET /api/users/:id
// Owner or admin
// =====================================
const getUserById = asyncHandler(async (req, res) => {
  if (!canAccessUser(req, req.params.id)) {
    res.status(403);
    throw new Error("You are not allowed to access this user");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ success: true, data: user });
});

// =====================================
// UPDATE USER
// PATCH /api/users/:id
// Owner or admin
// =====================================
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!canAccessUser(req, id)) {
    res.status(403);
    throw new Error("You are not allowed to update this user");
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // في Express 5 الـ body ممكن يبقى undefined
  const { name, email, password, role, isActive } = req.body || {};

  // الباسورد له endpoint لوحده
  if (password !== undefined) {
    res.status(400);
    throw new Error(
      "Use the reset-password or change-password endpoint to update your password"
    );
  }

  // Update name
  if (name !== undefined) {
    if (typeof name !== "string") {
      res.status(400);
      throw new Error("Name must be a string");
    }

    const normalizedName = name.trim();

    if (normalizedName.length < 2 || normalizedName.length > 50) {
      res.status(400);
      throw new Error("Name must be between 2 and 50 characters");
    }

    user.name = normalizedName;
  }

  // Update email
  if (email !== undefined) {
    if (typeof email !== "string") {
      res.status(400);
      throw new Error("Email must be a string");
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      res.status(400);
      throw new Error("Please enter a valid email address");
    }

    if (normalizedEmail !== user.email) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        res.status(409);
        throw new Error("Email already exists");
      }

      user.email = normalizedEmail;
    }
  }

  // Role: الأدمن بس، ومش على نفسه (عشان ما يقفلش على نفسه)
  if (role !== undefined) {
    if (typeof role !== "string" || !ROLES.includes(role)) {
      res.status(400);
      throw new Error("Invalid user role");
    }

    if (role !== user.role) {
      if (req.user.role !== "admin") {
        res.status(403);
        throw new Error("Only admins can change user roles");
      }

      if (isSelf(req, id)) {
        res.status(400);
        throw new Error("You cannot change your own role");
      }

      user.role = role;
    }
  }

  // تفعيل / إيقاف الحساب: الأدمن بس، ومش على نفسه
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      res.status(400);
      throw new Error("isActive must be true or false");
    }

    if (isActive !== user.isActive) {
      if (req.user.role !== "admin") {
        res.status(403);
        throw new Error("Only admins can activate or deactivate accounts");
      }

      if (isSelf(req, id)) {
        res.status(400);
        throw new Error("You cannot deactivate your own account");
      }

      user.isActive = isActive;
    }
  }

  await user.save(); // لو الإيميل مكرر، الـ error handler بيرجّع 409

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

// =====================================
// CHANGE PASSWORD
// PATCH /api/users/change-password
// Logged-in user
// =====================================
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  // الـ hash بيتعمل في pre-save hook (كان هنا bcrypt.hash وبيتعمل مرتين)
  user.password = newPassword;
  await user.save();

  // تغيير الباسورد بيبطل التوكنات القديمة، فبنرجّع توكن جديد عشان اليوزر ما يخرجش
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    token: generateToken(user),
  });
});

// =====================================
// DELETE USER
// DELETE /api/users/:id
// Owner or admin
// =====================================
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!canAccessUser(req, id)) {
    res.status(403);
    throw new Error("You are not allowed to delete this user");
  }

  // Prevent admins from accidentally deleting their own account
  if (req.user.role === "admin" && isSelf(req, id)) {
    res.status(400);
    throw new Error("You cannot delete your own admin account here");
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();

  // بنمسح محاولات الدفع المعلقة بس، وبنسيب الاشتراكات المدفوعة كسجل مالي
  await Enrollment.deleteMany({ user: user._id, status: "pending" });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
};
