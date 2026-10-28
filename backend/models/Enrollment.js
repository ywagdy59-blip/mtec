
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: false,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // pending: الدفع لسه ما اتأكدش
    // paid: الدفع اتأكد أو الكورس مجاني
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      required: true,
    },

    // المبلغ بأصغر وحدة للعملة، مثال USD cents
    amountTotal: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "amountTotal must be a safe integer",
      },
    },

    currency: {
      type: String,
      lowercase: true,
      trim: true,
      default: "usd",
    },

    // كل جلسة Stripe تربط بتسجيل واحد فقط
    stripeSessionId: {
      type: String,
      trim: true,
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// المستخدم له تسجيل واحد فقط لكل كورس.
enrollmentSchema.index(
  { user: 1, course: 1 },
  { unique: true }
);

// منع ربط نفس Stripe Session بأكثر من تسجيل.
// الـ partial index يسمح بوجود تسجيلات بدون session ID.
enrollmentSchema.index(
  { stripeSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      stripeSessionId: { $type: "string" },
    },
  }
);

// يفيد في البحث عن تسجيلات كورس معين.
enrollmentSchema.index({ course: 1 });

// يفيد في عرض كورسات المستخدم المدفوعة بترتيب تاريخ الدفع.
enrollmentSchema.index({
  user: 1,
  status: 1,
  paidAt: -1,
});

module.exports = mongoose.model("Enrollment", enrollmentSchema);
