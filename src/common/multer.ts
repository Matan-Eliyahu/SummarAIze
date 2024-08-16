import multer, { Multer } from "multer";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../controllers/AuthController";
import { getFileType } from "../utils/files";
import FileService from "../services/FileService";

export const UPLOADS_PATH = path.join(__dirname, "..", "..", "public", "uploads");
export const PROFILE_PICTURES_PATH = path.join(__dirname, "..", "..", "public", "profile-pictures");

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "audio/mpeg", "audio/wav"];

const fileFilter = (req: AuthRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const storage = multer.diskStorage({
  destination: function (req: AuthRequest, file: Express.Multer.File, cb) {
    const userId = req.user._id;
    let destinationPath: string;

    if (req.path.includes("profile-picture")) {
      destinationPath = PROFILE_PICTURES_PATH;
    } else {
      const type = getFileType(file.mimetype);
      destinationPath = path.join(UPLOADS_PATH, userId, type);
    }

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: async function (req: AuthRequest, file: Express.Multer.File, cb) {
    const userId = req.user._id;
    try {
      if (req.path.includes("profile-picture")) {
        const profilePicName = userId + path.extname(file.originalname);
        cb(null, profilePicName);
      } else {
        const uniqueFileName = await FileService.generateUniqueFileName(userId, file.originalname);
        cb(null, uniqueFileName);
      }
    } catch (error) {
      cb(error, file.originalname);
    }
  },
});

export function returnPictureUrl(req: AuthRequest, res: Response) {
  if (req.file && req.file.filename) {
    const userId = req.user._id;
    const imageUrl = `${req.protocol}://${req.get("host")}/profile-pictures/${userId}${path.extname(req.file.originalname)}`;

    res.json({ imageUrl });
  } else {
    res.status(400).json("No file uploaded");
  }
}

const upload: Multer = multer({ storage, fileFilter });

export default upload;
