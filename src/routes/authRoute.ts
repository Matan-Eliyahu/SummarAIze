import express from "express";
import AuthController from "../controllers/AuthController";

const router = express.Router();

router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.post("/google", AuthController.googleSignin.bind(AuthController));
router.get("/logout", AuthController.logout.bind(AuthController));
router.get("/refresh", AuthController.refreshToken.bind(AuthController));

export default router;
