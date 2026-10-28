// Authorization: only admins can pass (always used after auth)
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only" });
  }
  next();
};

module.exports = admin;
