const mongoose = require("mongoose");
let connectionPromise;

const connectDB = (
  uri = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URI
) => {
  if (!uri) {
    throw new Error("Missing MONGO_URL, MONGO_URI, or MONGODB_URI in .env");
  }

  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      console.log("MongoDB connected");
      return mongoose;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};

module.exports = connectDB;
