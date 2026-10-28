const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // pending = بدأ الدفع ولسه، paid = اتدفع والكورس اتفتح له
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // المبلغ بأصغر وحدة (سنت/قرش) زي ما Stripe بيرجعه
    amountTotal: { type: Number, default: 0, min: 0 },
    currency: { type: String, lowercase: true, trim: true },

    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },

    paidAt: { type: Date },
  },
  { timestamps: true }
);

// اليوزر ما يشتركش في نفس الكورس مرتين
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
