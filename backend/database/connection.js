const mongoose = require("mongoose");

const connectDB = async (
  uri = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URI
) => {
  if (!uri) {
    throw new Error("Missing MONGO_URL, MONGO_URI, or MONGODB_URI in .env");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("MongoDB connected");
};

module.exports = connectDB;
