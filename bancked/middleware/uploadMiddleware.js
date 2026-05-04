import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // or use diskStorage for file uploads
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".pdf"]);
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);
const maxFileSize = Number(process.env.MAX_UPLOAD_FILE_SIZE || 10 * 1024 * 1024);

export const isAllowedUploadFile = (file) => {
  const extension = path.extname(file.originalname || "").toLowerCase();

  return allowedExtensions.has(extension) && allowedMimeTypes.has(file.mimetype);
};

export const fileFilter = (_req, file, cb) => {
  if (!isAllowedUploadFile(file)) {
    const error = new Error("Only JPG, PNG, and PDF files are allowed");
    error.status = 422;
    return cb(error);
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: Number(process.env.MAX_UPLOAD_FILES || 10),
  },
});

export default upload;
