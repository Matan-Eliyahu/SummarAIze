import multer, { Multer } from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../controllers/AuthController';
import { getFileType } from '../utils/files';

export const UPLOADS_PATH = path.join(__dirname, "..", "..", "public", "uploads");

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'];

const fileFilter = (req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = (req as AuthRequest).user._id;
    const type = getFileType(file.mimetype);
    const destinationPath = path.join(UPLOADS_PATH, userId, type);
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload: Multer = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
