
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Reviewer name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    role: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5",
      },
    },
    text: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: 3,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
