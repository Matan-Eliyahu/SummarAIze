import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import upload from "../common/multer";
import saveFilesInfo from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/", authMiddleware, upload.array("files", 5), saveFilesInfo);

export default router;
