import multer from "multer";

const storage = multer.memoryStorage();

const projectFileFilter = (req, file, cb) => {
  if (file.fieldname === "photos") {
    const allowedPhotoTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
    ];
    if (allowedPhotoTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid photo format in "${file.originalname}". Only JPG, PNG, and HEIC images are allowed.`),
        false
      );
    }
  } else if (file.fieldname === "attachments") {
    const allowedAttachmentTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedAttachmentTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid attachment format in "${file.originalname}". Only PDF, DOCX, and XLSX files are allowed.`),
        false
      );
    }
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

export const uploadProjectMedia = multer({
  storage,
  fileFilter: projectFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: "photos" },
  { name: "attachments" },
]);

export const handleUpload = (req, res, next) => {
  uploadProjectMedia(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size limit exceeded (Max 10MB per file).",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload processing failed.",
      });
    }
    next();
  });
};