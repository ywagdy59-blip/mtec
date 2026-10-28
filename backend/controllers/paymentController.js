const asyncHandler = require("../middleware/asyncHandler");
const getStripe = require("../confing/stripe");

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const toPublicCourse = require("../utils/publicCourse");

// =====================================
// HELPERS
// =====================================
const clientUrl = () =>
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

const currency = () => (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

// Stripe بياخد المبلغ بأصغر وحدة (سنت). (العملات اللي من غير كسور زي JPY محتاجة معاملة تانية)
const toMinorUnits = (price) => Math.round(price * 100);

// بيفتح الكورس لليوزر بعد ما Stripe يأكد الدفع. آمن لو اتنادى أكتر من مرة
// (الـ webhook وصفحة النجاح ممكن ينادوه الاتنين).
const fulfillSession = async (session) => {
  if (session.payment_status !== "paid") return null;

  const { userId, courseId } = session.metadata || {};
  if (!userId || !courseId) return null;

  const alreadyPaid = await Enrollment.findOne({
    user: userId,
    course: courseId,
    status: "paid",
  });
  if (alreadyPaid) return alreadyPaid;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  return Enrollment.findOneAndUpdate(
    { user: userId, course: courseId },
    {
      $set: {
        status: "paid",
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        amountTotal: session.amount_total,
        currency: session.currency,
        paidAt: new Date(),
      },
    },
  {
  upsert: true,
  returnDocument: "after",
  setDefaultsOnInsert: true,
}
  );
};

// =====================================
// CREATE CHECKOUT SESSION
// POST /api/payments/checkout    body: { courseId }
// =====================================
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  // السعر بيتاخد من الداتابيز، مش من الفرونت أبداً
  const course = await Course.findOne({ _id: courseId, isPublished: true });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const existing = await Enrollment.findOne({
    user: req.user.id,
    course: course._id,
  });

  if (existing && existing.status === "paid") {
    res.status(409);
    throw new Error("You are already enrolled in this course");
  }

  // كورس مجاني: اشتراك مباشر من غير Stripe
  if (course.price === 0) {
    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user.id, course: course._id },
      {
        $set: {
          status: "paid",
          amountTotal: 0,
          currency: currency(),
          paidAt: new Date(),
        },
      },
 {
  upsert: true,
  returnDocument: "after",
  setDefaultsOnInsert: true,
}
    );

    return res.status(201).json({
      success: true,
      free: true,
      message: "Enrolled successfully",
      enrollment,
    });
  }

  const stripe = getStripe();
  const user = await User.findById(req.user.id).select("email");
  const unitAmount = toMinorUnits(course.price);

  // لو كان فيه جلسة دفع قديمة لسه مفتوحة نقفلها، عشان اليوزر ما يدفعش مرتين
  if (existing?.stripeSessionId) {
    try {
      await stripe.checkout.sessions.expire(existing.stripeSessionId);
    } catch {
      // الجلسة خلصت أو اتقفلت بالفعل، عادي
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: req.user.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency(),
          unit_amount: unitAmount,
          product_data: {
            name: course.title,
            // Stripe بيقبل صور https بس
            ...(course.thumbnail && course.thumbnail.startsWith("https://")
              ? { images: [course.thumbnail] }
              : {}),
          },
        },
      },
    ],
    metadata: {
      userId: req.user.id,
      courseId: course._id.toString(),
    },
    success_url: `${clientUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl()}/courses/${course._id}`,
  });

  // سجل محاولة الدفع (pending). الاشتراك بيتفعل بس لما Stripe يأكد الدفع
  if (existing) {
    existing.stripeSessionId = session.id;
    existing.amountTotal = unitAmount;
    existing.currency = currency();
    await existing.save();
  } else {
    await Enrollment.create({
      user: req.user.id,
      course: course._id,
      status: "pending",
      stripeSessionId: session.id,
      amountTotal: unitAmount,
      currency: currency(),
    });
  }

  res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url, // الفرونت يعمل window.location.href = url
  });
});

// =====================================
// STRIPE WEBHOOK
// POST /api/payments/webhook
// متسجل في app.js قبل express.json() عشان يستقبل الـ body خام
// =====================================
const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return res.status(503).json({
      success: false,
      message: "Stripe webhook is not configured",
    });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      secret
    );
  } catch {
    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillSession(event.data.object);
        break;

      case "checkout.session.expired":
        await Enrollment.deleteOne({
          stripeSessionId: event.data.object.id,
          status: "pending",
        });
        break;

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    // بنرجّع 500 عشان Stripe يحاول تاني
    console.error("Stripe webhook handling failed:", error);
    res.status(500).json({ success: false, message: "Webhook handling failed" });
  }
};

// =====================================
// CONFIRM SESSION (لصفحة النجاح في الفرونت)
// GET /api/payments/session/:sessionId
// بتشتغل حتى لو الـ webhook اتأخر (أو في التطوير من غير Stripe CLI)
// =====================================
const confirmSession = asyncHandler(async (req, res) => {
  const session = await getStripe().checkout.sessions.retrieve(
    req.params.sessionId
  );

  // اليوزر يشوف جلساته هو بس
  if (session.client_reference_id !== req.user.id) {
    res.status(403);
    throw new Error("This payment session does not belong to you");
  }

  const paid = session.payment_status === "paid";
  const enrollment = paid ? await fulfillSession(session) : null;

  res.status(200).json({
    success: true,
    paid,
    status: session.status,
    enrollment,
  });
});

// =====================================
// MY COURSES
// GET /api/payments/my-courses
// =====================================
const getMyCourses = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    user: req.user.id,
    status: "paid",
  })
    .sort({ paidAt: -1 })
    .populate({
      path: "course",
      populate: { path: "category", select: "name" },
    })
    .lean();

  // بنتجاهل أي اشتراك كورسه اتمسح
  const courses = enrollments
    .filter((enrollment) => enrollment.course)
    .map((enrollment) => ({
      course: toPublicCourse(enrollment.course),
    }));

  res.status(200).json({
    success: true,
    results: courses.length,
    courses,
  });
});

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  confirmSession,
  getMyCourses,
};
