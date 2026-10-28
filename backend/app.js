const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.disable("x-powered-by");
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

app.use(helmet());

const allowedOrigins = new Set(
  (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      callback(new Error("This origin is not allowed by CORS"));
    },
    exposedHeaders: ["Content-Disposition"],
  })
);

app.use(express.json({ limit: "20kb" }));
app.use("/api", apiLimiter);

app.get("/", (req, res) => res.json({ success: true, message: "MTEC Leads API" }));
app.get("/api/health", (req, res) => res.json({ success: true }));

app.use("/api", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
