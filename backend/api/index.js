const app = require("../app");
const connectDB = require("../database/connection");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      success: false,
      message: "Database unavailable. Check MONGO_URL and MongoDB Atlas network access.",
    }));
    return;
  }

  return app(req, res);
};
