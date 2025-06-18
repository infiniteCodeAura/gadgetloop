// middleware/upload.middleware.js
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/productImage"); // make sure this path exists or create it
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({ storage, limits: { files: 5 } });

export const uploadMedia = async (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "Maximum 5 files allowed." });
      }
      return res.status(400).json({ message: err.message });
    }

    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: "Maximum 5 files are allowed." });
    }

    //  Move to next only if no response has been sent
    return next();
  });
};
