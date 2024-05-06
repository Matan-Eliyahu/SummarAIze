import express from "express";
import transcribeController from "../controllers/transcribeController";
import authMiddleware from "../common/authMiddleware";
import upload from "../common/upload";

const router = express.Router();

router.post("/pdf", authMiddleware, upload.single("file"), transcribeController.pdf);
router.post("/image", authMiddleware, upload.single("file"), transcribeController.image);
router.post("/audio", authMiddleware, upload.single("file"), transcribeController.audio);

export default router;
