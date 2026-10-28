const mongoose = require("mongoose");
const { STATUSES, SERVICES, BUDGETS } = require("./constants");

// "leads" table: id, name, email, phone, company, service, budget, message,
// status, created_at, updated_at (+ notes and follow_up_date as bonus fields)
const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: [true, "Email is required"], trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: [true, "Phone is required"], trim: true, maxlength: 25 },
    company: { type: String, trim: true, maxlength: 100, default: "" },
    service: { type: String, required: [true, "Service is required"], enum: SERVICES },
    budget: { type: String, enum: [...BUDGETS, ""], default: "" },
    message: { type: String, required: [true, "Message is required"], trim: true, maxlength: 2000 },
    status: { type: String, enum: STATUSES, default: "New" },

    // bonus: internal notes + follow-up date
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    followUpDate: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

leadSchema.index({ created_at: -1 });
leadSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model("Lead", leadSchema);
