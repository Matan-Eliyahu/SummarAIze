import express from "express";
import transcribeController from "../controllers/transcribeController";
import authMiddleware from "../common/authMiddleware";
import upload from "../common/upload";

const router = express.Router();

//router.post("/pdf", authMiddleware, upload.single("file"), transcribeController.pdf);
//router.post("/image", authMiddleware, upload.single("file"), transcribeController.image);
//router.post("/audio", authMiddleware, upload.single("file"), transcribeController.audio);
router.post("/summary", authMiddleware, upload.single("file"), transcribeController.summary);
router.post("/adjustment", authMiddleware, transcribeController.summaryAdjustment);

export default router;
