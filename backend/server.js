require("dotenv").config();

const missing = ["MONGO_URL", "JWT_SECRET"].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")} (copy .env.example to .env)`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET is too short. Use at least 32 random characters.");
  process.exit(1);
}

const app = require("./app");
const connectDB = require("./database/connection");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((error) => {
    console.error("Failed to start:", error.message);
    process.exit(1);
  });
