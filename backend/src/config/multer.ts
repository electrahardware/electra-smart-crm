import multer from "multer";
import path from "path";
import fs from "fs";

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
});