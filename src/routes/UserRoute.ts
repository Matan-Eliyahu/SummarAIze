import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import UserController from "../controllers/UserController";

const router = express.Router();

router.put("/update-plan", authMiddleware, UserController.updatePlan.bind(UserController));

export default router;
