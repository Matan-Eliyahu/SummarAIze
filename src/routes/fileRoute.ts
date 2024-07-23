import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import FileController from "../controllers/FileController";

const router = express.Router();

router.get("/", authMiddleware, FileController.getUserFiles.bind(FileController));
router.get("/:fileName", authMiddleware, FileController.getFileByName.bind(FileController));
router.put("/:fileName", authMiddleware, FileController.updateFileByName.bind(FileController));
router.delete("/:fileName", authMiddleware, FileController.deleteFileByName.bind(FileController));

export default router;
