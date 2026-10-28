const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Course");
const GuestOrder = require("../models/GuestOrder");
const getStripe = require("../confing/stripe");
const {
  getGuestOrderFromToken,
  sendGuestAccessEmail,
} = require("../services/guestCourseAccess");

const currency = () =>
  (process.env.STRIPE_CURRENCY || "egp").toLowerCase();

const clientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

const createGuestCheckout = asyncHandler(async (req, res) => {
  const { courseId, method, name, email, phone } = req.body;
  const course = await Course.findOne({
    _id: courseId,
    isPublished: true,
  });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const amountTotal = Math.round(course.price * 100);
  if (!Number.isSafeInteger(amountTotal) || amountTotal < 0) {
    res.status(400);
    throw new Error("Invalid course price");
  }

  const order = await GuestOrder.create({
    name,
    email,
    phone,
    course: course._id,
    method,
    amountTotal,
    currency: currency(),
  });

  if (amountTotal === 0) {
    order.status = "paid";
    order.paidAt = new Date();
    order.accessExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await order.save();
    await sendGuestAccessEmail(order, course);

    return res.status(201).json({
      success: true,
      free: true,
      message: "Course access sent to your email",
    });
  }

  if (method === "cash") {
    return res.status(201).json({
      success: true,
      orderId: order._id,
      status: order.status,
      message: "Cash order received. Access is sent after payment is confirmed.",
    });
  }

  let stripe;
  let session;
  try {
    stripe = getStripe();
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      client_reference_id: order._id.toString(),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.currency,
            unit_amount: order.amountTotal,
            product_data: {
              name: course.title,
              ...(course.thumbnail?.startsWith("https://")
                ? { images: [course.thumbnail] }
                : {}),
            },
          },
        },
      ],
      metadata: {
        guestOrderId: order._id.toString(),
        courseId: course._id.toString(),
      },
      success_url: `${clientUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl()}/payment/cancel`,
    });

    order.stripeSessionId = session.id;
    await order.save();
  } catch (error) {
    if (session) {
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireError) {
        console.error("Could not expire unlinked Stripe session:", expireError);
      }
    }
    await GuestOrder.deleteOne({ _id: order._id, status: "pending" });
    throw error;
  }

  return res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url,
  });
});

const fulfillGuestOrder = async (session) => {
  const { guestOrderId, courseId } = session.metadata || {};
  if (session.payment_status !== "paid" || session.mode !== "payment") {
    return;
  }

  if (
    !mongoose.isValidObjectId(guestOrderId) ||
    !mongoose.isValidObjectId(courseId) ||
    session.client_reference_id !== guestOrderId
  ) {
    throw new Error("Invalid guest checkout session");
  }

  const order = await GuestOrder.findOne({
    _id: guestOrderId,
    course: courseId,
    stripeSessionId: session.id,
    method: "card",
  });
  if (!order) throw new Error("Guest order not found for Stripe session");

  if (
    !Number.isSafeInteger(session.amount_total) ||
    session.amount_total !== order.amountTotal ||
    String(session.currency || "").toLowerCase() !== order.currency
  ) {
    throw new Error("Stripe payment does not match guest order");
  }

  if (order.status !== "paid") {
    order.status = "paid";
    order.paidAt = new Date();
    order.accessExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await order.save();
  }

  const course = await Course.findById(order.course).select("title");
  if (!course) throw new Error("Course not found for guest order");
  await sendGuestAccessEmail(order, course);
};

const getGuestCourseAccess = asyncHandler(async (req, res) => {
  const order = await getGuestOrderFromToken(req.params.token);
  if (!order) {
    res.status(401);
    throw new Error("This course access link is invalid or expired");
  }

  const course = await Course.findById(order.course)
    .select("title description level thumbnail video")
    .lean();
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  return res.status(200).json({
    success: true,
    course: {
      id: course._id,
      title: course.title,
      description: course.description,
      level: course.level,
      thumbnail: course.thumbnail,
      hasVideo: Boolean(course.video),
      videoUrl: course.video
        ? `/course/${course._id}/video?accessToken=${encodeURIComponent(req.params.token)}`
        : null,
    },
  });
});

const getGuestOrders = asyncHandler(async (req, res) => {
  const orders = await GuestOrder.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("course", "title")
    .lean();

  return res.status(200).json({
    success: true,
    orders,
  });
});

const confirmCashOrder = asyncHandler(async (req, res) => {
  const order = await GuestOrder.findById(req.params.id).populate(
    "course",
    "title"
  );
  if (!order) {
    res.status(404);
    throw new Error("Guest order not found");
  }
  if (order.method !== "cash") {
    res.status(400);
    throw new Error("Only cash orders can be confirmed manually");
  }

  if (order.status !== "paid") {
    order.status = "paid";
    order.paidAt = new Date();
    order.accessExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await order.save();
  }

  await sendGuestAccessEmail(order, order.course);
  return res.status(200).json({
    success: true,
    message: "Payment confirmed and course access emailed",
    order,
  });
});

const resendGuestOrderAccess = asyncHandler(async (req, res) => {
  const order = await GuestOrder.findById(req.params.id).populate(
    "course",
    "title"
  );
  if (!order) {
    res.status(404);
    throw new Error("Guest order not found");
  }
  if (order.status !== "paid") {
    res.status(409);
    throw new Error("Course access can only be sent after payment is confirmed");
  }

  await sendGuestAccessEmail(order, order.course);
  return res.status(200).json({
    success: true,
    message: "Course access email sent",
  });
});

module.exports = {
  createGuestCheckout,
  fulfillGuestOrder,
  getGuestCourseAccess,
  getGuestOrders,
  confirmCashOrder,
  resendGuestOrderAccess,
};
