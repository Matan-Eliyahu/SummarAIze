import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import FolderController from "../controllers/FolderController";

const router = express.Router();

router.post("/", authMiddleware, FolderController.createFolder.bind(FolderController));
router.get("/", authMiddleware, FolderController.getUserFolders.bind(FolderController));
router.put("/:id", authMiddleware, FolderController.updateFolder.bind(FolderController));
router.delete("/:id", authMiddleware, FolderController.deleteFolder.bind(FolderController));

export default router;
