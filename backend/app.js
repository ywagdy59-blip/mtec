
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const leadRoutes = require("./routes/leadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const courseRoutes = require("./routes/courseRoutes");
const catogeryRoutes = require("./routes/catogeryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Controllers
const { stripeWebhook } = require("./controllers/paymentController");

// Middleware
const { apiLimiter } = require("./middleware/rateLimit");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

// 1. Hide Express information from response headers
app.disable("x-powered-by");

// 2. Configure proxy if running behind a reverse proxy
const trustProxy = process.env.TRUST_PROXY?.trim().toLowerCase();
if (trustProxy) {
  if (trustProxy === "true") {
    app.set("trust proxy", 1);
  } else if (trustProxy === "false") {
    app.set("trust proxy", false);
  } else {
    const proxyHops = Number(trustProxy);
    if (!/^\d+$/.test(trustProxy) || !Number.isSafeInteger(proxyHops)) {
      throw new Error(
        "TRUST_PROXY must be true, false, or a non-negative integer."
      );
    }

    app.set("trust proxy", proxyHops);
  }
}

// 3. Security headers
app.use(helmet());

// 4. CORS configuration
const normalizeOrigin = (url) =>
  url.trim().replace(/\/+$/, "");

const allowedOrigins = new Set(
  (
    process.env.CLIENT_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://mtec-rrrg.vercel.app"
      : "http://localhost:5173")
  )
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean)
);

if (process.env.NODE_ENV !== "production") {
  for (const port of [5173, 5174]) {
    allowedOrigins.add(`http://localhost:${port}`);
    allowedOrigins.add(`http://127.0.0.1:${port}`);
  }
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(
        new Error("This origin is not allowed by CORS")
      );
    },
    exposedHeaders: ["Content-Disposition"],
  })
);

// 5. Stripe webhook must receive the raw body before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// 6. API rate limiting
app.use("/api", apiLimiter);

// 7. Parse JSON request bodies
app.use(express.json({ limit: "20kb" }));

// 8. Health checks
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MTEC SkillUp API",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
  });
});

// 9. API Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/catogery", catogeryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// 10. Handle unknown routes
app.use(notFound);

// 11. Error handler must be last
app.use(errorHandler);

module.exports = app;
