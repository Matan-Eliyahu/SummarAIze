import express from "express";
import SummarizeController from "../controllers/SummarizeController";
import authMiddleware from "../middleware/authMiddleware";
import upload from "../common/multer";

const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), SummarizeController.createSummary.bind(SummarizeController));
router.post("/adjust", authMiddleware, SummarizeController.summaryAdjustment.bind(SummarizeController));

export default router;
