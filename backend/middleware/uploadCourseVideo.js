const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");

const videoDirectory = path.join(__dirname, "..", "uploads", "videos");
const allowedExtensions = new Set([
  ".avi",
  ".m4v",
  ".mkv",
  ".mov",
  ".mp4",
  ".mpeg",
  ".mpg",
  ".webm",
]);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    fs.mkdir(videoDirectory, { recursive: true }, (error) => {
      callback(error, videoDirectory);
    });
  },
  filename(req, file, callback) {
    callback(
      null,
      `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (
      !file.mimetype.startsWith("video/") ||
      !allowedExtensions.has(extension)
    ) {
      const error = new Error("Only supported video files can be uploaded");
      error.statusCode = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("video");

module.exports = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) return next(error);

    if (req.file) {
      res.once("finish", () => {
        if (res.statusCode >= 400) {
          fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError && unlinkError.code !== "ENOENT") {
              console.error("Failed to remove rejected course video:", unlinkError);
            }
          });
        }
      });
    }

    next();
  });
};
