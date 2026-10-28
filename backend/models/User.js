const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false => never returned unless asked with .select("+password")
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Passwords are always hashed here, never stored as plain text
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password || typeof candidate !== "string") return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
