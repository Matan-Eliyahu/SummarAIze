import express from "express";
import SummarizeController from "../controllers/SummarizeController";
import authMiddleware from "../middleware/auth";
import upload from "../common/upload";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), SummarizeController.createSummary.bind(SummarizeController));
router.post("/adjust", authMiddleware, SummarizeController.summaryAdjustment.bind(SummarizeController));

export default router;
