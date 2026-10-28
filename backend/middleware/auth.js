
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");

const JWT_ERRORS = [
  "JsonWebTokenError",
  "TokenExpiredError",
  "NotBeforeError",
];

const unauthorized = (res, message = "Authentication required") =>
  res.status(401).json({
    success: false,
    message,
  });

const getAuthenticatedUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  if (
    !decoded.sub ||
    !decoded.jti ||
    !decoded.exp ||
    (await RevokedToken.exists({ jti: decoded.jti }))
  ) {
    return null;
  }

  const user = await User.findById(decoded.sub);

  if (!user || !user.isActive) {
    return null;
  }

  return { user, decoded };
};

// Required authentication
const auth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : null;

  if (!token) {
    return unauthorized(res);
  }

  try {
    const result = await getAuthenticatedUser(token);

    if (!result) {
      return unauthorized(res, "Invalid or expired token");
    }

    req.user = result.user;
    req.token = {
      jti: result.decoded.jti,
      exp: result.decoded.exp,
    };

    return next();
  } catch (error) {
    if (JWT_ERRORS.includes(error.name)) {
      return unauthorized(res, "Invalid or expired token");
    }

    return next(error);
  }
};

// Optional authentication: visitors can access published courses
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return next();
  }

  if (!header.startsWith("Bearer ") || !header.slice(7).trim()) {
    return unauthorized(res, "Invalid authorization header");
  }

  try {
    const result = await getAuthenticatedUser(header.slice(7).trim());

    if (!result) {
      return unauthorized(res, "Invalid or expired token");
    }

    req.user = result.user;
    req.token = {
      jti: result.decoded.jti,
      exp: result.decoded.exp,
    };

    return next();
  } catch (error) {
    if (JWT_ERRORS.includes(error.name)) {
      return unauthorized(res, "Invalid or expired token");
    }

    return next(error);
  }
};

auth.optional = optionalAuth;

module.exports = auth;
