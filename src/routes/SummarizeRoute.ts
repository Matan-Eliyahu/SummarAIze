import express from "express";
import SummarizeController from "../controllers/SummarizeController";
import authMiddleware from "../common/authMiddleware";
import upload from "../common/upload";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), SummarizeController.createSummary.bind(SummarizeController));
// router.post("/adjustment", authMiddleware, transcribeController.summaryAdjustment);

export default router;
