import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import FileController from "../controllers/FileController";

const router = express.Router();

router.get("/user-files", authMiddleware, FileController.getUserFiles.bind(FileController));
router.get("/:fileName", authMiddleware, FileController.getFileByName.bind(FileController));

export default router;
