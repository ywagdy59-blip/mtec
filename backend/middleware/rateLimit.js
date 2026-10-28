const rateLimit = require("express-rate-limit");

const build = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });

// brute force protection on login
const loginLimiter = build(15, 10, "Too many login attempts. Try again in 15 minutes");

// spam protection on the public lead form
const leadFormLimiter = build(60, 15, "Too many requests from this device. Please try again later");

// Prevent guest checkout and free-course email abuse
const guestCheckoutLimiter = build(15, 10, "Too many checkout attempts. Please try again later");

// general limit for the whole API
const apiLimiter = build(15, 600, "Too many requests. Please slow down");

module.exports = {
  loginLimiter,
  leadFormLimiter,
  guestCheckoutLimiter,
  apiLimiter,
};
