const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RevokedToken = require("../models/RevokedToken");

const JWT_ERRORS = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];

const unauthorized = (res, message = "Authentication required") =>
  res.status(401).json({ success: false, message });

// Protects private endpoints: valid token + not logged out + active user
const auth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) return unauthorized(res);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });

    if (await RevokedToken.exists({ jti: decoded.jti })) {
      return unauthorized(res, "Session has ended. Please log in again");
    }

    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) return unauthorized(res, "Invalid or expired token");

    req.user = user;
    req.token = { jti: decoded.jti, exp: decoded.exp };
    next();
  } catch (error) {
    if (JWT_ERRORS.includes(error.name)) return unauthorized(res, "Invalid or expired token");
    next(error);
  }
};

module.exports = auth;
