import express from "express";
import AuthController from "../controllers/AuthController";

const router = express.Router();

router.get("/check-email", AuthController.checkEmail.bind(AuthController));
router.post("/register", AuthController.register.bind(AuthController));
router.post("/login", AuthController.login.bind(AuthController));
router.post("/google", AuthController.googleLogin.bind(AuthController));
router.post("/facebook", AuthController.facebookLogin.bind(AuthController));
router.get("/logout", AuthController.logout.bind(AuthController));
router.get("/refresh", AuthController.refreshToken.bind(AuthController));

export default router;
