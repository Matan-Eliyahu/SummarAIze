import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import upload, { returnPictureUrl } from "../common/multer";
import saveFilesInfo from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/files", authMiddleware, upload.array("files", 10), saveFilesInfo);
router.post("/profile-picture",authMiddleware, upload.single("profile-picture"), returnPictureUrl);

export default router;
