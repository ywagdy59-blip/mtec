const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("MongoDB connected");
};

module.exports = connectDB;
