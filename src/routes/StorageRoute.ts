import express from "express";
import StorageController from "../controllers/StorageController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, StorageController.getStorageInfo.bind(StorageController));

export default router;
