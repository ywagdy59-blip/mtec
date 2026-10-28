const jwt = require("jsonwebtoken");
const GuestOrder = require("../models/GuestOrder");

const ACCESS_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

const createAccessToken = (order) => {
  const issuedAt = Math.floor(order.paidAt.getTime() / 1000);
  const expiresAt = Math.floor(order.accessExpiresAt.getTime() / 1000);

  return jwt.sign(
    {
      type: "guest-course-access",
      orderId: order._id.toString(),
      courseId: order.course._id
        ? order.course._id.toString()
        : order.course.toString(),
      iat: issuedAt,
      exp: expiresAt,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      issuer: "mtec",
      audience: "guest-course-access",
    }
  );
};

const getGuestOrderFromToken = async (token, courseId) => {
  if (!token || typeof token !== "string") return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "mtec",
      audience: "guest-course-access",
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return null;
    }
    throw error;
  }

  if (
    decoded.type !== "guest-course-access" ||
    (courseId && decoded.courseId !== String(courseId))
  ) {
    return null;
  }

  const filter = {
    _id: decoded.orderId,
    status: "paid",
    accessExpiresAt: { $gt: new Date() },
  };
  if (courseId) filter.course = courseId;

  return GuestOrder.findOne(filter);
};

const sendGuestAccessEmail = async (order, course) => {
  if (order.accessEmailSentAt) return;
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    const error = new Error(
      "Guest course email is not configured. Set RESEND_API_KEY and EMAIL_FROM."
    );
    error.statusCode = 503;
    throw error;
  }

  if (!order.paidAt) {
    order.paidAt = new Date();
  }
  if (!order.accessExpiresAt) {
    order.accessExpiresAt = new Date(Date.now() + ACCESS_DURATION_MS);
  }
  await order.save();

  const token = createAccessToken(order);
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");
  const accessUrl = `${clientUrl}/course-access/${token}`;
  const safeCourseTitle = String(course.title).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `guest-course-access-${order._id}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [order.email],
      subject: `Your access to ${String(course.title).replace(/[\r\n]/g, " ")}`,
      html: `<p>Hi ${String(order.name).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char])},</p><p>Your payment is confirmed. Use the secure link below to access <strong>${safeCourseTitle}</strong>:</p><p><a href="${accessUrl}">Open your course</a></p><p>This link expires in one year. Keep it private.</p>`,
      text: `Hi ${order.name}, your payment is confirmed. Open your course using this private link: ${accessUrl}\nThis link expires in one year.`,
    }),
  });

  if (!response.ok) {
    console.error("Resend email request failed:", response.status);
    const error = new Error("Could not send the course access email.");
    error.statusCode = 502;
    throw error;
  }

  order.accessEmailSentAt = new Date();
  await order.save();
};

module.exports = {
  createAccessToken,
  getGuestOrderFromToken,
  sendGuestAccessEmail,
};
