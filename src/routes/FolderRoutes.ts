import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import FolderController from "../controllers/FolderController";

const router = express.Router();

router.post("/", authMiddleware, FolderController.createFolder.bind(FolderController));
router.get("/", authMiddleware, FolderController.getUserFolders.bind(FolderController));
router.get("/:folderId", authMiddleware, FolderController.getFolderById.bind(FolderController));
router.put("/:folderId", authMiddleware, FolderController.updateFolderById.bind(FolderController));
router.delete("/:folderId", authMiddleware, FolderController.deleteFolderById.bind(FolderController));
router.post("/delete-multiple", authMiddleware, FolderController.deleteMultipleFoldersById.bind(FolderController));
router.get("/smart-search/:folderId", authMiddleware, FolderController.smartSearch.bind(FolderController));

export default router;
