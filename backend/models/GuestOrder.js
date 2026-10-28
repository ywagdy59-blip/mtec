const mongoose = require("mongoose");

const guestOrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    method: { type: String, enum: ["card", "cash"], required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
      required: true,
    },
    amountTotal: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "amountTotal must be a safe integer",
      },
    },
    currency: { type: String, required: true, lowercase: true, trim: true },
    stripeSessionId: { type: String, trim: true },
    paidAt: { type: Date, default: null },
    accessExpiresAt: { type: Date, default: null },
    accessEmailSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

guestOrderSchema.index(
  { stripeSessionId: 1 },
  {
    unique: true,
    partialFilterExpression: { stripeSessionId: { $type: "string" } },
  }
);
guestOrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("GuestOrder", guestOrderSchema);
