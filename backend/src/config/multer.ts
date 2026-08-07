import multer from "multer";
import path from "path";
import fs from "fs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/csv",
]);

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".pdf", ".xlsx", ".csv"]);

const uploadPath = path.join(
  process.cwd(),
  "uploads"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    const name =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(null, name + ext);
  },
});

export default multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter(_req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, PNG, PDF, XLSX, and CSV files up to 10 MB are allowed."));
    }

    cb(null, true);
  },
});
