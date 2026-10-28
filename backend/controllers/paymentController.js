
const asyncHandler = require("../middleware/asyncHandler");
const getStripe = require("../confing/stripe");

const mongoose = require("mongoose");

const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const GuestOrder = require("../models/GuestOrder");
const { fulfillGuestOrder } = require("./guestOrderController");

const toPublicCourse = require("../utils/publicCourse");

// =====================================
// HELPERS
// =====================================

const clientUrl = () => {
  const url = (
    process.env.CLIENT_URL || "http://localhost:5173"
  )
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

  return url;
};

const currency = () =>
  (process.env.STRIPE_CURRENCY || "egp").toLowerCase();

// الكود بيدعم العملات اللي بتستخدم منزلتين عشريتين فقط.
const toMinorUnits = (price) => Math.round(price * 100);

const isValidPrice = (price) =>
  Number.isFinite(price) &&
  price >= 0 &&
  Number.isSafeInteger(toMinorUnits(price));

// =====================================
// FULFILL PAID SESSION
// =====================================

const fulfillSession = async (session) => {
  // لازم تكون جلسة دفع مكتملة ومدفوعة.
  if (
    session.payment_status !== "paid" ||
    session.mode !== "payment"
  ) {
    return null;
  }

  const { userId, courseId } = session.metadata || {};

  // التأكد من صحة بيانات الجلسة.
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    throw new Error("Invalid userId or courseId in Stripe session");
  }

  if (session.client_reference_id !== userId) {
    throw new Error("Stripe session user mismatch");
  }

  // نجيب بيانات الكورس من قاعدة البيانات.
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found for Stripe session");
  }

  if (!isValidPrice(course.price) || course.price === 0) {
    throw new Error("Invalid paid course price");
  }

  // نجيب التسجيل الحالي لو موجود.
  const existing = await Enrollment.findOne({
    user: userId,
    course: courseId,
  });

  // نتحقق إن المبلغ مطابق لسعر الكورس.
  // لو فيه تسجيل pending، نستخدم المبلغ المسجل وقت بدء الدفع
  // حتى لا يتسبب تغيير السعر لاحقًا في رفض دفعة صحيحة.
  const expectedAmount = existing
    ? existing.amountTotal
    : toMinorUnits(course.price);

  if (
    !Number.isSafeInteger(session.amount_total) ||
    session.amount_total !== expectedAmount
  ) {
    throw new Error("Stripe payment amount does not match");
  }

  if (
    String(session.currency || "").toLowerCase() !== currency()
  ) {
    throw new Error("Stripe payment currency does not match");
  }

  // لو اتسجل الدفع بالفعل، نرجع التسجيل الموجود.
  if (existing?.status === "paid") {
    return existing;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // تحديث التسجيل الموجود أو إنشاء تسجيل جديد.
  return Enrollment.findOneAndUpdate(
    {
      user: userId,
      course: courseId,
    },
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
      runValidators: true,
    }
  );
};

