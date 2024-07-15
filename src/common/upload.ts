import multer, { Multer } from "multer";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../common/authMiddleware";

export const UPLOADS_PATH = path.join(__dirname, "..", "..", "public", "uploads");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder based on file type
    const userId = (req as AuthRequest).user?._id || "unknown";
    let fileType = "";
    if (file.mimetype.startsWith("image")) {
      fileType = "images";
    } else if (file.mimetype.startsWith("audio")) {
      fileType = "audio";
    } else {
      fileType = "pdf";
    }
    const destinationPath = path.join(UPLOADS_PATH, userId, fileType);
    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    // Define the filename
    cb(null, file.originalname);
  },
});

// Init upload
const upload: Multer = multer({ storage: storage });

export default upload;
