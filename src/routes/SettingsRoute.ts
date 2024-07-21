import express from "express";
import SettingsController from "../controllers/SettingsController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/",authMiddleware ,SettingsController.getSettingsByUserId.bind(SettingsController));
router.put("/", authMiddleware,SettingsController.updateSettingsByUserId.bind(SettingsController));

export default router;
