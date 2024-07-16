import multer, { Multer } from "multer";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../controllers/AuthController";
import { getFileType } from "../utils/files";

export const UPLOADS_PATH = path.join(__dirname, "..", "..", "public", "uploads");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder based on file type
    const userId = (req as AuthRequest).user._id;
    const type = getFileType(file.mimetype)
    const destinationPath = path.join(UPLOADS_PATH, userId, type);
    // Check if the directory exists, create it if it doesn't
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload: Multer = multer({ storage: storage });

export default upload;
