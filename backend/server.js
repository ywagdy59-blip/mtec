
require("dotenv").config();

const app = require("./app");
const connectDB = require("./database/connection");

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error(
        "Missing MONGO_URL, MONGO_URI, or MONGODB_URI in .env"
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in .env");
    }

    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET is too short. Use at least 32 random characters."
      );
    }

    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
