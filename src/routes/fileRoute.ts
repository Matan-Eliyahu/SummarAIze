import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import FileController from "../controllers/FileController";

const router = express.Router();

router.get("/", authMiddleware, FileController.getUserFiles.bind(FileController));
router.get("/:fileId", authMiddleware, FileController.getFileById.bind(FileController));
router.put("/:fileId", authMiddleware, FileController.updateFileById.bind(FileController));
router.delete("/:fileId", authMiddleware, FileController.deleteFileById.bind(FileController));
router.post("/delete-multiple", authMiddleware, FileController.deleteMultipleFilesById.bind(FileController));

export default router;
