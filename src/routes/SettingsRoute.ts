import express from "express";
import SettingsController from "../controllers/SettingsController";

const router = express.Router();

router.get("/:userId", SettingsController.getSettingsByUserId.bind(SettingsController));
router.put("/:userId", SettingsController.updateSettingsByUserId.bind(SettingsController));

export default router;