// =====================================
// CREATE CHECKOUT SESSION
// POST /api/payments/checkout
// Body: { courseId }
// =====================================

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  // 1. التحقق من Course ID.
  if (!mongoose.isValidObjectId(courseId)) {
    res.status(400);
    throw new Error("Invalid course ID");
  }

  // 2. جلب الكورس المنشور.
  const course = await Course.findOne({
    _id: courseId,
    isPublished: true,
  });

  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  // 3. التأكد من صحة السعر.
  if (!isValidPrice(course.price)) {
    res.status(400);
    throw new Error("Invalid course price");
  }

  // 4. التأكد من وجود المستخدم والإيميل.
  const user = await User.findById(req.user.id).select("email");

  if (!user || !user.email) {
    res.status(400);
    throw new Error("A valid user email is required");
  }

  // 5. البحث عن تسجيل سابق.
  let existing = await Enrollment.findOne({
    user: req.user.id,
    course: course._id,
  });

  if (existing?.status === "paid") {
    res.status(409);
    throw new Error("You are already enrolled in this course");
  }

  // 6. تسجيل الكورس المجاني بدون Stripe.
  if (course.price === 0) {
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        user: req.user.id,
        course: course._id,
      },
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
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      free: true,
      message: "Enrolled successfully",
      enrollment,
    });
  }

  const unitAmount = toMinorUnits(course.price);

  if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0) {
    res.status(400);
    throw new Error("Invalid payment amount");
  }

  const stripe = getStripe();

  // 7. فحص جلسة الدفع القديمة قبل إنشاء جلسة جديدة.
  if (existing?.stripeSessionId) {
    let oldSession;

    try {
      oldSession = await stripe.checkout.sessions.retrieve(
        existing.stripeSessionId
      );
    } catch (error) {
      // نسمح بإنشاء جلسة جديدة لو الجلسة القديمة غير موجودة.
      if (error.statusCode !== 404) {
        throw error;
      }
    }

    if (oldSession?.payment_status === "paid") {
      await fulfillSession(oldSession);

      res.status(409);
      throw new Error(
        "Payment already completed. Refresh your courses"
      );
    }

    if (oldSession?.status === "open") {
      await stripe.checkout.sessions.expire(oldSession.id);
    } else if (
      oldSession?.status === "complete" &&
      oldSession?.payment_status !== "paid"
    ) {
      // لا ننشئ جلسة أخرى لو الدفع السابق ما زال قيد المعالجة.
      res.status(409);
      throw new Error(
        "Previous payment is still processing. Please try again later"
      );
    }
  }

  // 8. إنشاء جلسة Stripe.
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
            ...(course.thumbnail?.startsWith("https://")
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

    success_url:
      `${clientUrl()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${clientUrl()}/courses/${course._id}`,
  });

  // 9. حفظ محاولة الدفع في MongoDB.
  try {
    if (existing) {
      existing.status = "pending";
      existing.stripeSessionId = session.id;
      existing.amountTotal = unitAmount;
      existing.currency = currency();

      await existing.save();
    } else {
      existing = await Enrollment.create({
        user: req.user.id,
        course: course._id,
        status: "pending",
        stripeSessionId: session.id,
        amountTotal: unitAmount,
        currency: currency(),
      });
    }
  } catch (error) {
    // Stripe أنشأ الجلسة بالفعل؛ الخطأ هنا معناه إن حفظها فشل.
    console.error(
      "Failed to save Stripe checkout session:",
      error.message
    );

    throw error;
  }

  return res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url,
  });
});

// =====================================
// STRIPE WEBHOOK
// POST /api/payments/webhook
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
      case "checkout.session.async_payment_succeeded": {
        if (event.data.object.metadata?.guestOrderId) {
          await fulfillGuestOrder(event.data.object);
        } else {
          await fulfillSession(event.data.object);
        }
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        // Close only pending records linked to the failed Stripe session.
        await Enrollment.deleteOne({
          stripeSessionId: event.data.object.id,
          status: "pending",
        });
        await GuestOrder.updateOne(
          { stripeSessionId: event.data.object.id, status: "pending" },
          { $set: { status: "cancelled" } }
        );
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    // Stripe يعيد إرسال الـ Webhook عند استلام 500.
    console.error("Stripe webhook handling failed:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook handling failed",
    });
  }
};

// =====================================
// CONFIRM SESSION
// GET /api/payments/session/:sessionId
// =====================================

const confirmSession = asyncHandler(async (req, res) => {
  const sessionId = req.params.sessionId;

  if (
    typeof sessionId !== "string" ||
    !sessionId.startsWith("cs_")
  ) {
    res.status(400);
    throw new Error("Invalid Stripe session ID");
  }

  const session = await getStripe().checkout.sessions.retrieve(
    sessionId
  );

  // الجلسة لازم تكون خاصة بالمستخدم الحالي.
  if (session.client_reference_id !== req.user.id) {
    res.status(403);
    throw new Error("This payment session does not belong to you");
  }

  const paid =
    session.payment_status === "paid" &&
    session.mode === "payment";

  const enrollment = paid
    ? await fulfillSession(session)
    : null;

  return res.status(200).json({
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
      populate: {
        path: "category",
        select: "name",
      },
    })
    .lean();

  const courses = enrollments
    .filter((enrollment) => enrollment.course)
    .map((enrollment) => ({
      course: toPublicCourse(enrollment.course),
    }));

  return res.status(200).json({
    success: true,
    results: courses.length,
    courses,
  });
});

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  confirmSession,
  getMyCourses,
};
