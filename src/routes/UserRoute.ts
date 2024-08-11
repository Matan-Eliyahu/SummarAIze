import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import UserController from "../controllers/UserController";

const router = express.Router();

router.get("/", authMiddleware, UserController.getUser.bind(UserController));
router.put("/", authMiddleware, UserController.updateUser.bind(UserController));
router.delete("/", authMiddleware, UserController.deleteUser.bind(UserController));
router.put("/plan", authMiddleware, UserController.updatePlan.bind(UserController));

export default router;
