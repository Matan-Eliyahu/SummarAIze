import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import SummarizeController from "../controllers/SummarizeController";

const router = express.Router();

router.post("/:fileId", authMiddleware, SummarizeController.summarize.bind(SummarizeController));

export default router;
