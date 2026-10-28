const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Safe errors: details are logged on the server, never sent to the client in production
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "This record already exists";
  }

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON format";
  }

  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large";
  }

  if (err.message === "This origin is not allowed by CORS") statusCode = 403;

  if (statusCode >= 500) {
    console.error(err);
    message = "Internal server error";
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
