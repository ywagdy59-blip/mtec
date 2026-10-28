const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");

// used so a wrong email takes as long as a wrong password (no user enumeration by timing)
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

const signToken = (user) =>
  jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    subject: user._id.toString(),
    jwtid: crypto.randomUUID(),
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

// POST /api/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const valid = user ? await user.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH);

  // same message for wrong email and wrong password
  if (!user || !valid || !user.isActive) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    token: signToken(user),
    user: user.toJSON(),
  });
});

// POST /api/logout  (protected): the token can never be used again
const logout = asyncHandler(async (req, res) => {
  const { jti, exp } = req.token;

  await RevokedToken.updateOne(
    { jti },
    { $setOnInsert: { jti, expiresAt: new Date(exp * 1000) } },
    { upsert: true }
  );

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// GET /api/me  (protected): used by the dashboard to restore the session on refresh
const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toJSON() });
});

module.exports = { login, logout, me };
