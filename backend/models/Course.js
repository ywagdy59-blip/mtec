const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must be at most 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be at most 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [200000, "Price is too high"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: [true, "Level is required"],
    },

    thumbnail: { type: String, trim: true, default: "" },
    video: { type: String, trim: true, default: "" },

    // الكورس الجديد بيبقى مخفي لحد ما الأدمن ينشره
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  
    toJSON: {
      transform: (doc, ret) => {
        ret.hasVideo = Boolean(ret.video);
        delete ret.video;
        delete ret.__v;
        return ret;
      },
    },
  
  })

module.exports = mongoose.model("Course", courseSchema);
